import React from "react";
import { Phone, Video } from "lucide-react";

interface CallProfileCardProps {
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
}

export function CallProfileCard({
  name,
  avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  isOnline = false,
  onStartAudioCall,
  onStartVideoCall,
}: CallProfileCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800 rounded-3xl p-6 shadow-md text-center flex flex-col items-center">
      <div className="relative">
        <img
          src={avatarUrl}
          className="h-24 w-24 rounded-full object-cover shadow-md border-2 border-zinc-100 dark:border-zinc-800"
          alt={name}
        />
        {isOnline && (
          <span className="absolute bottom-1 right-1.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950" />
        )}
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-4">{name}</h2>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
        Let's Chat Audio & Video Contacts
      </p>

      {/* Dial back row buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={onStartAudioCall}
          className="p-3 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition text-emerald-600 dark:text-[#19E68C] border border-zinc-200 dark:border-zinc-800 shadow-sm"
          title="Start voice call"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          onClick={onStartVideoCall}
          className="p-3 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition text-emerald-600 dark:text-[#19E68C] border border-zinc-200 dark:border-zinc-800 shadow-sm"
          title="Start video call"
        >
          <Video className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
export default CallProfileCard;
