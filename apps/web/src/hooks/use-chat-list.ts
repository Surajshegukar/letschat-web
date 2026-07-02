import { useState, useMemo } from "react";
import { ChatRoom } from "@/types/chat";

export type ChatFilterType = "all" | "unread" | "direct" | "groups" | "mentions" | "pinned" | "archive";

export function useChatList(rooms: ChatRoom[]) {
  const [activeFilter, setActiveFilter] = useState<ChatFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Archive scoping
      if (activeFilter === "archive") {
        if (!room.isArchived) return false;
      } else {
        if (room.isArchived) return false;
      }

      // Filter by type or status
      if (activeFilter === "direct" && room.type !== "direct") return false;
      if (activeFilter === "groups" && room.type !== "group") return false;
      if (activeFilter === "unread" && (!room.unreadCount || room.unreadCount === 0)) return false;
      if (activeFilter === "mentions" && !room.hasMention) return false;
      if (activeFilter === "pinned" && !room.isPinned) return false;

      // Filter by search query
      if (searchQuery.trim() !== "") {
        return (
          room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return true;
    });
  }, [rooms, activeFilter, searchQuery]);

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredRooms,
  };
}
export type UseChatListReturn = ReturnType<typeof useChatList>;
