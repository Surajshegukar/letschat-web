import React from "react";
import { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageFeedProps {
  messages: Message[];
  activeRoomId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isTyping?: boolean;
  typingSenderName?: string;
}

export function MessageFeed({
  messages,
  activeRoomId,
  messagesEndRef,
  isTyping = false,
  typingSenderName = "Olivia",
}: MessageFeedProps) {
  return (
    <div
      className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-zinc-50/90 dark:bg-[#09090B]/95 dark:bg-blend-multiply relative"
      style={{
        backgroundImage: "url('/assets/images/wallpaper.png')",
        backgroundSize: "360px",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="relative z-2 h-full">
        {/* Today Centered Divider */}
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800 text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
            Today
          </span>
        </div>

        {/* Message items list */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>

        {/* Typing Indicator */}
        {isTyping && activeRoomId === "olivia" && (
          <div className="flex flex-col items-start mt-2">
            <div className="flex items-center gap-1 bg-white border border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-800/80 px-4 py-2.5 rounded-full shadow-sm text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span className="flex gap-1 items-center mr-1">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#19E68C] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#19E68C] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#19E68C] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </span>
              <span>{typingSenderName} is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
export default MessageFeed;
