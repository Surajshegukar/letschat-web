import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/providers/socket-provider";
import { useRealtimeStore } from "@/store/realtime-store";
import { useChatStore } from "@/store/chat-store";

export function useSocketEvents() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const { setUserOnline, setUserOffline, setOnlineUsers, setTyping, removeTyping } = useRealtimeStore();
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const processedMessageIds = useRef(new Set<string>());

  // Emit read_conversation when active conversation changes
  useEffect(() => {
    if (!socket || !isConnected || !activeRoomId) return;
    socket.emit("read_conversation", { conversationId: activeRoomId });
  }, [socket, isConnected, activeRoomId]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onInitialOnlineUsers = (userIds: string[]) => {
      setOnlineUsers(userIds);
    };

    const onNewConversation = (conversation: Record<string, unknown>) => {
      // Refresh the sidebar conversation list
      queryClient.invalidateQueries({ queryKey: ["conversations"], exact: false });
      // Join the socket room for this conversation so new messages are received
      const convId =
        (conversation._id as string) ||
        (conversation.id as string);
      if (convId) {
        socket.emit("join_room", convId);
      }
    };

    const onNewMessage = (message: Record<string, unknown>) => {
      const messageId = message._id as string | undefined;
      if (!messageId) return;

      if (processedMessageIds.current.has(messageId)) {
        return;
      }
      processedMessageIds.current.add(messageId);

      // Prevent unbounded memory growth by keeping the set size capped
      if (processedMessageIds.current.size > 1000) {
        const firstVal = processedMessageIds.current.values().next().value;
        if (firstVal !== undefined) {
          processedMessageIds.current.delete(firstVal);
        }
      }

      const conversationId = message.conversationId as string | undefined;
      if (conversationId) {
        // Append new message directly to react-query messages cache
        queryClient.setQueryData(["messages", conversationId], (old: any) => {
          if (!old) return old;

          // Check if the message is already in the cache (by official _id or temporary id)
          const messageExists = old.pages.some((page: any) =>
            page.data.messages.some(
              (m: any) =>
                m._id === message._id ||
                (m._id.startsWith("temp-") &&
                  m.content === message.content &&
                  m.senderId === message.senderId)
            )
          );

          if (messageExists) {
            // Check if there is already an official ID message (e.g. from onSuccess)
            const hasOfficialId = old.pages.some((page: any) =>
              page.data.messages.some((m: any) => m._id === message._id)
            );
            if (hasOfficialId) return old;

            // Replace the temp message with the actual socket message
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: {
                  ...page.data,
                  messages: page.data.messages.map((m: any) =>
                    m._id.startsWith("temp-") &&
                      m.content === message.content &&
                      m.senderId === message.senderId
                      ? message
                      : m
                  ),
                },
              })),
            };
          }

          return {
            ...old,
            pages: old.pages.map((page: any, idx: number) => {
              if (idx === 0) {
                return {
                  ...page,
                  data: {
                    ...page.data,
                    messages: [message, ...page.data.messages],
                  },
                };
              }
              return page;
            }),
          };
        });

        // Directly update the lastMessage preview in the sidebar conversation list cache
        queryClient.setQueryData(["conversations"], (old: any) => {
          if (!old?.data?.conversations) return old;

          const conversations = old.data.conversations.map((c: any) => {
            if (c._id === conversationId) {
              return {
                ...c,
                lastMessage: {
                  content: (message.content as string) || (Array.isArray(message.attachments) && message.attachments.length ? `[${message.type}]` : ""),
                  senderId: message.senderId as string,
                  timestamp: message.createdAt as string,
                  type: message.type as any,
                },
                unreadCount: conversationId === activeRoomId ? 0 : (c.unreadCount || 0) + 1,
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

        // If this message arrived in the currently open active chat, mark it as read immediately
        if (conversationId === activeRoomId) {
          socket.emit("read_conversation", { conversationId });
        }
      }
    };

    const onUserOnline = ({ userId }: { userId: string }) => {
      setUserOnline(userId);
    };

    const onUserOffline = ({ userId }: { userId: string }) => {
      setUserOffline(userId);
    };

    const onMessagesDelivered = ({ conversationId }: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId], exact: false });
    };

    const onMessagesRead = ({ conversationId }: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["conversations"], exact: false });
    };

    const onTypingIndicator = ({
      conversationId,
      username,
    }: {
      conversationId: string;
      username: string;
    }) => {
      setTyping(conversationId, username);
    };

    const onTypingStopped = ({
      conversationId,
      username,
    }: {
      conversationId: string;
      username: string;
    }) => {
      removeTyping(conversationId, username);
    };

    const onMessageReaction = ({ conversationId }: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId], exact: false });
    };

    const onMessageEdited = ({ conversationId }: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId], exact: false });
    };

    const onMessageDeleted = ({ conversationId }: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["conversations"], exact: false });
    };

    socket.on("initial_online_users", onInitialOnlineUsers);
    socket.on("new_conversation", onNewConversation);
    socket.on("new_message", onNewMessage);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);
    socket.on("messages_delivered", onMessagesDelivered);
    socket.on("messages_read", onMessagesRead);
    socket.on("message_reaction", onMessageReaction);
    socket.on("message_edited", onMessageEdited);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("typing_indicator", onTypingIndicator);
    socket.on("typing_stopped", onTypingStopped);

    return () => {
      socket.off("initial_online_users", onInitialOnlineUsers);
      socket.off("new_conversation", onNewConversation);
      socket.off("new_message", onNewMessage);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      socket.off("messages_delivered", onMessagesDelivered);
      socket.off("messages_read", onMessagesRead);
      socket.off("message_reaction", onMessageReaction);
      socket.off("message_edited", onMessageEdited);
      socket.off("message_deleted", onMessageDeleted);
      socket.off("typing_indicator", onTypingIndicator);
      socket.off("typing_stopped", onTypingStopped);
    };
  }, [socket, isConnected, queryClient, setUserOnline, setUserOffline, setOnlineUsers, setTyping, removeTyping, activeRoomId]);
}
