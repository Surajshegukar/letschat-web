import { useEffect, useRef, useCallback } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useSocket } from "@/providers/socket-provider";
import { useRealtimeStore } from "@/store/realtime-store";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { RawMessage, RawConversation } from "@/utils/chat-helpers";
import { showForegroundNotification } from "@/utils/push";

interface SocketRawMessage extends RawMessage {
  conversationId?: string;
  type?: "text" | "image" | "audio" | "video" | "document" | "system";
}

interface MessagesData {
  messages: SocketRawMessage[];
  nextCursor: string | null;
}

interface MessagesPage {
  data: MessagesData;
}

type MessagesInfiniteData = InfiniteData<MessagesPage>;

interface ConversationsCache {
  data: {
    conversations: RawConversation[];
  };
}

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
      const rawMsg = message as unknown as SocketRawMessage;
      const messageId = rawMsg._id;
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

      const conversationId = rawMsg.conversationId as string | undefined;
      if (conversationId) {
        // Append new message directly to react-query messages cache
        queryClient.setQueryData<MessagesInfiniteData>(["messages", conversationId], (old) => {
          if (!old) return old;

          const rawMsgSenderId = typeof rawMsg.senderId === "object" && rawMsg.senderId !== null ? rawMsg.senderId._id : rawMsg.senderId;

          // Check if the message is already in the cache (by official _id or temporary id)
          const messageExists = old.pages.some((page) =>
            page.data.messages.some((m) => {
              const mSenderId = typeof m.senderId === "object" && m.senderId !== null ? m.senderId._id : m.senderId;
              return (
                m._id === rawMsg._id ||
                (m._id.startsWith("temp-") &&
                  m.content === rawMsg.content &&
                  mSenderId === rawMsgSenderId)
              );
            })
          );

          if (messageExists) {
            // Check if there is already an official ID message (e.g. from onSuccess)
            const hasOfficialId = old.pages.some((page) =>
              page.data.messages.some((m) => m._id === rawMsg._id)
            );
            if (hasOfficialId) return old;

            // Replace the temp message with the actual socket message
            let replaced = false;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  messages: page.data.messages.map((m) => {
                    if (replaced) return m;
                    const mSenderId = typeof m.senderId === "object" && m.senderId !== null ? m.senderId._id : m.senderId;
                    const isMatch = m._id.startsWith("temp-") &&
                      m.content === rawMsg.content &&
                      mSenderId === rawMsgSenderId;
                    if (isMatch) {
                      replaced = true;
                      return rawMsg;
                    }
                    return m;
                  }),
                },
              })),
            };
          }

          return {
            ...old,
            pages: old.pages.map((page, idx) => {
              if (idx === 0) {
                return {
                  ...page,
                  data: {
                    ...page.data,
                    messages: [rawMsg, ...page.data.messages],
                  },
                };
              }
              return page;
            }),
          };
        });

        // Directly update the lastMessage preview in the sidebar conversation list cache
        queryClient.setQueryData<ConversationsCache>(["conversations"], (old) => {
          if (!old?.data?.conversations) return old;

          const rawMsgSenderId = typeof rawMsg.senderId === "object" && rawMsg.senderId !== null ? rawMsg.senderId._id : rawMsg.senderId;

          const conversations = old.data.conversations.map((c) => {
            if (c._id === conversationId) {
              return {
                ...c,
                lastMessage: {
                  content: rawMsg.content || (Array.isArray(rawMsg.attachments) && rawMsg.attachments.length ? `[${rawMsg.type || "text"}]` : ""),
                  senderId: rawMsgSenderId || "",
                  timestamp: rawMsg.createdAt || new Date().toISOString(),
                  type: rawMsg.type || "text",
                },
                unreadCount: conversationId === activeRoomId ? 0 : (c.unreadCount || 0) + 1,
              };
            }
            return c;
          });

          // Re-sort conversations so the most recent is at the top
          const sorted = [...conversations].sort((a, b) => {
            const timeA = new Date(a.lastMessage?.timestamp || a.updatedAt).getTime();
            const timeB = new Date(b.lastMessage?.timestamp || b.updatedAt).getTime();
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
        } else {
          // ── Foreground notification ──────────────────────────────────────
          // Fire a browser notification when a message arrives in a
          // background conversation (not the one the user currently has open)
          const currentUserId = useAuthStore.getState().user?.id;
          const rawMsgSenderId =
            typeof rawMsg.senderId === "object" && rawMsg.senderId !== null
              ? (rawMsg.senderId as { _id: string })._id
              : rawMsg.senderId;

          if (rawMsgSenderId !== currentUserId) {
            const senderName =
              typeof rawMsg.senderId === "object" && rawMsg.senderId !== null
                ? (rawMsg.senderId as { displayName?: string; username?: string }).displayName ||
                  (rawMsg.senderId as { displayName?: string; username?: string }).username ||
                  "Someone"
                : "Someone";
            const body = rawMsg.content || "[Media message]";

            showForegroundNotification(senderName, body, conversationId);
          }
          // ────────────────────────────────────────────────────────────────
        }
      }
    };

    const onUserOnline = ({ userId }: { userId: string }) => {
      setUserOnline(userId);
    };

    const onUserOffline = ({ userId }: { userId: string }) => {
      setUserOffline(userId);
    };

    const onMessagesDelivered = ({
      conversationId,
      userId,
      lastDeliveredMessageId,
    }: {
      conversationId: string;
      userId: string;
      lastDeliveredMessageId: string;
    }) => {
      queryClient.setQueryData<MessagesInfiniteData>(["messages", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((m) => {
                const mSenderId = typeof m.senderId === "object" && m.senderId !== null ? m.senderId._id : m.senderId;
                const isDeliveredUserSender = mSenderId === userId;
                if (!isDeliveredUserSender && m._id <= lastDeliveredMessageId) {
                  const alreadyDelivered = m.deliveredTo?.some((d) => {
                    const dUserId = typeof d.userId === "object" && d.userId !== null ? d.userId._id : d.userId;
                    return dUserId === userId;
                  });
                  if (alreadyDelivered) return m;
                  return {
                    ...m,
                    deliveredTo: [...(m.deliveredTo || []), { userId, deliveredAt: new Date().toISOString() }],
                  };
                }
                return m;
              }),
            },
          })),
        };
      });
    };

    const onMessagesRead = ({
      conversationId,
      userId,
      lastReadMessageId,
    }: {
      conversationId: string;
      userId: string;
      lastReadMessageId: string;
    }) => {
      queryClient.setQueryData<MessagesInfiniteData>(["messages", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((m) => {
                const mSenderId = typeof m.senderId === "object" && m.senderId !== null ? m.senderId._id : m.senderId;
                const isReaderSender = mSenderId === userId;
                if (!isReaderSender && m._id <= lastReadMessageId) {
                  const alreadyRead = m.readBy?.some((r) => {
                    const rUserId = typeof r.userId === "object" && r.userId !== null ? r.userId._id : r.userId;
                    return rUserId === userId;
                  });
                  if (alreadyRead) return m;
                  return {
                    ...m,
                    readBy: [...(m.readBy || []), { userId, readAt: new Date().toISOString() }],
                  };
                }
                return m;
              }),
            },
          })),
        };
      });

      const currentUserId = useAuthStore.getState().user?.id;
      if (userId === currentUserId) {
        queryClient.setQueryData<ConversationsCache>(["conversations"], (old) => {
          if (!old?.data?.conversations) return old;
          return {
            ...old,
            data: {
              ...old.data,
              conversations: old.data.conversations.map((c) =>
                c._id === conversationId ? { ...c, unreadCount: 0 } : c
              ),
            },
          };
        });
      }
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

    const onMessageReaction = ({
      conversationId,
      messageId,
      reactions,
    }: {
      conversationId: string;
      messageId: string;
      reactions: { emoji: string; userIds: string[] }[];
    }) => {
      queryClient.setQueryData<MessagesInfiniteData>(["messages", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((m) =>
                m._id === messageId ? { ...m, reactions } : m
              ),
            },
          })),
        };
      });
    };

    const onMessageEdited = ({
      conversationId,
      messageId,
      content,
    }: {
      conversationId: string;
      messageId: string;
      content: string;
    }) => {
      queryClient.setQueryData<MessagesInfiniteData>(["messages", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((m) =>
                m._id === messageId ? { ...m, content, isEdited: true } : m
              ),
            },
          })),
        };
      });
    };

    const onMessageDeleted = ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      queryClient.setQueryData<MessagesInfiniteData>(["messages", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((m) =>
                m._id === messageId
                  ? { ...m, isDeleted: true, content: "This message was deleted", attachments: [] }
                  : m
              ),
            },
          })),
        };
      });

      queryClient.setQueryData<ConversationsCache>(["conversations"], (old) => {
        if (!old?.data?.conversations) return old;
        return {
          ...old,
          data: {
            ...old.data,
            conversations: old.data.conversations.map((c) =>
              c._id === conversationId
                ? {
                    ...c,
                    lastMessage: {
                      content: "This message was deleted",
                      senderId: c.lastMessage?.senderId || "",
                      timestamp: new Date().toISOString(),
                      type: "system",
                      isDeleted: true,
                    },
                  }
                : c
            ),
          },
        };
      });
    };

    const onStatusUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    };

    const onConversationDeleted = ({ conversationId, type }: { conversationId: string; type?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      if (type !== "group" && conversationId === activeRoomId) {
        useChatStore.getState().setActiveRoomId(null);
      }
      socket.emit("leave_room", conversationId);
    };

    const onConversationUpdated = (conversation: any) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      const convId = conversation._id || conversation.id;
      if (convId === activeRoomId) {
        queryClient.invalidateQueries({ queryKey: ["messages", activeRoomId] });
      }
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
    socket.on("status_update", onStatusUpdate);
    socket.on("status_viewed", onStatusUpdate);
    socket.on("status_reacted", onStatusUpdate);
    socket.on("conversation_deleted", onConversationDeleted);
    socket.on("conversation_updated", onConversationUpdated);

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
      socket.off("status_update", onStatusUpdate);
      socket.off("status_viewed", onStatusUpdate);
      socket.off("status_reacted", onStatusUpdate);
      socket.off("conversation_deleted", onConversationDeleted);
      socket.off("conversation_updated", onConversationUpdated);
    };
  }, [socket, isConnected, queryClient, setUserOnline, setUserOffline, setOnlineUsers, setTyping, removeTyping, activeRoomId]);
}
