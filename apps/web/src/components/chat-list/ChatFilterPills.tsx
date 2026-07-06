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
  allCount = 0,
  unreadCount = 0,
  directCount = 0,
  groupsCount = 0,
  mentionsCount = 0,
  pinnedCount = 0,
  archiveCount = 0,
}: ChatFilterPillsProps) {
  const getPillClass = (filter: ChatFilterType) => {
    return activeFilter === filter
      ? "bg-emerald-50 border-emerald-250/60 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-[#19E68C] shadow-sm shadow-emerald-500/5 font-semibold"
      : "bg-zinc-50 border-zinc-200/50 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-650 dark:bg-zinc-900/40 dark:border-zinc-800 dark:hover:bg-zinc-900/80 dark:hover:border-zinc-700 dark:text-zinc-400 font-medium";
  };

  const getBadgeClass = (filter: ChatFilterType) => {
    return activeFilter === filter
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-[#19E68C]"
      : "bg-zinc-200/60 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500";
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
    <div className="px-4 py-3 flex flex-wrap w-full gap-2 border-b border-zinc-100 dark:border-zinc-900 overflow-x-auto scrollbar-none flex-shrink-0">
      {filterItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.type}
            onClick={() => onFilterChange(item.type)}
            className={`px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5 transition-all duration-200 active:scale-95 flex-shrink-0 ${getPillClass(
              item.type
            )}`}
          >
            {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
            <span>{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className={`text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold transition-all duration-200 ${getBadgeClass(item.type)}`}>
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
