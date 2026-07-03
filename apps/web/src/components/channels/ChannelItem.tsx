import React from "react";
import { Channel } from "@/types/channels";

interface ChannelItemProps {
  channel: Channel;
  isActive?: boolean;
  onClick?: () => void;
  showFollowButton?: boolean;
  onFollowToggle?: () => void;
}

export function ChannelItem({
  channel,
  isActive = false,
  onClick,
  showFollowButton = false,
  onFollowToggle,
}: ChannelItemProps) {
  const lastUpdate = channel.updates[channel.updates.length - 1];

  if (showFollowButton) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
        <img
          src={channel.avatar}
          className="h-11 w-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
          alt={channel.name}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
            {channel.name}
          </p>
          <p className="text-[10px] text-zinc-450 mt-0.5">
            {channel.followers.toLocaleString()} followers
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
            {channel.description}
          </p>
        </div>
        
        {onFollowToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollowToggle();
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#19E68C]/15 dark:bg-zinc-900 hover:bg-emerald-500 hover:text-white dark:hover:bg-[#19E68C] dark:hover:text-[#09090B] text-emerald-650 dark:text-[#19E68C] transition"
          >
            Follow
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition text-left ${
        isActive
          ? "bg-[#19E68C]/12 border border-[#19E68C]/20 shadow-sm"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 border border-transparent"
      }`}
    >
      <img
        src={channel.avatar}
        className="h-11 w-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
        alt={channel.name}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
            {channel.name}
          </p>
          {lastUpdate && (
            <span className="text-[10px] text-zinc-450 flex-shrink-0">
              {lastUpdate.timestamp}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-450 mt-1 truncate">
          {lastUpdate ? lastUpdate.content : channel.description}
        </p>
      </div>
    </button>
  );
}

export default ChannelItem;
