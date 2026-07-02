import React from "react";
import { VideoOff } from "lucide-react";

interface VideoCallLayoutProps {
  recipientName: string;
  recipientAvatarUrl?: string;
  status: string;
  isSelfVideoOff?: boolean;
}

export function VideoCallLayout({
  recipientName,
  recipientAvatarUrl,
  status,
  isSelfVideoOff = false,
}: VideoCallLayoutProps) {
  return (
    <div className="flex-1 w-full h-full relative overflow-hidden select-none">
      {/* Background full-bleed video stream of recipient */}
      <div className="absolute inset-0 bg-zinc-950">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800"
          className="w-full h-full object-cover opacity-85"
          alt={recipientName}
        />
        {/* Soft dark radial vignette gradient overlay to pop controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>

      {/* Profile info overlay top-left */}
      <div className="absolute top-6 left-6 text-left z-20">
        <h2 className="text-xl font-bold tracking-tight text-white">{recipientName}</h2>
        <p className="text-xs text-zinc-300 font-semibold tracking-wide mt-1.5">{status}</p>
      </div>

      {/* Picture-in-Picture Self camera feed top-right */}
      <div className="absolute top-6 right-6 h-36 w-24 sm:h-44 sm:w-28 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700/80 shadow-2xl z-20 transition-all duration-300">
        {isSelfVideoOff ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
            <VideoOff className="h-6 w-6" />
            <span className="text-[8px] font-bold uppercase tracking-wider mt-1.5">Muted</span>
          </div>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
            className="w-full h-full object-cover opacity-90"
            alt="Self Camera"
          />
        )}
      </div>
    </div>
  );
}
export default VideoCallLayout;
