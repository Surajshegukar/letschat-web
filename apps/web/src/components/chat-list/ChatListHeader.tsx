"use client";

import React from "react";
import { Search, MessageSquarePlus } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import PerformanceMonitor from "../ui/PerformanceMonitor";

interface ChatListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChatClick: () => void;
}

export function ChatListHeader({
  searchQuery,
  onSearchChange,
  onNewChatClick,
}: ChatListHeaderProps) {
  return (
    <>
      {/* Pane Header */}
      <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between flex-shrink-0 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <BrandLogo size={36} />
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Let's Chat
          </span>
        </div>
        <PerformanceMonitor />
        <button
          onClick={onNewChatClick}
          className="p-2 hover:bg-zinc-150/70 dark:hover:bg-zinc-900/60 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]"
          title="New Chat"
        >
          <MessageSquarePlus className="h-5.5 w-5.5" />
        </button>
      </div>

      <div className="p-4 flex gap-2 flex-shrink-0 bg-white dark:bg-zinc-950">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-sm outline-none transition focus:border-[#19E68C] dark:text-zinc-200"
          />
        </div>
      </div>
    </>
  );
}

export default ChatListHeader;