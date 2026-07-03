import React from "react";
import { MessageSquare } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex-1 h-full bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative flex items-center justify-center h-24 w-24">
        <div className="absolute inset-0 rounded-full border border-dashed border-[#19E68C] animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[#00C9FF]/10 to-[#19E68C]/10 filter blur-sm animate-pulse" />
        <MessageSquare className="h-9 w-9 text-emerald-500/80 dark:text-[#19E68C]/80" />
      </div>
      <h3 className="mt-8 text-xl font-bold text-slate-800 dark:text-zinc-200">
        Let's Chat Web
      </h3>
      <p className="mt-2 text-sm text-zinc-450 max-w-sm">
        Select a conversation from the sidebar list to view direct messages, group threads, and media.
      </p>
    </div>
  );
}

export default EmptyChatState;
