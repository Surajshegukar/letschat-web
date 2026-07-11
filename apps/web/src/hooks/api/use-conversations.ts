import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { conversationService } from "@/services/conversation-service";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useSocket } from "@/providers/socket-provider";
import { useMetricsStore } from "@/store/metrics-store";

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
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { socket, isConnected } = useSocket();

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
    }) => {
      // If WebSockets are connected, use direct Socket.IO connection (WebSocket-first)
      if (socket && isConnected) {
        return new Promise<any>((resolve, reject) => {
          socket.emit("send_message", args, (response: any) => {
            if (response && response.status === "success") {
              resolve(response);
            } else {
              reject(new Error(response?.message || "Failed to send message via WebSockets"));
            }
          });
        });
      }

      // Otherwise, fallback to REST API
      return conversationService.sendMessage(args.conversationId, args.data);
    },
    onMutate: async (variables) => {
      // Start tracking API calls for this message
      useMetricsStore.getState().startMessageApiTracking();

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages", variables.conversationId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["messages", variables.conversationId]);

      const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Optimistically update to the new value
      queryClient.setQueryData(["messages", variables.conversationId], (old: any) => {
        if (!old) return old;

        const optimisticMessage = {
          _id: tempId,
          conversationId: variables.conversationId,
          senderId: currentUserId || "",
          type: variables.data.type || "text",
          content: variables.data.content || "",
          attachments: variables.data.attachments || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: [],
          deliveredTo: [],
          readBy: [],
          isSending: true,
        };

        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) => {
            if (idx === 0) {
              return {
                ...page,
                data: {
                  ...page.data,
                  messages: [optimisticMessage, ...page.data.messages],
                },
              };
            }
            return page;
          }),
        };
      });

      return { previousMessages, tempId };
    },
    onSuccess: (response, variables, context) => {
      const serverMessage = response?.data?.message;
      if (!serverMessage) return;

      const tempId = context?.tempId;

      // Update messages cache: replace the specific optimistic message with the server message
      queryClient.setQueryData(["messages", variables.conversationId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((m: any) =>
                m._id === tempId ? serverMessage : m
              ),
            },
          })),
        };
      });

      // Update the conversations list cache directly to show the newest lastMessage preview
      queryClient.setQueryData(["conversations"], (old: any) => {
        if (!old?.data?.conversations) return old;

        const conversations = old.data.conversations.map((c: any) => {
          if (c._id === variables.conversationId) {
            return {
              ...c,
              lastMessage: {
                content: serverMessage.content || (serverMessage.attachments?.length ? `[${serverMessage.type}]` : ""),
                senderId: serverMessage.senderId,
                timestamp: serverMessage.createdAt,
                type: serverMessage.type,
              },
            };
          }
          return c;
        });

        // Re-sort conversations so the most recent is at the top
        const sorted = [...conversations].sort((a: any, b: any) => {
          const timeA = new Date(a.lastMessage?.timestamp || a.createdAt).getTime();
          const timeB = new Date(b.lastMessage?.timestamp || b.createdAt).getTime();
          return timeB - timeA;
        });

        return {
          ...old,
          data: {
            ...old.data,
            conversations: sorted,
          },
        };
      });
    },
    onError: (error: unknown, variables, context) => {
      const tempId = context?.tempId;
      if (tempId) {
        // Rollback only the specific failed optimistic message from cache
        queryClient.setQueryData(["messages", variables.conversationId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                messages: page.data.messages.filter((m: any) => m._id !== tempId),
              },
            })),
          };
        });
      } else if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", variables.conversationId],
          context.previousMessages
        );
      }

      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to send message";
      toast.error(message);
    },
    onSettled: () => {
      useMetricsStore.getState().stopMessageApiTracking();
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

/**
 * Hook to delete a conversation.
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.deleteConversation(conversationId),
    onSuccess: (data, conversationId) => {
      queryClient.setQueryData(["messages", conversationId], { pages: [], pageParams: [] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation deleted");
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to delete conversation";
      toast.error(message);
    },
  });
}

/**
 * Hook to clear a conversation's messages.
 */
export function useClearConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.clearConversation(conversationId),
    onSuccess: (data, conversationId) => {
      queryClient.setQueryData(["messages", conversationId], { pages: [], pageParams: [] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Chat cleared");
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to clear chat";
      toast.error(message);
    },
  });
}

/**
 * Hook to toggle starring a message.
 */
export function useStarMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { conversationId: string; messageId: string }) =>
      conversationService.starMessage(args.conversationId, args.messageId),
    onMutate: async (variables) => {
      const msgKey = ["messages", variables.conversationId];
      await queryClient.cancelQueries({ queryKey: msgKey });
      const previousMessages = queryClient.getQueryData<any>(msgKey);

      queryClient.setQueryData<any>(msgKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((msg: any) =>
                msg._id === variables.messageId
                  ? { ...msg, isStarred: !msg.isStarred }
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
      toast.error("Failed to star message");
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
    },
  });
}

/**
 * Hook to update group settings (name, description, avatar).
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; data: { name?: string; description?: string; avatar?: string } }) =>
      conversationService.updateGroup(args.id, args.data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", variables.id] });
      toast.success("Group updated successfully");
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to update group";
      toast.error(message);
    },
  });
}

/**
 * Hook to add participants to a group.
 */
export function useAddParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; participantIds: string[] }) =>
      conversationService.addParticipants(args.id, args.participantIds),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", variables.id] });
      toast.success("Participants added successfully");
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to add participants";
      toast.error(message);
    },
  });
}

/**
 * Hook to remove a participant or leave the group.
 */
export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; userId: string }) =>
      conversationService.removeParticipant(args.id, args.userId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", variables.id] });
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to remove participant";
      toast.error(message);
    },
  });
}

/**
 * Hook to promote a participant to admin.
 */
export function usePromoteToAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; userId: string }) =>
      conversationService.promoteToAdmin(args.id, args.userId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", variables.id] });
      toast.success("Participant promoted to admin");
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      const message = apiError.response?.data?.message || "Failed to promote participant";
      toast.error(message);
    },
  });
}
