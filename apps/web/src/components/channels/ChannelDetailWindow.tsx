import React from "react";
import { Radio, Check, Plus, X, Share2, Compass, Heart, ThumbsUp, Flame, Laugh, Smile, ArrowLeft } from "lucide-react";
import { Channel } from "@/types/channels";
import { ChannelUpdateBubble } from "./ChannelUpdateBubble";

interface ChannelDetailWindowProps {
  activeChannel: Channel | null;
  onClearSelection: () => void;
  onFollowToggle: (channelId: string) => void;
  onReactToStory: (channelId: string, storyId: string, emoji: string) => void;
  showBack?: boolean;
}

const EMOJIS = ["❤️", "👍", "🔥", "😂", "😮", "🙏"];

export function ChannelDetailWindow({
  activeChannel,
  onClearSelection,
  onFollowToggle,
  onReactToStory,
  showBack,
}: ChannelDetailWindowProps) {
  if (!activeChannel) {
    /* 1. EMPTY STATE */
    return (
      <div className="flex-1 h-full bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative flex items-center justify-center h-24 w-24">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#19E68C] animate-[spin_16s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[#00C9FF]/10 to-[#19E68C]/10 filter blur-sm animate-pulse" />
          <Radio className="h-9 w-9 text-emerald-500/80 dark:text-[#19E68C]/80" />
        </div>
        <h3 className="mt-8 text-xl font-bold text-slate-800 dark:text-zinc-200">
          Explore Broadcasts
        </h3>
        <p className="mt-2 text-sm text-zinc-450 max-w-sm">
          Select followed channels from your list, or follow recommended channels to view official updates.
        </p>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Channel link copied to clipboard!");
  };

  return (
    <div className="flex-1 h-full bg-zinc-50 dark:bg-[#0c0c0e] flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* 2. Top Header Bar */}
      <div className="h-16 md:h-20 px-4 md:px-6 border-b border-zinc-200/80 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
          {showBack && (
            <button
              onClick={onClearSelection}
              className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 -ml-1 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <img
            src={activeChannel.avatar}
            className="h-11 w-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
            alt={activeChannel.name}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
              {activeChannel.name}
            </h3>
            <p className="text-[10px] text-zinc-450 mt-0.5">
              {activeChannel.followers.toLocaleString()} followers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Channel */}
          <button
            onClick={handleShare}
            className="p-2 hover:bg-zinc-150/60 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
            title="Copy Link"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>

          {/* Follow/Unfollow State Toggle */}
          <button
            onClick={() => onFollowToggle(activeChannel.id)}
            className={`h-9 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeChannel.isFollowed
                ? "border border-zinc-250 dark:border-zinc-800 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 text-slate-655 dark:text-zinc-400"
                : "bg-gradient-to-r from-[#00C9FF] to-[#19E68C] text-white hover:opacity-95"
            }`}
          >
            {activeChannel.isFollowed ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>

          {/* Close Panel Button */}
          <button
            onClick={onClearSelection}
            className="p-2 hover:bg-zinc-150/60 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500"
            title="Close feed"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* 3. Broadcast Stream Scroll Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center">
        {/* About Channel Intro Bubble */}
        <div className="w-full max-w-xl text-center bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-2 mt-2">
          <img
            src={activeChannel.avatar}
            className="h-16 w-16 rounded-full object-cover mx-auto border border-zinc-200 dark:border-zinc-800"
            alt={activeChannel.name}
          />
          <h4 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            Welcome to {activeChannel.name}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            {activeChannel.description}
          </p>
          <div className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase pt-2">
            Announcements & Official Broadcasts
          </div>
        </div>

        {/* Stories List */}
        {activeChannel.updates.map((story) => (
          <ChannelUpdateBubble
            key={story.id}
            channelId={activeChannel.id}
            story={story}
            onReactToStory={onReactToStory}
          />
        ))}
      </div>

      {/* 4. Bottom Information Board */}
      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex justify-center text-center flex-shrink-0 z-10">
        {activeChannel.isFollowed ? (
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span>You are following this channel. Real-time updates will broadcast here.</span>
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-2">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-300">
                Want to receive updates?
              </p>
              <p className="text-[10px] text-zinc-450 mt-0.5">
                Join the followers to see announcements direct in your feed.
              </p>
            </div>
            <button
              onClick={() => onFollowToggle(activeChannel.id)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#00C9FF] to-[#19E68C] text-white hover:opacity-95 shadow-md shadow-[#00C9FF]/10 select-none"
            >
              Follow Channel
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default ChannelDetailWindow;
