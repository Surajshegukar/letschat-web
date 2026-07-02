import React from "react";
import { Check } from "lucide-react";
import { ChatRoom } from "@/types/chat";

interface ChatRoomItemProps {
  room: ChatRoom;
  isActive: boolean;
  onSelect: () => void;
}

export function ChatRoomItem({ room, isActive, onSelect }: ChatRoomItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition ${
        isActive
          ? "bg-[#19E68C]/15 text-slate-800 dark:bg-zinc-900 dark:text-[#19E68C]"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative flex-shrink-0">
          {room.type === "group" ? (
            <div className="h-10 w-10 rounded-full bg-[#19E68C]/15 text-emerald-600 flex items-center justify-center font-bold text-sm dark:bg-[#19E68C]/10 dark:text-[#19E68C]">
              {room.name.charAt(0)}
            </div>
          ) : (
            <img src={room.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
          )}
          {room.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">
            {room.name}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-1 leading-tight">
            {room.lastMessage}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 ml-2">
        <span className="text-[10px] text-zinc-400 font-medium">{room.timestamp}</span>
        <div className="flex items-center gap-1">
          {/* Status Indicator */}
          {room.id === "mia" && <Check className="h-3.5 w-3.5 text-zinc-450" />}
          {room.unreadCount ? (
            <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-[#19E68C] text-emerald-950 text-[10px] font-bold dark:bg-[#19E68C] dark:text-[#09090B]">
              {room.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
export default ChatRoomItem;
