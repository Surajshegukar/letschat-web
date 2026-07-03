import React from "react";
import { Smile } from "lucide-react";
import { ChannelStory } from "@/types/channels";

interface ChannelUpdateBubbleProps {
  channelId: string;
  story: ChannelStory;
  onReactToStory: (channelId: string, storyId: string, emoji: string) => void;
}

const EMOJIS = ["❤️", "👍", "🔥", "😂", "😮", "🙏"];

export function ChannelUpdateBubble({
  channelId,
  story,
  onReactToStory,
}: ChannelUpdateBubbleProps) {
  return (
    <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl shadow-sm p-4 relative flex flex-col gap-3 group/story hover:shadow-md transition duration-300">
      {/* Image attachment */}
      {story.image && (
        <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 max-h-72 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
          <img
            src={story.image}
            className="w-full h-full object-cover"
            alt="Broadcast Attachment"
          />
        </div>
      )}

      {/* Broadcast Content */}
      <p className="text-sm text-slate-750 dark:text-zinc-250 leading-relaxed break-words whitespace-pre-wrap">
        {story.content}
      </p>

      {/* Footer Row */}
      <div className="flex justify-between items-center mt-1 border-t border-zinc-50 dark:border-zinc-850/50 pt-2 flex-wrap gap-2">
        {/* Emojis Reaction Bubble Group */}
        <div className="flex flex-wrap items-center gap-1">
          {story.reactions
            .filter((r) => r.count > 0)
            .map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReactToStory(channelId, story.id, reaction.emoji)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-zinc-100/70 hover:bg-zinc-200/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-semibold transition shadow-sm border border-transparent hover:border-emerald-500/20 active:scale-95"
              >
                <span>{reaction.emoji}</span>
                <span className="text-[10px]">{reaction.count}</span>
              </button>
            ))}

          {/* Quick Add Reaction Hover Trigger */}
          <div className="relative inline-block opacity-0 group-hover/story:opacity-100 focus-within:opacity-100 transition-opacity duration-300 pl-1">
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-full px-2 py-1 absolute bottom-full left-0 mb-1.5 -translate-x-10 scale-0 group-hover/story:scale-100 transition-all origin-bottom-left flex-row z-10">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReactToStory(channelId, story.id, emoji)}
                  className="text-sm hover:scale-125 transition active:scale-95 px-1 py-0.5"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button className="p-1 rounded-full bg-zinc-100/40 hover:bg-zinc-100 dark:bg-zinc-800/20 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500 transition">
              <Smile className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-zinc-450 font-medium select-none ml-auto">
          {story.timestamp}
        </span>
      </div>
    </div>
  );
}

export default ChannelUpdateBubble;
