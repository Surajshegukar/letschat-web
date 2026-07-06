import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/providers/socket-provider";
import { useRealtimeStore } from "@/store/realtime-store";
import { useChatStore } from "@/store/chat-store";

export function useSocketEvents() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const { setUserOnline, setUserOffline, setOnlineUsers, setTyping, removeTyping } = useRealtimeStore();
  const activeRoomId = useChatStore((state) => state.activeRoomId);

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
      const conversationId = message.conversationId as string | undefined;
      if (conversationId) {
        // Invalidate the specific message list (exact: false covers ["messages", id] key)
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId], exact: false });
        // Also refresh the sidebar to update lastMessage preview
        queryClient.invalidateQueries({ queryKey: ["conversations"], exact: false });

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
