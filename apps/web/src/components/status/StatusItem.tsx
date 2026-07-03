import React from "react";
import { UserStatus } from "@/types/status";
import { StatusAvatar } from "./StatusAvatar";

interface StatusItemProps {
  status: UserStatus;
  isActive: boolean;
  onClick: () => void;
  unreadCount: number;
}

export function StatusItem({
  status,
  isActive,
  onClick,
  unreadCount,
}: StatusItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition text-left ${
        isActive
          ? "bg-[#19E68C]/12 border border-[#19E68C]/20 shadow-sm"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 border border-transparent"
      }`}
    >
      <StatusAvatar
        src={status.userAvatar}
        storiesCount={status.stories.length}
        unreadCount={unreadCount}
        size={48}
        userName={status.userName}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
          {status.userName}
        </p>
        <p className="text-xs text-zinc-450 mt-1">
          {status.lastUpdated}
        </p>
      </div>
    </button>
  );
}

export default StatusItem;
