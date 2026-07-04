import React, { useState } from "react";
import { Search, Plus, Megaphone, MessageSquare, PlusCircle, X, Compass, Users } from "lucide-react";
import { Community } from "@/types/communities";
import { CommunityItem } from "./CommunityItem";

interface CommunitiesListProps {
  communities: Community[];
  activeCommunityId: string | null;
  activeGroupId: string | null;
  onSelectGroup: (communityId: string, groupId: string | null) => void;
  onCreateCommunity?: () => void;
}

export function CommunitiesList({
  communities,
  activeCommunityId,
  activeGroupId,
  onSelectGroup,
  onCreateCommunity,
}: CommunitiesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-full md:max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      
      {/* 1. Header Title */}
      <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Communities</h2>
        <button
          onClick={onCreateCommunity || (() => alert("Creating custom communities requires workspace administration access."))}
          title="New Community"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* 2. Community Search Bar */}
      <div className="px-4 py-3 border-b border-zinc-150/40 dark:border-zinc-900/60 flex-shrink-0">
        <div className="relative flex items-center bg-zinc-100/70 dark:bg-zinc-900/40 border border-transparent focus-within:border-zinc-200 dark:focus-within:border-zinc-800 rounded-xl px-3.5 py-2 transition-all">
          <Search className="h-4 w-4 text-zinc-450 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search communities or groups..."
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

      {/* 3. Scrollable Communities List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        
        {/* Create Community Quick Card */}
        <div className="pb-1 border-b border-zinc-150/20 dark:border-zinc-900/20">
          <button
            onClick={onCreateCommunity || (() => alert("Creating custom communities is restricted."))}
            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-[#19E68C]/80 text-[#09090B] flex items-center justify-center shadow-sm flex-shrink-0">
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-300 group-hover:text-emerald-500 transition">
                New Community
              </p>
              <p className="text-xs text-zinc-450 mt-0.5">
                Set up a community space for your team
              </p>
            </div>
          </button>
        </div>

        {/* Communities Loop */}
        {filteredCommunities.map((community) => (
          <CommunityItem
            key={community.id}
            community={community}
            activeCommunityId={activeCommunityId}
            activeGroupId={activeGroupId}
            onSelectGroup={onSelectGroup}
          />
        ))}

        {/* Empty list search */}
        {filteredCommunities.length === 0 && (
          <div className="py-8 text-center text-zinc-400">
            <p className="text-sm">No communities found</p>
            <p className="text-xs mt-1">Try a different search query</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default CommunitiesList;
