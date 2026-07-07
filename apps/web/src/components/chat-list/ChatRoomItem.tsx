"use client";

import React from "react";
import { Pin, PinOff, Archive, Check } from "lucide-react";
import { ChatRoom } from "@/types/chat";
import { useRealtimeStore } from "@/store/realtime-store";
import { useSocket } from "@/providers/socket-provider";
import { usePinConversation, useArchiveConversation } from "@/hooks/api/use-conversations";

interface ChatRoomItemProps {
  room: ChatRoom;
  isActive: boolean;
  onSelect: () => void;
}

const EMPTY_ARRAY: string[] = [];

export function ChatRoomItem({ room, isActive, onSelect }: ChatRoomItemProps) {
  const { isConnected } = useSocket();
  const onlineUsers = useRealtimeStore((state) => state.onlineUsers);
  const pinMutation = usePinConversation();
  const archiveMutation = useArchiveConversation();

  // If socket is connected, trust ONLY the real-time presence Set.
  // Otherwise, fall back to the initial database snapshot.
  const isOnline = isConnected
    ? room.type !== "group" && !!room.partnerId && onlineUsers.has(room.partnerId)
    : !!room.isOnline;

  const typingUsers = useRealtimeStore((state) => state.typingUsers[room.id] || EMPTY_ARRAY);
  const isSomeoneTyping = typingUsers.length > 0;

  const messagePreview = isSomeoneTyping
    ? `${typingUsers.join(", ")} is typing...`
    : room.lastMessage;

  // Derive initials for avatar fallback
  const initials = room.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left cursor-pointer transition group relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#19E68C]/50 ${
        isActive
          ? "bg-[#19E68C]/15 text-slate-800 dark:bg-zinc-900 dark:text-[#19E68C]"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar with status dot */}
        <div className="relative flex-shrink-0">
          {room.type === "group" ? (
            <div className="h-10 w-10 rounded-full bg-[#19E68C]/15 text-emerald-600 flex items-center justify-center font-bold text-sm dark:bg-[#19E68C]/10 dark:text-[#19E68C]">
              {initials}
            </div>
          ) : room.avatar ? (
            <img src={room.avatar} className="h-10 w-10 rounded-full object-cover" alt={room.name} />
          ) : (
            // Fallback avatar — gradient with initials so broken-img never shows
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">
              {initials}
            </div>
          )}

          {/* Always render status dot for direct chats: green = online, grey = offline */}
          {room.type === "direct" && (
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-950 transition-colors duration-300 ${
                isOnline ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">
            {room.name}
          </p>
          <p
            className={`text-xs truncate mt-1 leading-tight ${
              isSomeoneTyping
                ? "text-emerald-500 dark:text-[#19E68C] font-medium"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {messagePreview}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0 relative min-w-[60px]">
        {/* Timestamp — hidden on hover when action buttons are shown */}
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium group-hover:hidden transition-all duration-150">
          {room.timestamp}
        </span>

        {/* Hover Quick Actions */}
        <div className="hidden group-hover:flex items-center gap-1.5 absolute top-[-4px] right-0 transition-all duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              pinMutation.mutate(room.id);
            }}
            className="p-1 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-[#19E68C] transition-colors"
            title={room.isPinned ? "Unpin Chat" : "Pin Chat"}
          >
            {room.isPinned ? (
              <PinOff className="h-3.5 w-3.5" />
            ) : (
              <Pin className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              archiveMutation.mutate(room.id);
            }}
            className="p-1 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-[#19E68C] transition-colors"
            title={room.isArchived ? "Unarchive Chat" : "Archive Chat"}
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {room.unreadCount ? (
            <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-[#19E68C] text-emerald-955 text-[10px] font-bold dark:bg-[#19E68C] dark:text-[#09090B]">
              {room.unreadCount}
            </span>
          ) : room.isPinned ? (
            <span className="text-zinc-400 dark:text-zinc-550 flex-shrink-0 group-hover:hidden">
              <Pin className="h-3.5 w-3.5 fill-current rotate-45" />
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default ChatRoomItem;
