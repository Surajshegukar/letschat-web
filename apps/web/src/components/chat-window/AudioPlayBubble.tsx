import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayBubbleProps {
  duration?: string; // e.g. "0:14"
  senderAvatar?: string;
  isMe: boolean;
}

export function AudioPlayBubble({
  duration = "0:12",
  senderAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  isMe,
}: AudioPlayBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Extract duration seconds (e.g., "0:12" -> 12)
  const totalSeconds = React.useMemo(() => {
    const parts = duration.split(":");
    const mins = parseInt(parts[0] || "0", 10);
    const secs = parseInt(parts[1] || "0", 10);
    return mins * 60 + secs;
  }, [duration]);

  const [currentSeconds, setCurrentSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            setProgress(0);
            return 0;
          }
          const next = prev + 1;
          setProgress((next / totalSeconds) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSeconds]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Helper to format seconds back to "m:ss"
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className={`flex items-center gap-3 w-[280px] p-2.5 rounded-2xl ${
      isMe 
        ? "bg-[#EAFDF5] text-emerald-955 border border-emerald-500/10" 
        : "bg-white text-slate-800 border border-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
    }`}>
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`h-9 w-9 flex items-center justify-center rounded-full transition shadow-sm ${
          isMe
            ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95"
        }`}
      >
        {isPlaying ? (
          <Pause className="h-4.5 w-4.5 fill-current" />
        ) : (
          <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform graphic & Timeline */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Mock Waveform bar grids */}
        <div className="flex items-end gap-0.5 h-6 mb-1.5 opacity-80 pl-0.5">
          {[40, 60, 20, 80, 50, 90, 30, 70, 40, 60, 85, 20, 55, 75, 45, 95, 30, 65, 80, 50].map((val, idx) => {
            // Highlight bar if progress has passed it
            const activeIdx = Math.floor((progress / 100) * 20);
            const isActive = idx <= activeIdx;
            return (
              <div
                key={idx}
                className={`w-[3px] rounded-full transition-all duration-300 ${
                  isActive
                    ? isMe ? "bg-emerald-600 dark:bg-[#19E68C]" : "bg-emerald-500"
                    : isMe ? "bg-emerald-500/20" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
                style={{ height: `${val}%` }}
              />
            );
          })}
        </div>

        {/* Time duration indicator */}
        <div className="flex justify-between items-center px-0.5 text-[9px] text-zinc-450 font-bold leading-none">
          <span>{isPlaying ? formatTime(currentSeconds) : duration}</span>
          <span className="uppercase tracking-wider">Voice Note</span>
        </div>
      </div>

      {/* Mic/Sender Avatar */}
      <img
        src={senderAvatar}
        alt="Avatar"
        className="h-8 w-8 rounded-full object-cover border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex-shrink-0"
      />
    </div>
  );
}

export default AudioPlayBubble;
