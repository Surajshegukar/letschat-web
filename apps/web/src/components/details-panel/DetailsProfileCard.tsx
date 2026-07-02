import React from "react";
import { User, Search, Bell, MoreHorizontal } from "lucide-react";

interface DetailsProfileCardProps {
  name: string;
  avatarUrl?: string;
  status?: string;
}

export function DetailsProfileCard({
  name,
  avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  status = "Online",
}: DetailsProfileCardProps) {
  const isOnline = status.toLowerCase() === "online";

  return (
    <div className="flex flex-col items-center text-center">
      {/* Profile Avatar & Status */}
      <div className="relative">
        <img
          src={avatarUrl}
          className="h-20 w-20 rounded-full object-cover shadow-md border-2 border-zinc-100 dark:border-zinc-800"
          alt={name}
        />
        {isOnline && (
          <span className="absolute bottom-0 right-1.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950" />
        )}
      </div>

      <h4 className="text-base font-bold text-slate-800 dark:text-white mt-3 leading-none">
        {name}
      </h4>
      <p className="text-xs text-green-400 dark:text-green-400 mt-2 leading-none">{status}</p>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-4 gap-2 border-b border-zinc-150 dark:border-zinc-900 pb-5 w-full mt-6">
        <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
          <User className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
          <span className="text-[10px] text-zinc-300 mt-1.5 font-medium">Profile</span>
        </button>
        <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
          <Search className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
          <span className="text-[10px] text-zinc-300 mt-1.5 font-medium">Search</span>
        </button>
        <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
          <Bell className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
          <span className="text-[10px] text-zinc-300 mt-1.5 font-medium">Mute</span>
        </button>
        <button className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
          <MoreHorizontal className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
          <span className="text-[10px] text-zinc-300 mt-1.5 font-medium">More</span>
        </button>
      </div>
    </div>
  );
}
export default DetailsProfileCard;
