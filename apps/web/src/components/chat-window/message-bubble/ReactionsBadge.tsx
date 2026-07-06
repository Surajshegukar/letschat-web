import React from "react";

interface Reaction {
  emoji: string;
  userIds: string[];
}

interface ReactionsBadgeProps {
  reactions: Reaction[];
  isMe: boolean;
}

export function ReactionsBadge({ reactions, isMe }: ReactionsBadgeProps) {
  if (reactions.length === 0) return null;
  const total = reactions.reduce((sum, r) => sum + r.userIds.length, 0);

  return (
    <div
      className={`absolute -bottom-2 flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 px-1.5 py-0.5 rounded-full shadow-md text-[10px] font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all z-10 ${
        isMe ? "right-4" : "left-4"
      }`}
    >
      <span className="flex items-center gap-0.5 leading-none">
        {reactions.map((r) => r.emoji).join("")}
      </span>
      {total > 1 && (
        <span className="text-zinc-500 dark:text-zinc-400 text-[9px] leading-none">{total}</span>
      )}
    </div>
  );
}
