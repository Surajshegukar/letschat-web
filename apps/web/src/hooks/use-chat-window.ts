import { useState, useEffect, useRef, useMemo } from "react";
import { Message } from "@/types/chat";
import { useAuthStore } from "@/store/auth-store";
import { useMessages, useSendMessage, useUploadAttachments } from "@/hooks/api/use-conversations";
import { formatMessage, RawMessage } from "@/utils/chat-helpers";
import { useSocket } from "@/providers/socket-provider";
import { useChatStore } from "@/store/chat-store";

export function useChatWindow(
  activeRoomId: string | null,
  _initialMessages?: Record<string, Message[]>
) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const sendMessageMutation = useSendMessage();
  const uploadAttachmentsMutation = useUploadAttachments();
  const { socket, isConnected } = useSocket();

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(activeRoomId);

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Manage typing indicators based on input changes
  useEffect(() => {
    if (!socket || !isConnected || !activeRoomId) return;

    if (inputText.trim().length > 0) {
      if (!isTypingRef.current) {
        socket.emit("typing_start", { conversationId: activeRoomId });
        isTypingRef.current = true;
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_stop", { conversationId: activeRoomId });
        isTypingRef.current = false;
      }, 3000);
    } else {
      if (isTypingRef.current) {
        socket.emit("typing_stop", { conversationId: activeRoomId });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [inputText, activeRoomId, socket, isConnected]);

  // Clean up typing indicator on room change or unmount
  useEffect(() => {
    return () => {
      if (socket && isConnected && activeRoomId && isTypingRef.current) {
        socket.emit("typing_stop", { conversationId: activeRoomId });
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeRoomId, socket, isConnected]);

  // Flatten and format messages from all pages
  const activeMessages = useMemo(() => {
    if (!messagesData || !currentUserId) return [];
    
    // Flatten messages across all paginated pages
    const allRawMessages = messagesData.pages.flatMap(
      (page) => page.data.messages || []
    );

    // Deduplicate by _id — guards against socket races and optimistic update remnants
    const seen = new Set<string>();
    const uniqueMessages = allRawMessages.filter((msg: RawMessage) => {
      const id = (msg as any)._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Map raw messages to client structure and reverse to get chronological ascending order (oldest to newest)
    return uniqueMessages
      .map((msg: RawMessage) => formatMessage(msg, currentUserId))
      .reverse();
  }, [messagesData, currentUserId]);

  const lastMessageId = activeMessages[activeMessages.length - 1]?.id;
  const prevLastMessageIdRef = useRef<string | undefined>(undefined);
  const prevActiveRoomIdRef = useRef<string | null>(null);

  // Auto-scroll logic optimized for pagination
  useEffect(() => {
    const isRoomChanged = activeRoomId !== prevActiveRoomIdRef.current;
    const isNewMessageArrived = lastMessageId !== prevLastMessageIdRef.current;

    if (isRoomChanged || (isNewMessageArrived && lastMessageId)) {
      messagesEndRef.current?.scrollIntoView({
        behavior: isRoomChanged ? "auto" : "smooth",
      });
    }

    prevActiveRoomIdRef.current = activeRoomId;
    prevLastMessageIdRef.current = lastMessageId;
  }, [lastMessageId, activeRoomId]);

  const replyingToMessage = useChatStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useChatStore((state) => state.setReplyingToMessage);

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    sendMessageMutation.mutate({
      conversationId: activeRoomId,
      data: {
        content: inputText,
        type: "text",
        replyTo: replyingToMessage ? replyingToMessage.id : undefined,
      },
    });
    setInputText("");
    setReplyingToMessage(null);
  };

  const sendVoiceNote = (file: File, duration: string) => {
    if (!activeRoomId) return;

    const formData = new FormData();
    formData.append("files", file);

    uploadAttachmentsMutation.mutate(
      { conversationId: activeRoomId, formData },
      {
        onSuccess: (response) => {
          const filesData = response.data.files || [];
          const uploadedFile = filesData[0];
          if (uploadedFile) {
            const parts = duration.split(":");
            const secs = parseInt(parts[0] || "0", 10) * 60 + parseInt(parts[1] || "0", 10);

            sendMessageMutation.mutate({
              conversationId: activeRoomId,
              data: {
                content: "",
                type: "audio",
                attachments: [{
                  url: uploadedFile.url,
                  filename: uploadedFile.filename,
                  mimeType: uploadedFile.mimeType,
                  size: secs,
                }],
                replyTo: replyingToMessage ? replyingToMessage.id : undefined,
              },
            });
          }
          setReplyingToMessage(null);
        },
      }
    );
  };

  const sendAttachment = (type: "image" | "document") => {
    console.log("Attachment sending scaffolded:", type);
  };

  const sendFiles = (files: File[], captions: string[] = []) => {
    if (!activeRoomId) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    uploadAttachmentsMutation.mutate(
      { conversationId: activeRoomId, formData },
      {
        onSuccess: (response) => {
          const filesData = response.data.files || [];
          filesData.forEach((file: any, index: number) => {
            sendMessageMutation.mutate({
              conversationId: activeRoomId,
              data: {
                content: captions[index] || "",
                type: file.type,
                attachments: [{ url: file.url, filename: file.filename, mimeType: file.mimeType, size: file.size }],
                replyTo: replyingToMessage ? replyingToMessage.id : undefined,
              },
            });
          });
          setReplyingToMessage(null);
        },
      }
    );
  };

  return {
    inputText,
    setInputText,
    sendMessage,
    sendVoiceNote,
    sendAttachment,
    sendFiles,
    activeMessages,
    messagesEndRef,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

export type UseChatWindowReturn = ReturnType<typeof useChatWindow>;
