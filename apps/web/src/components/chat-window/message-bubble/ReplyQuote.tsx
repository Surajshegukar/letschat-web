import React from "react";

interface ReplyQuoteProps {
  replyTo: { id: string; senderName: string; content: string };
  onScrollToReply: () => void;
}

export function ReplyQuote({ replyTo, onScrollToReply }: ReplyQuoteProps) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onScrollToReply(); }}
      className="mb-1.5 p-2 bg-black/5 dark:bg-white/5 border-l-2 border-emerald-500 rounded-lg text-left text-[11px] leading-relaxed opacity-85 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
    >
      <span className="font-extrabold text-emerald-600 dark:text-[#19E68C] block uppercase tracking-wide text-[9px]">
        {replyTo.senderName}
      </span>
      <p className="truncate mt-0.5 text-slate-700 dark:text-zinc-300">{replyTo.content}</p>
    </div>
  );
}
