import React from "react";
import { Megaphone, MessageSquare } from "lucide-react";
import { Community } from "@/types/communities";

interface CommunityItemProps {
  community: Community;
  activeCommunityId: string | null;
  activeGroupId: string | null;
  onSelectGroup: (communityId: string, groupId: string | null) => void;
}

export function CommunityItem({
  community,
  activeCommunityId,
  activeGroupId,
  onSelectGroup,
}: CommunityItemProps) {
  const isParentActive = activeCommunityId === community.id && activeGroupId === null;

  return (
    <div className="border border-zinc-100 dark:border-zinc-900/40 rounded-2xl bg-zinc-50/20 dark:bg-zinc-950/5 p-1.5 space-y-1.5 shadow-sm">
      {/* Community Parent Header Item */}
      <button
        onClick={() => onSelectGroup(community.id, null)}
        className={`w-full flex items-center gap-3.5 p-2.5 rounded-xl transition text-left ${
          isParentActive
            ? "bg-[#19E68C]/15 border border-[#19E68C]/20 shadow-sm"
            : "hover:bg-zinc-100/70 dark:hover:bg-zinc-900/40 border border-transparent"
        }`}
      >
        {/* Square Profile Image representing a Community */}
        <img
          src={community.avatar}
          className="h-11 w-11 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm flex-shrink-0"
          alt={community.name}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-slate-800 dark:text-zinc-300 truncate">
            {community.name}
          </p>
          <p className="text-[10px] text-zinc-450 mt-0.5 font-semibold">
            {community.memberCount} members • {community.groups.length} groups
          </p>
        </div>
      </button>

      {/* Sub-Groups List (Nested/Indented) */}
      <div className="pl-3.5 space-y-1 border-l-2 border-zinc-150 dark:border-zinc-900 ml-7">
        {community.groups.map((group) => {
          const isGroupActive = activeCommunityId === community.id && activeGroupId === group.id;
          const Icon = group.type === "announcement" ? Megaphone : MessageSquare;

          return (
            <button
              key={group.id}
              onClick={() => onSelectGroup(community.id, group.id)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition text-left ${
                isGroupActive
                  ? "bg-[#19E68C]/12 border border-[#19E68C]/10 shadow-sm text-emerald-650 dark:text-[#19E68C]"
                  : "hover:bg-zinc-100/60 dark:hover:bg-zinc-900/30 text-zinc-650 dark:text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Megaphone/Message icon */}
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                  isGroupActive
                    ? "bg-[#19E68C]/20 text-emerald-600 dark:text-[#19E68C]"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500"
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${
                    isGroupActive ? "text-emerald-700 dark:text-[#19E68C]" : "text-slate-800 dark:text-zinc-300"
                  }`}>
                    {group.name}
                  </p>
                  {group.lastMessage && (
                    <p className="text-[10px] text-zinc-450 truncate mt-0.5 max-w-[200px]">
                      {group.lastMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Badge / Timestamp */}
              <div className="flex flex-col items-end flex-shrink-0 pl-1.5">
                {group.timestamp && (
                  <span className="text-[9px] text-zinc-400">
                    {group.timestamp}
                  </span>
                )}
                {group.unreadCount && group.unreadCount > 0 ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-[#09090B] font-bold mt-1 shadow-sm leading-none">
                    {group.unreadCount}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CommunityItem;
