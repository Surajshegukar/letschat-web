import React from "react";
import { Smile, CornerUpLeft, Pencil, Trash2 } from "lucide-react";
import { QUICK_REACTIONS } from "@/constants/emoji-data";

interface HoverActionsProps {
  isMe: boolean;
  canEditOrDelete: boolean;
  showReactionPicker: boolean;
  onToggleReactionPicker: (e: React.MouseEvent) => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function HoverActions({
  isMe,
  canEditOrDelete,
  showReactionPicker,
  onToggleReactionPicker,
  onReact,
  onReply,
  onEdit,
  onDelete,
}: HoverActionsProps) {
  return (
    <div className={`hidden group-hover:flex items-center gap-1 flex-shrink-0 ${isMe ? "order-first mr-2" : "order-last ml-2"}`}>
      {/* Reaction picker */}
      <div className="relative">
        <button
          type="button"
          onClick={onToggleReactionPicker}
          className={`p-2 rounded-full transition-colors hover:scale-105 ${
            showReactionPicker
              ? "bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-[#19E68C]"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-600"
          }`}
          title="React"
        >
          <Smile className="h-4 w-4" />
        </button>
        {showReactionPicker && (
          <div className="flex items-center gap-1 absolute bottom-10 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-full shadow-2xl z-30 animate-fadeIn">
            {QUICK_REACTIONS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => onReact(emoji)} className="hover:scale-125 active:scale-90 transition p-1 text-base leading-none">
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply */}
      <button
        type="button"
        onClick={onReply}
        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-600 rounded-full transition-colors hover:scale-105"
        title="Reply"
      >
        <CornerUpLeft className="h-4 w-4" />
      </button>

      {/* Edit — only own messages within 15 min */}
      {isMe && canEditOrDelete && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-emerald-500 dark:hover:text-[#19E68C] rounded-full transition-colors hover:scale-105"
          title="Edit message"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {/* Delete — only own messages within 15 min */}
      {isMe && canEditOrDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-rose-500 rounded-full transition-colors hover:scale-105"
          title="Delete message"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
