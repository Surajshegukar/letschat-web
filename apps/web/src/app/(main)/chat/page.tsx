"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatList } from "@/components/chat-list/ChatList";
import { ChatWindow } from "@/components/chat-window/ChatWindow";
import { useCallStore } from "@/store/call-store";
import { DetailsPanel } from "@/components/details-panel/DetailsPanel";
import { MediaModal } from "@/components/details-panel/media-modal/MediaModal";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { useConversations } from "@/hooks/api/use-conversations";
import { formatConversation, RawConversation } from "@/utils/chat-helpers";
import { useSocketEvents } from "@/hooks/socket/use-socket-events";

export default function ChatPage() {
  useSocketEvents();

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setActiveRoomId = useChatStore((state) => state.setActiveRoomId);
  const { data: convResponse } = useConversations();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const { startCall } = useCallStore();

  // Auto-open conversation when navigated from a push notification click
  useEffect(() => {
    const convId = searchParams.get("conv");
    if (convId && convId !== activeRoomId) {
      setActiveRoomId(convId);
      // Clean up the URL so the conv= param doesn't stay in the address bar
      router.replace("/chat");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const rawConversations = convResponse?.data?.conversations;

  const activeRoom = React.useMemo(() => {
    if (!activeRoomId || !currentUserId || !rawConversations) return null;
    const raw = rawConversations.find((c: { _id: string }) => c._id === activeRoomId);
    if (!raw) return null;
    return formatConversation(raw as unknown as RawConversation, currentUserId);
  }, [rawConversations, activeRoomId, currentUserId]);

  const roomName = activeRoom ? activeRoom.name : "Chat Room";

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
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
