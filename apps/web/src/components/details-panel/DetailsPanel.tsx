"use client";

import React from "react";
import { mockRooms } from "@/constants/mock-data";
import { DetailsHeader } from "./DetailsHeader";
import { DetailsProfileCard } from "./DetailsProfileCard";
import { DetailsAbout } from "./DetailsAbout";
import { DetailsSharedAssets } from "./DetailsSharedAssets";
import { DetailsSettings } from "./DetailsSettings";

interface DetailsPanelProps {
  activeRoomId?: string | null;
  onClose: () => void;
  onOpenMedia?: () => void;
}

export function DetailsPanel({ activeRoomId, onClose, onOpenMedia }: DetailsPanelProps) {
  // Find active room info to dynamically populate details
  const room = activeRoomId ? mockRooms.find((r) => r.id === activeRoomId) : null;
  const name = room ? room.name : "Olivia Rhye";
  const avatarUrl = room?.avatar;
  const status = room ? (room.isOnline ? "Online" : "Offline") : "Online";

  return (
    <div className="fixed inset-0 z-40 md:static md:z-auto md:w-80 md:h-full md:flex-shrink-0 flex flex-col border-l border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 select-none">
      <DetailsHeader onClose={onClose} />

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <DetailsProfileCard name={name} avatarUrl={avatarUrl} status={status} />

        <DetailsAbout />

        <DetailsSharedAssets onOpenMedia={onOpenMedia} />

        <DetailsSettings />
      </div>
    </div>
  );
}
export default DetailsPanel;
