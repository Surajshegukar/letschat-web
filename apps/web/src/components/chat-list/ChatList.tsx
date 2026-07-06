"use client";

import React from "react";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { useConversations } from "@/hooks/api/use-conversations";
import { formatConversation, RawConversation } from "@/utils/chat-helpers";
import { useChatList } from "@/hooks/use-chat-list";
import { ChatFilterPills } from "./ChatFilterPills";
import { ChatRoomItem } from "./ChatRoomItem";
import { ChevronLeft, Search } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { ChatRoom } from "@/types/chat";
import ChatListHeader from "./ChatListHeader";
import { NewChatList } from "../newchat/NewChatList";

interface ChatListProps {
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatList({ activeRoomId, onSelectRoom }: ChatListProps) {
  const [isNewChatView, setIsNewChatView] = React.useState(false);
  const { data: convResponse, isLoading } = useConversations();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const rawConversations = convResponse?.data?.conversations;

  const formattedRooms = React.useMemo(() => {
    if (!currentUserId || !rawConversations) return [];
    const formatted = rawConversations.map((c: { _id: string }) =>
      formatConversation(c as unknown as RawConversation, currentUserId)
    );

    // Sort: pinned conversations first, maintaining timestamp order
    return formatted.sort((a: ChatRoom, b: ChatRoom) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [rawConversations, currentUserId]);

  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredRooms,
  } = useChatList(formattedRooms);

  // Count types for filter pills
  const allCount = formattedRooms.filter((r: ChatRoom) => !r.isArchived).length;
  const unreadCount = formattedRooms.filter((r: ChatRoom) => !r.isArchived && r.unreadCount && r.unreadCount > 0).length;
  const directCount = formattedRooms.filter((r: ChatRoom) => !r.isArchived && r.type === "direct").length;
  const groupsCount = formattedRooms.filter((r: ChatRoom) => !r.isArchived && r.type === "group").length;
  const mentionsCount = formattedRooms.filter((r: ChatRoom) => !r.isArchived && r.hasMention).length;
  const pinnedCount = formattedRooms.filter((r: ChatRoom) => !r.isArchived && r.isPinned).length;
  const archiveCount = formattedRooms.filter((r: ChatRoom) => r.isArchived).length;

  if (isNewChatView) {
    return (
      <NewChatList
        onBack={() => setIsNewChatView(false)}
        onSelectRoom={(roomId) => {
          onSelectRoom(roomId);
          setIsNewChatView(false);
        }}
      />
    );
  }

  return (
    <div className="w-full md:w-100 md:max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      <ChatListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewChatClick={() => setIsNewChatView(true)}
      />
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
        {isLoading ? (
          <div className="space-y-4 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse opacity-60">
                <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2.5 py-1">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-400 dark:text-zinc-500 text-xs gap-1.5 font-medium">
            <span>No conversations found</span>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.id}
              room={room}
              isActive={activeRoomId === room.id}
              onSelect={() => onSelectRoom(room.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
export default ChatList;
