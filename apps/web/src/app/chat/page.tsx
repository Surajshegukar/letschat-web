"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { DetailsPanel } from "@/components/chat/DetailsPanel";

export default function ChatPage() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    // Auto-open details panel if a chat is selected to mirror design
    setIsDetailsOpen(true);
  };

  const handleToggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  return (
    <main className="h-screen w-screen flex bg-zinc-100 dark:bg-zinc-950 overflow-hidden font-sans select-none">
      
      {/* Pane 1: Main Sidebar Nav (Chats, Mentions, Pinned, Profile info) */}
      <Sidebar />

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
      />

      {/* Pane 4: Details Panel side menu, visible when toggled and chat is active */}
      {isDetailsOpen && activeRoomId && (
        <DetailsPanel onClose={handleToggleDetails} />
      )}

    </main>
  );
}
