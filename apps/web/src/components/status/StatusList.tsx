import React, { useState } from "react";
import { Search, Plus, PenTool, Camera, ChevronDown, ChevronRight, X } from "lucide-react";
import { UserStatus } from "@/types/status";
import { StatusAvatar } from "./StatusAvatar";
import { StatusItem } from "./StatusItem";

interface StatusListProps {
  statuses: UserStatus[];
  activeUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  myStatus: UserStatus | null;
  onCreateTextStatus: () => void;
  onCreateImageStatus: () => void;
}

export function StatusList({
  statuses,
  activeUserId,
  onSelectUser,
  myStatus,
  onCreateTextStatus,
  onCreateImageStatus,
}: StatusListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecentCollapsed, setIsRecentCollapsed] = useState(false);
  const [isViewedCollapsed, setIsViewedCollapsed] = useState(false);

  // Filter contacts by search query
  const filteredStatuses = statuses.filter((s) =>
    s.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentUpdates = filteredStatuses.filter((s) => s.hasUnread && s.stories.length > 0);
  const viewedUpdates = filteredStatuses.filter((s) => !s.hasUnread && s.stories.length > 0);

  const hasMyStatus = myStatus && myStatus.stories.length > 0;

  return (
    <div className="w-full max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      
      {/* 1. Header Title & Quick Post Controls */}
      <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Status</h2>
        <div className="flex items-center gap-1.5">
          {/* Create Text Status Button */}
          <button
            onClick={onCreateTextStatus}
            title="Write a text status"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-555 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-[#19E68C]"
          >
            <PenTool className="h-4.5 w-4.5" />
          </button>

          {/* Create Image Status Button */}
          <button
            onClick={onCreateImageStatus}
            title="Post an image status"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-555 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-[#19E68C]"
          >
            <Camera className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Search Bar */}
      <div className="px-4 py-3 border-b border-zinc-150/40 dark:border-zinc-900/60 flex-shrink-0">
        <div className="relative flex items-center bg-zinc-100/70 dark:bg-zinc-900/40 border border-transparent focus-within:border-zinc-200 dark:focus-within:border-zinc-800 rounded-xl px-3.5 py-2 transition-all">
          <Search className="h-4 w-4 text-zinc-450 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search status updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-slate-800 dark:text-zinc-250 placeholder-zinc-450"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition text-zinc-450"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Status Lists Scroll Deck */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        
        {/* User's Own Status Card */}
        <div className="pb-1 border-b border-zinc-150/20 dark:border-zinc-900/20">
          <button
            onClick={() => hasMyStatus ? onSelectUser("me") : onCreateTextStatus()}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition text-left ${
              activeUserId === "me"
                ? "bg-[#19E68C]/12 border border-[#19E68C]/20 shadow-sm"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 border border-transparent"
            }`}
          >
            <div className="relative flex-shrink-0">
              <StatusAvatar
                src={myStatus?.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                storiesCount={myStatus?.stories.length || 0}
                unreadCount={myStatus?.hasUnread ? 1 : 0}
                size={48}
                userName="My Status"
              />
              {!hasMyStatus && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-emerald-500 to-[#19E68C] text-[#09090B] flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-sm">
                  <Plus className="h-3 w-3" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-300">
                My Status
              </p>
              <p className="text-xs text-zinc-450 mt-1 truncate">
                {hasMyStatus 
                  ? `Last updated ${myStatus.lastUpdated}` 
                  : "Tap to add a status update"
                }
              </p>
            </div>
          </button>
        </div>

        {/* Recent updates list */}
        {recentUpdates.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hover:text-zinc-655 transition"
            >
              <span>Recent Updates ({recentUpdates.length})</span>
              {isRecentCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {!isRecentCollapsed && (
              <div className="space-y-1">
                {recentUpdates.map((status) => (
                  <StatusItem
                    key={status.id}
                    status={status}
                    isActive={activeUserId === status.userId}
                    onClick={() => onSelectUser(status.userId)}
                    unreadCount={status.stories.length}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Viewed updates list */}
        {viewedUpdates.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setIsViewedCollapsed(!isViewedCollapsed)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hover:text-zinc-655 transition"
            >
              <span>Viewed Updates ({viewedUpdates.length})</span>
              {isViewedCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {!isViewedCollapsed && (
              <div className="space-y-1">
                {viewedUpdates.map((status) => (
                  <StatusItem
                    key={status.id}
                    status={status}
                    isActive={activeUserId === status.userId}
                    onClick={() => onSelectUser(status.userId)}
                    unreadCount={0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty Search State */}
        {filteredStatuses.length === 0 && (
          <div className="py-8 text-center text-zinc-450">
            <p className="text-sm">No status updates found</p>
            <p className="text-xs mt-1">Try searching for a different contact name</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusList;
