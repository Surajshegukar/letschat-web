import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { conversationService } from "@/services/conversation-service";
import { toast } from "sonner";

/**
 * Hook to retrieve user conversations list.
 */
export function useConversations(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationService.getConversations(page, limit),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create/start a new conversation.
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: "direct" | "group";
      participantIds: string[];
      name?: string;
      description?: string;
    }) => conversationService.createConversation(data),
    onSuccess: (response) => {
      // Invalidate conversation query to fetch updated list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message =
        apiError.response?.data?.message || "Failed to create conversation";
      toast.error(message);
    },
  });
}

/**
 * Hook to fetch paginated messages inside a conversation using infinite queries.
 */
export function useMessages(conversationId: string | null, limit: number = 50) {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }) =>
      conversationService.getMessages(
        conversationId!,
        pageParam as string | undefined,
        limit
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor || undefined,
    enabled: !!conversationId,
  });
}

/**
 * Hook to send a message inside a conversation.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: {
      conversationId: string;
      data: {
        content?: string;
        type?: "text" | "image" | "audio" | "video" | "document" | "system";
        replyTo?: string;
        attachments?: {
          url: string;
          filename: string;
          mimeType: string;
          size: number;
        }[];
      };
    }) => conversationService.sendMessage(args.conversationId, args.data),
    onSuccess: (response, variables) => {
      // Invalidate the message history for the specific room to trigger refresh
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      // Also update conversations list to show newest lastMessage preview
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to send message";
      toast.error(message);
    },
  });
}

/**
 * Hook to pin/unpin a conversation.
 */
export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationService.pinConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to pin conversation";
      toast.error(message);
    },
  });
}

/**
 * Hook to archive/unarchive a conversation.
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationService.archiveConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to archive conversation";
      toast.error(message);
    },
  });
}

type MessagesCache = { pages: { data: { messages: any[] } }[] };

/**
 * Hook to edit a message — optimistic update so UI reflects change immediately.
 */
export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { conversationId: string; messageId: string; content: string }) =>
      conversationService.editMessage(args.conversationId, args.messageId, args.content),
    onMutate: async (variables) => {
      const key = ["messages", variables.conversationId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MessagesCache>(key);
      queryClient.setQueryData<MessagesCache>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((msg: any) =>
                msg._id === variables.messageId
                  ? { ...msg, content: variables.content, isEdited: true }
                  : msg
              ),
            },
          })),
        };
      });
      return { previous, key };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error("Failed to edit message");
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
    },
  });
}

/**
 * Hook to delete a message — optimistic update so UI reflects change immediately.
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { conversationId: string; messageId: string }) =>
      conversationService.deleteMessage(args.conversationId, args.messageId),
    onMutate: async (variables) => {
      const msgKey = ["messages", variables.conversationId];
      await queryClient.cancelQueries({ queryKey: msgKey });
      const previousMessages = queryClient.getQueryData<MessagesCache>(msgKey);

      queryClient.setQueryData<MessagesCache>(msgKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((msg: any) =>
                msg._id === variables.messageId
                  ? { ...msg, isDeleted: true, content: "This message was deleted", attachments: [] }
                  : msg
              ),
            },
          })),
        };
      });

      return { previousMessages, msgKey };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousMessages) queryClient.setQueryData(context.msgKey, context.previousMessages);
      toast.error("Failed to delete message");
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
    },
  });
}

/**
 * Hook to react to a message with an emoji.
 */
export function useReactToMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { conversationId: string; messageId: string; emoji: string }) =>
      conversationService.reactToMessage(args.conversationId, args.messageId, args.emoji),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to add reaction";
      toast.error(message);
    },
  });
}

/**
 * Hook to upload multiple attachments.
 */
export function useUploadAttachments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { conversationId: string; formData: FormData }) =>
      conversationService.uploadAttachments(args.conversationId, args.formData),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to upload files";
      toast.error(message);
    },
  });
}
