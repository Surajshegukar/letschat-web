import React from "react";
import { Download, FileText, CheckCheck } from "lucide-react";
import { Message } from "@/types/chat";
import { AudioPlayBubble } from "./AudioPlayBubble";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.senderId === "me";

  // Attachment Card Rendering
  if (message.attachment) {
    const type = message.attachment.type || "document";

    if (type === "audio") {
      return (
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          <div className="flex items-center gap-2 mb-1">
            {!isMe && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-100">
                {message.senderName}
              </span>
            )}
            <span className="text-[10px] text-zinc-400">{message.timestamp}</span>
          </div>
          <AudioPlayBubble
            duration={message.attachment.size}
            senderAvatar={message.senderAvatar || (isMe ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" : undefined)}
            isMe={isMe}
          />
        </div>
      );
    }

    if (type === "image") {
      const imageUrl = message.attachment.url || "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600";
      return (
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          <div className="flex items-center gap-2 mb-1">
            {!isMe && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-100">
                {message.senderName}
              </span>
            )}
            <span className="text-[10px] text-zinc-400">{message.timestamp}</span>
          </div>
          <div className="w-[280px] sm:w-[320px] rounded-2xl border border-zinc-200/80 bg-white shadow-md p-2.5 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden text-left">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800">
              <img
                src={imageUrl}
                className="w-full h-full object-cover"
                alt="Attachment Preview"
              />
            </div>
            {message.content && (
              <p className="text-xs text-slate-700 dark:text-zinc-350 mt-2 px-1 font-semibold leading-relaxed">
                {message.content}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Default: document
    return (
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          {!isMe && (
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-100">
              {message.senderName}
            </span>
          )}
          <span className="text-[10px] text-zinc-400">{message.timestamp}</span>
        </div>
        <div className="w-[280px] sm:w-[320px] rounded-2xl border border-zinc-200/80 bg-white shadow-md p-3 dark:border-zinc-800 dark:bg-zinc-900 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-emerald-500/10 dark:bg-emerald-950/20 text-[#19E68C] rounded-xl flex-shrink-0">
                <FileText className="h-7 w-7" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
                  {message.attachment.name}
                </p>
                <p className="text-[9px] text-zinc-450 leading-none mt-1">
                  {message.attachment.size}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition text-zinc-500 flex-shrink-0">
              <Download className="h-4 w-4" />
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
