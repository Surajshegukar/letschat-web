"use client";

import React from "react";
import { mockRooms, initialOliviaMessages } from "@/constants/mock-data";
import { useChatWindow } from "@/hooks/use-chat-window";
import { EmptyChatState } from "./EmptyChatState";
import { ChatHeader } from "./ChatHeader";
import { MessageFeed } from "./MessageFeed";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
  activeRoomId: string | null;
  onToggleDetails: () => void;
  isDetailsOpen: boolean;
  onStartAudioCall?: (name: string, avatarUrl?: string) => void;
  onStartVideoCall?: (name: string, avatarUrl?: string) => void;
}

export function ChatWindow({
  activeRoomId,
  onToggleDetails,
  isDetailsOpen,
  onStartAudioCall,
  onStartVideoCall,
}: ChatWindowProps) {
  const {
    inputText,
    setInputText,
    sendMessage,
    sendVoiceNote,
    sendAttachment,
    activeMessages,
    messagesEndRef,
  } = useChatWindow(activeRoomId, { olivia: initialOliviaMessages });

  // 1. EMPTY STATE RENDER
  if (!activeRoomId) {
    return <EmptyChatState />;
  }

  // Find active room info
  const room = mockRooms.find((r) => r.id === activeRoomId);
  const roomName = room ? room.name : "Chat Room";
  const avatarUrl = room?.avatar;
  const isGroup = room?.type === "group";
  const isOnline = room?.isOnline;

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
      />

      <MessageFeed
        messages={activeMessages}
        activeRoomId={activeRoomId}
        messagesEndRef={messagesEndRef}
        isTyping={activeRoomId === "olivia"}
        typingSenderName="Olivia"
      />

      <MessageInput
        inputText={inputText}
        onChangeInput={setInputText}
        onSendMessage={sendMessage}
        onSendVoiceNote={sendVoiceNote}
        onSendAttachment={sendAttachment}
      />
    </div>
  );
}
export default ChatWindow;
