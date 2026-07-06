"use client";

import React from "react";
import { useConversations } from "@/hooks/api/use-conversations";
import { useAuthStore } from "@/store/auth-store";
import { formatConversation, RawConversation } from "@/utils/chat-helpers";
import { useRealtimeStore } from "@/store/realtime-store";
import { useSocket } from "@/providers/socket-provider";
import { DetailsHeader } from "./DetailsHeader";
import { DetailsProfileCard } from "./DetailsProfileCard";
import { DetailsAbout } from "./DetailsAbout";
import { DetailsSharedAssets } from "./DetailsSharedAssets";
import { DetailsSettings } from "./DetailsSettings";
import { GroupMembersList } from "./GroupMembersList";

interface DetailsPanelProps {
  activeRoomId?: string | null;
  onClose: () => void;
  onOpenMedia?: () => void;
}

export function DetailsPanel({ activeRoomId, onClose, onOpenMedia }: DetailsPanelProps) {
  const { data: convResponse } = useConversations();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { isConnected } = useSocket();
  const onlineUsers = useRealtimeStore((state) => state.onlineUsers);

  const rawConversations = convResponse?.data?.conversations;

  // Find active room info to dynamically populate details
  const rawActiveConv = React.useMemo(() => {
    if (!activeRoomId || !rawConversations) return null;
    return rawConversations.find((c: { _id: string }) => c._id === activeRoomId);
  }, [rawConversations, activeRoomId]);

  const room = React.useMemo(() => {
    if (!rawActiveConv || !currentUserId) return null;
    return formatConversation(rawActiveConv as unknown as RawConversation, currentUserId);
  }, [rawActiveConv, currentUserId]);

  if (!room) {
    return (
      <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 select-none items-center justify-center p-6 text-zinc-400">
        <span>No active conversation</span>
      </div>
    );
  }

  const name = room.name;
  const avatarUrl = room.avatar;
  const isOnline = isConnected
    ? room.type !== "group" && !!room.partnerId && onlineUsers.has(room.partnerId)
    : !!room.isOnline;

  const status = room.type === "group" ? "Group Chat" : isOnline ? "Online" : "Offline";
  const bio = room.type === "group"
    ? room.description || "No description set for this group."
    : room.about || "Hey there! I am using Let's Chat.";

  // Extract participants list for group chat display
  const participants = (rawActiveConv as any)?.participants || [];

  return (
    <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 select-none">
      <DetailsHeader onClose={onClose} />

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
        <DetailsProfileCard name={name} avatarUrl={avatarUrl} status={status} />

        <DetailsAbout bio={bio} />

        {room.type === "group" && participants.length > 0 && (
          <GroupMembersList
            participants={participants}
            currentUserId={currentUserId}
            onlineUsers={onlineUsers}
            isConnected={isConnected}
          />
        )}

        <DetailsSharedAssets onOpenMedia={onOpenMedia} />

        <DetailsSettings />
      </div>
    </div>
  );
}
export default DetailsPanel;
