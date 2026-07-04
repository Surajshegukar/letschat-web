"use client";

import React from "react";
import { useChatStore } from "@/store/chat-store";
import { useChatList } from "@/hooks/use-chat-list";
import { ChatFilterPills } from "./ChatFilterPills";
import { ChatRoomItem } from "./ChatRoomItem";

interface ChatListProps {
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatList({ activeRoomId, onSelectRoom }: ChatListProps) {
  const rooms = useChatStore((state) => state.rooms);
  const { activeFilter, setActiveFilter, filteredRooms } = useChatList(rooms);

  // Count types for filter pills
  const allCount = rooms.filter((r) => !r.isArchived).length;
  const unreadCount = rooms.filter((r) => !r.isArchived && r.unreadCount && r.unreadCount > 0).length;
  const directCount = rooms.filter((r) => !r.isArchived && r.type === "direct").length;
  const groupsCount = rooms.filter((r) => !r.isArchived && r.type === "group").length;
  const mentionsCount = rooms.filter((r) => !r.isArchived && r.hasMention).length;
  const pinnedCount = rooms.filter((r) => !r.isArchived && r.isPinned).length;
  const archiveCount = rooms.filter((r) => r.isArchived).length;

  return (
    <div className="w-full md:w-100 md:max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      {/* Filter pills */}
      <ChatFilterPills
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        allCount={allCount}
        unreadCount={unreadCount}
        directCount={directCount}
        groupsCount={groupsCount}
        mentionsCount={mentionsCount}
        pinnedCount={pinnedCount}
        archiveCount={archiveCount}
      />

      {/* Rooms list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredRooms.map((room) => (
          <ChatRoomItem
            key={room.id}
            room={room}
            isActive={activeRoomId === room.id}
            onSelect={() => onSelectRoom(room.id)}
          />
        ))}
      </div>
    </div>
  );
}
export default ChatList;
