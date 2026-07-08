import React from "react";
import { Message } from "@/types/chat";
import { MediaGroup } from "@/types/ui";
import { useMessageFeed } from "@/hooks/use-message-feed";
import { MessageBubble } from "./MessageBubble";
import { MediaGroupBubble } from "./MediaGroupBubble";

interface MessageFeedProps {
  messages: Message[];
  activeRoomId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isTyping?: boolean;
  typingSenderName?: string;
  searchQuery?: string;
  isSelectionMode?: boolean;
  selectedMessageIds?: Set<string>;
  onToggleSelectMessage?: (messageId: string) => void;
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-start mt-2">
      <div className="flex items-center gap-1 bg-white border border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-800/80 px-4 py-2.5 rounded-full shadow-sm text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <span className="flex gap-1 items-center mr-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-[#19E68C] animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span>{name} is typing...</span>
      </div>
    </div>
  );
}

export function MessageFeed({
  messages,
  messagesEndRef,
  isTyping = false,
  typingSenderName = "Olivia",
  searchQuery = "",
  isSelectionMode = false,
  selectedMessageIds = new Set(),
  onToggleSelectMessage,
}: MessageFeedProps) {
  const feedItems = useMessageFeed(messages);

  return (
    <div
      className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-transparent relative"
    >
      <div className="relative z-2 h-full">
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800 text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
            Today
          </span>
        </div>

        <div className="space-y-4">
          {feedItems.map((item) =>
            (item as MediaGroup).type === "media_group" ? (
              <MediaGroupBubble
                key={item.id}
                group={item as MediaGroup}
                isSelectionMode={isSelectionMode}
                selectedMessageIds={selectedMessageIds}
                onToggleSelectMessage={onToggleSelectMessage}
              />
            ) : (
              <MessageBubble
                key={item.id}
                message={item as Message}
                highlightQuery={searchQuery}
                isSelectionMode={isSelectionMode}
                selectedMessageIds={selectedMessageIds}
                onToggleSelectMessage={onToggleSelectMessage}
              />
            )
          )}
        </div>

        {isTyping && <TypingIndicator name={typingSenderName} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default MessageFeed;
