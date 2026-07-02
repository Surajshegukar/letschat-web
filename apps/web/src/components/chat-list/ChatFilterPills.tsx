import React from "react";
import { MailOpen, Users, AtSign, Pin, Archive } from "lucide-react";
import { ChatFilterType } from "@/hooks/use-chat-list";

interface ChatFilterPillsProps {
  activeFilter: ChatFilterType;
  onFilterChange: (filter: ChatFilterType) => void;
  allCount?: number;
  unreadCount?: number;
  directCount?: number;
  groupsCount?: number;
  mentionsCount?: number;
  pinnedCount?: number;
  archiveCount?: number;
}

export function ChatFilterPills({
  activeFilter,
  onFilterChange,
  allCount = 12,
  unreadCount = 12,
  directCount = 8,
  groupsCount = 4,
  mentionsCount = 3,
  pinnedCount = 2,
  archiveCount = 2,
}: ChatFilterPillsProps) {
  const getPillClass = (filter: ChatFilterType) => {
    return activeFilter === filter
      ? "bg-[#19E68C]/15 text-emerald-650 dark:bg-zinc-900 dark:text-[#19E68C]"
      : "bg-zinc-100/70 hover:bg-zinc-200/60 text-slate-600 dark:bg-zinc-900/40 dark:text-zinc-400";
  };

  const getBadgeClass = (filter: ChatFilterType) => {
    return activeFilter === filter
      ? "bg-[#19E68C]/20 text-emerald-650 dark:bg-zinc-800 dark:text-[#19E68C]"
      : "bg-zinc-200 dark:bg-zinc-800";
  };

  const filterItems = [
    { type: "all" as const, label: "All", count: allCount },
    { type: "unread" as const, label: "Unread", count: unreadCount, icon: MailOpen },
    { type: "direct" as const, label: "Direct", count: directCount },
    { type: "groups" as const, label: "Groups", count: groupsCount, icon: Users },
    { type: "mentions" as const, label: "Mentions", count: mentionsCount, icon: AtSign },
    { type: "pinned" as const, label: "Pinned", count: pinnedCount, icon: Pin },
    { type: "archive" as const, label: "Archive", count: archiveCount, icon: Archive },
  ];

  return (
    <div className="px-4 py-3 flex flex-wrap w-full gap-1.5 border-b border-zinc-200/80 dark:border-zinc-900 overflow-x-auto scrollbar-none flex-shrink-0">
      {filterItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.type}
            onClick={() => onFilterChange(item.type)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0 ${getPillClass(
              item.type
            )}`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getBadgeClass(item.type)}`}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
export default ChatFilterPills;
