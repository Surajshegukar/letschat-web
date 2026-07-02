"use client";

import React, { useState } from "react";
import { ChatList } from "@/components/chat-list/ChatList";
import { ChatWindow } from "@/components/chat-window/ChatWindow";
import { useCallStore } from "@/store/call-store";
import { DetailsPanel } from "@/components/details-panel/DetailsPanel";
import { MediaModal } from "@/components/details-panel/media-modal/MediaModal";
import { mockRooms } from "@/constants/mock-data";

export default function ChatPage() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const { startCall } = useCallStore();

  const activeRoom = mockRooms.find((r) => r.id === activeRoomId);
  const roomName = activeRoom ? activeRoom.name : "Chat Room";

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    // Auto-open details panel if a chat is selected to mirror design
    setIsDetailsOpen(true);
  };

  const handleToggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  return (
    <>

      {/* Pane 2: Chats list filter categories and conversation scroll feed */}
      <ChatList 
        activeRoomId={activeRoomId} 
        onSelectRoom={handleSelectRoom} 
      />

      {/* Pane 3: Chat Conversation Area or Empty State welcome loader */}
      <ChatWindow 
        activeRoomId={activeRoomId} 
        onToggleDetails={handleToggleDetails}
        isDetailsOpen={isDetailsOpen}
        onStartAudioCall={(name, avatar) => startCall(name, avatar, "audio")}
        onStartVideoCall={(name, avatar) => startCall(name, avatar, "video")}
      />

      {/* Pane 4: Details Panel side menu, visible when toggled and chat is active */}
      {isDetailsOpen && activeRoomId && (
        <DetailsPanel
          activeRoomId={activeRoomId}
          onClose={handleToggleDetails}
          onOpenMedia={() => setIsMediaModalOpen(true)}
        />
      )}

      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        roomName={roomName}
      />
    </>
  );
}
