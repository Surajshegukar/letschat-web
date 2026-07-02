  import React from "react";
import { Search, Phone, Video, Info } from "lucide-react";

interface ChatHeaderProps {
  roomName: string;
  avatarUrl?: string;
  isGroup?: boolean;
  isOnline?: boolean;
  isDetailsOpen: boolean;
  onToggleDetails: () => void;
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
}

export function ChatHeader({
  roomName,
  avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  isGroup = false,
  isOnline = false,
  isDetailsOpen,
  onToggleDetails,
  onStartAudioCall,
  onStartVideoCall,
}: ChatHeaderProps) {
  return (
    <div className="h-20 px-8 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-zinc-950 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          {isGroup ? (
            <div className="h-10 w-10 rounded-full bg-[#19E68C]/15 text-emerald-650 flex items-center justify-center font-bold text-sm dark:bg-[#19E68C]/10 dark:text-[#19E68C]">
              {roomName.charAt(0)}
            </div>
          ) : (
            <img src={avatarUrl} className="h-10 w-10 rounded-full object-cover" alt={roomName} />
          )}
          {isOnline && !isGroup && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border border-white dark:border-zinc-950" />
          )}
        </div>
        <div className="text-left">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-none">
            {roomName}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1.5 leading-none">
            {isGroup ? "Group Chat" : isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition">
          <Search className="h-5 w-5" />
        </button>
        <button
          onClick={onStartAudioCall}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"
          title="Voice call"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          onClick={onStartVideoCall}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"
          title="Video call"
        >
          <Video className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleDetails}
          className={`p-2 rounded-xl transition ${
            isDetailsOpen
              ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
