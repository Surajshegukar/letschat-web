"use client";

import React from "react";
import { useConversations } from "@/hooks/api/use-conversations";
import { useAuthStore } from "@/store/auth-store";
import { formatConversation, RawConversation } from "@/utils/chat-helpers";
import { useRealtimeStore } from "@/store/realtime-store";
import { useChatWindow } from "@/hooks/use-chat-window";
import { EmptyChatState } from "./EmptyChatState";
import { ChatHeader } from "./ChatHeader";
import { MessageFeed } from "./MessageFeed";
import { MessageInput } from "./MessageInput";
import { useSocket } from "@/providers/socket-provider";

interface ChatWindowProps {
  activeRoomId: string | null;
  onToggleDetails: () => void;
  isDetailsOpen: boolean;
  onStartAudioCall?: (name: string, avatarUrl?: string) => void;
  onStartVideoCall?: (name: string, avatarUrl?: string) => void;
  onBack?: () => void;
}

const EMPTY_ARRAY: string[] = [];

export function ChatWindow({
  activeRoomId,
  onToggleDetails,
  isDetailsOpen,
  onStartAudioCall,
  onStartVideoCall,
  onBack,
}: ChatWindowProps) {
  const {
    inputText,
    setInputText,
    sendMessage,
    sendVoiceNote,
    sendAttachment,
    sendFiles,
    activeMessages,
    messagesEndRef,
  } = useChatWindow(activeRoomId);

  const { data: convResponse } = useConversations();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const rawConversations = convResponse?.data?.conversations;

  const room = React.useMemo(() => {
    if (!activeRoomId || !currentUserId || !rawConversations) return null;
    const raw = rawConversations.find((c: { _id: string }) => c._id === activeRoomId);
    if (!raw) return null;
    return formatConversation(raw as unknown as RawConversation, currentUserId);
  }, [rawConversations, activeRoomId, currentUserId]);

  const typingUsers = useRealtimeStore((state) => {
    if (!activeRoomId) return EMPTY_ARRAY;
    return state.typingUsers[activeRoomId] || EMPTY_ARRAY;
  });
  const isSomeoneTyping = typingUsers.length > 0;
  const typingSenderName = typingUsers.join(", ");

  const { isConnected } = useSocket();
  const onlineUsers = useRealtimeStore((state) => state.onlineUsers);

  // 1. EMPTY STATE RENDER
  if (!activeRoomId) {
    return <EmptyChatState />;
  }

  const roomName = room ? room.name : "Chat Room";
  const avatarUrl = room?.avatar;
  const isGroup = room?.type === "group";
  const isOnline = isConnected
    ? room?.type !== "group" && !!room?.partnerId && onlineUsers.has(room.partnerId)
    : !!room?.isOnline;

  // 2. ACTIVE CHAT STATE RENDER
  return (
    <div className="flex-1 h-full flex flex-col bg-[#FAFAFC] dark:bg-[#09090B] select-text">
      <ChatHeader
        roomName={roomName}
        avatarUrl={avatarUrl}
        isGroup={isGroup}
        isOnline={isOnline}
        isDetailsOpen={isDetailsOpen}
        onToggleDetails={onToggleDetails}
        onStartAudioCall={onStartAudioCall ? () => onStartAudioCall(roomName, avatarUrl) : undefined}
        onStartVideoCall={onStartVideoCall ? () => onStartVideoCall(roomName, avatarUrl) : undefined}
        onBack={onBack}
      />

      <MessageFeed
        messages={activeMessages}
        activeRoomId={activeRoomId}
        messagesEndRef={messagesEndRef}
        isTyping={isSomeoneTyping}
        typingSenderName={typingSenderName}
      />

      <MessageInput
        inputText={inputText}
        onChangeInput={setInputText}
        onSendMessage={sendMessage}
        onSendVoiceNote={sendVoiceNote}
        onSendAttachment={sendAttachment}
        onSendFiles={sendFiles}
      />
    </div>
  );
}
export default ChatWindow;
