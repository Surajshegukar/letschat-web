import React from "react";
import { Smile, CornerUpLeft } from "lucide-react";
import { QUICK_REACTIONS } from "@/constants/emoji-data";

interface HoverActionsProps {
  isMe: boolean;
  showReactionPicker: boolean;
  onToggleReactionPicker: (e: React.MouseEvent) => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
}

export function HoverActions({
  isMe,
  showReactionPicker,
  onToggleReactionPicker,
  onReact,
  onReply,
}: HoverActionsProps) {
  return (
    <div className={`hidden group-hover:flex items-center gap-1 flex-shrink-0 ${isMe ? "order-first mr-2" : "order-last ml-2"}`}>
      <div className="relative">
        <button
          type="button"
          onClick={onToggleReactionPicker}
          className={`p-2 rounded-full transition-colors hover:scale-105 ${
            showReactionPicker
              ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-[#19E68C]"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-650"
          }`}
          title="React"
        >
          <Smile className="h-4 w-4" />
        </button>

        {showReactionPicker && (
          <div className="flex items-center gap-1 absolute bottom-10 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-full shadow-2xl z-30 transition-all animate-fadeIn">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(emoji)}
                className="hover:scale-130 active:scale-90 transition p-1 text-base leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onReply}
        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-650 rounded-full transition-colors hover:scale-105"
        title="Reply"
      >
        <CornerUpLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
