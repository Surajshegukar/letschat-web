import React from "react";
import { X } from "lucide-react";
import { Message } from "@/types/chat";

interface ReplyPreviewProps {
  message: Message;
  onDismiss: () => void;
}

export function ReplyPreview({ message, onDismiss }: ReplyPreviewProps) {
  return (
    <div className="mx-2 mb-2 p-3 bg-zinc-50 dark:bg-zinc-900 border-l-4 border-emerald-500 rounded-xl flex items-center justify-between animate-fadeIn">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold text-emerald-600 dark:text-[#19E68C] block uppercase tracking-wider">
          Replying to {message.senderName}
        </span>
        <p className="text-xs text-zinc-650 dark:text-zinc-300 truncate mt-1">{message.content}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition flex-shrink-0 ml-4"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
