"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { ChatRoom } from "@/types/chat";

interface ChatListProps {
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

const mockRooms: ChatRoom[] = [
  {
    id: "olivia",
    name: "Olivia Rhye",
    type: "direct",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    lastMessage: "Hey! How are you today?",
    timestamp: "11:30 AM",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "frontend",
    name: "Frontend Team",
    type: "group",
    lastMessage: "Alex: New components are ready.",
    timestamp: "11:28 AM",
    unreadCount: 3,
  },
  {
    id: "marketing",
    name: "Marketing Team",
    type: "group",
    lastMessage: "Sophia: Can we reschedule...",
    timestamp: "10:45 AM",
    unreadCount: 5,
  },
  {
    id: "lucas",
    name: "Lucas Garcia",
    type: "direct",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    lastMessage: "Sounds good! 👍",
    timestamp: "09:36 AM",
    isOnline: true,
  },
  {
    id: "ui-ux",
    name: "UI/UX Team",
    type: "group",
    lastMessage: "Emma: Figma file updated.",
    timestamp: "Yesterday",
    unreadCount: 2,
  },
  {
    id: "design-system",
    name: "Design System",
    type: "group",
    lastMessage: "Jonas: Added new tokens",
    timestamp: "Yesterday",
  },
  {
    id: "mia",
    name: "Mia Johnson",
    type: "direct",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    lastMessage: "See you tomorrow!",
    timestamp: "Yesterday",
  },
  {
    id: "devops",
    name: "DevOps Team",
    type: "group",
    lastMessage: "You: Deployment completed",
    timestamp: "Friday",
  },
  {
    id: "project-alpha",
    name: "Project Alpha",
    type: "group",
    lastMessage: "Robert: New update available",
    timestamp: "Friday",
  },
];

export function ChatList({ activeRoomId, onSelectRoom }: ChatListProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "direct" | "groups">("all");

  const filteredRooms = mockRooms.filter((room) => {
    if (activeFilter === "direct") return room.type === "direct";
    if (activeFilter === "groups") return room.type === "group";
    return true;
  });

  return (
    <div className="w-100 h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      
      {/* Header hidden or shown according to your diff adjustments */}

          {/* Filter pills */}
          <div className="px-4 py-3 flex gap-1.5 border-b border-zinc-200/80 dark:border-zinc-900 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeFilter === "all"
                  ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
                  : "bg-zinc-100/70 hover:bg-zinc-200/60 text-slate-600 dark:bg-zinc-900/40 dark:text-zinc-400"
          }`}
        >
          <span>All</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            activeFilter === "all" ? "bg-[#19E68C]/20 text-emerald-650 dark:bg-zinc-800 dark:text-[#19E68C]" : "bg-zinc-200 dark:bg-zinc-800"
          }`}>12</span>
        </button>
        <button
          onClick={() => setActiveFilter("direct")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
            activeFilter === "direct"
              ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
              : "bg-zinc-100/70 hover:bg-zinc-200/60 text-slate-600 dark:bg-zinc-900/40 dark:text-zinc-400"
          }`}
        >
          <span>Direct</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            activeFilter === "direct" ? "bg-[#19E68C]/20 text-emerald-650 dark:bg-zinc-800 dark:text-[#19E68C]" : "bg-zinc-200 dark:bg-zinc-800"
          }`}>8</span>
        </button>
        <button
          onClick={() => setActiveFilter("groups")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
            activeFilter === "groups"
              ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
              : "bg-zinc-100/70 hover:bg-zinc-200/60 text-slate-600 dark:bg-zinc-900/40 dark:text-zinc-400"
          }`}
        >
          <span>Groups</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            activeFilter === "groups" ? "bg-[#19E68C]/20 text-emerald-650 dark:bg-zinc-800 dark:text-[#19E68C]" : "bg-zinc-200 dark:bg-zinc-800"
          }`}>4</span>
        </button>
      </div>

      {/* Rooms list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredRooms.map((room) => {
          const isActive = activeRoomId === room.id;
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
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
                    <img
                      src={room.avatar}
                      className="h-10 w-10 rounded-full object-cover"
                      alt=""
                    />
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
                <span className="text-[10px] text-zinc-400 font-medium">
                  {room.timestamp}
                </span>
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
        })}
      </div>

    </div>
  );
}
