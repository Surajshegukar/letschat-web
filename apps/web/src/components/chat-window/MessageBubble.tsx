import React from "react";
import { Download, FileText, CheckCheck } from "lucide-react";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.senderId === "me";

  // Attachment Card Rendering
  if (message.attachment) {
    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-zinc-400">{message.timestamp}</span>
        </div>
        <div className="w-[320px] rounded-2xl border border-zinc-200/80 bg-white shadow-md p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=400"
              className="w-full h-full object-cover opacity-90"
              alt="Attachment Preview"
            />
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-8 w-8 text-[#19E68C] flex-shrink-0" />
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
                  {message.attachment.name}
                </p>
                <p className="text-[10px] text-zinc-400 leading-none mt-1">
                  {message.attachment.size}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition text-zinc-500">
              <Download className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular Text Message Bubble Rendering
  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      {/* Message Meta Info */}
      <div className="flex items-center gap-2 mb-1">
        {!isMe && (
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-100">
            {message.senderName}
          </span>
        )}
        <span className="text-[10px] text-zinc-455">{message.timestamp}</span>
      </div>

      {/* Message Bubble Card */}
      <div
        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm ${isMe
          ? "bg-[#EAFDF5] text-emerald-955 rounded-tr-none dark:bg-zinc-800 dark:text-zinc-100"
          : "bg-white text-slate-800 rounded-tl-none border border-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800"
          }`}
      >
        {message.content}
      </div>

      {/* Read Receipt */}
      {isMe && (
        <div className="mt-1 flex justify-end">
          <CheckCheck className="h-3.5 w-3.5 text-[#19E68C]" />
        </div>
      )}
    </div>
  );
}
export default MessageBubble;
