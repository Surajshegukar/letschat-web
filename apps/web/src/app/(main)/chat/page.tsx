"use client";

import React, { useState } from "react";
import { ChatList } from "@/components/chat-list/ChatList";
import { ChatWindow } from "@/components/chat-window/ChatWindow";
import { useCallStore } from "@/store/call-store";
import { DetailsPanel } from "@/components/details-panel/DetailsPanel";
import { MediaModal } from "@/components/details-panel/media-modal/MediaModal";
import { useChatStore } from "@/store/chat-store";

export default function ChatPage() {
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setActiveRoomId = useChatStore((state) => state.setActiveRoomId);
  const rooms = useChatStore((state) => state.rooms);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const { startCall } = useCallStore();

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const roomName = activeRoom ? activeRoom.name : "Chat Room";

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    // Auto-open details panel if a chat is selected to mirror design
    // setIsDetailsOpen(true);
  };

  const handleToggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Pane 2: Chat list — hidden on mobile when a room is selected */}
      <div className={`${activeRoomId ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <ChatList
          activeRoomId={activeRoomId}
          onSelectRoom={handleSelectRoom}
        />
      </div>

      {/* Pane 3: Chat window — hidden on mobile when no room selected */}
      <div className={`${activeRoomId ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
        <ChatWindow
          activeRoomId={activeRoomId}
          onToggleDetails={handleToggleDetails}
          isDetailsOpen={isDetailsOpen}
          onStartAudioCall={(name, avatar) => startCall(name, avatar, "audio")}
          onStartVideoCall={(name, avatar) => startCall(name, avatar, "video")}
          onBack={() => setActiveRoomId(null)}
        />
      </div>

      {/* Pane 4: Details Panel */}
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
