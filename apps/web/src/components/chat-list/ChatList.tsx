"use client";

import React from "react";
import { mockRooms } from "@/constants/mock-data";
import { useChatList } from "@/hooks/use-chat-list";
import { ChatFilterPills } from "./ChatFilterPills";
import { ChatRoomItem } from "./ChatRoomItem";

interface ChatListProps {
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatList({ activeRoomId, onSelectRoom }: ChatListProps) {
  const { activeFilter, setActiveFilter, filteredRooms } = useChatList(mockRooms);

  // Count types for filter pills
  const allCount = mockRooms.filter((r) => !r.isArchived).length;
  const unreadCount = mockRooms.filter((r) => !r.isArchived && r.unreadCount && r.unreadCount > 0).length;
  const directCount = mockRooms.filter((r) => !r.isArchived && r.type === "direct").length;
  const groupsCount = mockRooms.filter((r) => !r.isArchived && r.type === "group").length;
  const mentionsCount = mockRooms.filter((r) => !r.isArchived && r.hasMention).length;
  const pinnedCount = mockRooms.filter((r) => !r.isArchived && r.isPinned).length;
  const archiveCount = mockRooms.filter((r) => r.isArchived).length;

  return (
    <div className="w-100 max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
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
