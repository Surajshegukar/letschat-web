import React from "react";
import { Play, Pause } from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { Avatar } from "../ui";
import { useAuthStore } from "@/store/auth-store";

const WAVEFORM_BARS = [40, 60, 20, 80, 50, 90, 30, 70, 40, 60, 85, 20, 55, 75, 45, 95, 30, 65, 80, 50];

interface AudioPlayBubbleProps {
  duration?: string;
  senderAvatar?: string;
  senderName?: string;
  isMe: boolean;
  url?: string;
}

export function AudioPlayBubble({
  duration = "0:12",
  senderAvatar,
  senderName,
  isMe,
  url,
}: AudioPlayBubbleProps) {
  const { isPlaying, progress, currentSeconds, togglePlay, formatTime } = useAudioPlayer(duration, url);
  const activeIdx = Math.floor((progress / 100) * WAVEFORM_BARS.length);

  const currentUser = useAuthStore((state) => state.user);
  const actualAvatar = isMe ? currentUser?.avatarUrl : senderAvatar;
  const actualName = isMe ? (currentUser?.displayName || currentUser?.username || "You") : senderName;

  return (
    <div className={`flex items-center gap-3 w-[280px] p-2.5 rounded-2xl ${
      isMe
        ? "bg-[#EAFDF5] text-emerald-955 border border-emerald-500/10"
        : "bg-white text-slate-800 border border-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
    }`}>
      <button
        onClick={togglePlay}
        className={`h-9 w-9 flex items-center justify-center rounded-full transition shadow-sm ${
          isMe
            ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95"
        }`}
      >
        {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-end gap-0.5 h-6 mb-1.5 opacity-80 pl-0.5">
          {WAVEFORM_BARS.map((val, idx) => (
            <div
              key={idx}
              className={`w-[3px] rounded-full transition-all duration-300 ${
                idx <= activeIdx
                  ? isMe ? "bg-emerald-600 dark:bg-[#19E68C]" : "bg-emerald-500"
                  : isMe ? "bg-emerald-500/20" : "bg-zinc-200 dark:bg-zinc-700"
              }`}
              style={{ height: `${val}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center px-0.5 text-[9px] text-zinc-450 font-bold leading-none">
          <span>{isPlaying ? formatTime(currentSeconds) : duration}</span>
          <span className="uppercase tracking-wider">Voice Note</span>
        </div>
      </div>

      <Avatar
        src={actualAvatar}
        name={actualName}
        size="xs"
        className="border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex-shrink-0"
      />
    </div>
  );
}

export default AudioPlayBubble;
