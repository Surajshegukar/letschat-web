import React, { useState } from "react";
import { Search, Plus, Radio, Compass, X } from "lucide-react";
import { Channel } from "@/types/channels";
import { ChannelItem } from "./ChannelItem";

interface ChannelsListProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (channelId: string | null) => void;
  onFollowToggle: (channelId: string) => void;
}

export function ChannelsList({
  channels,
  activeChannelId,
  onSelectChannel,
  onFollowToggle,
}: ChannelsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const followedChannels = filteredChannels.filter((c) => c.isFollowed);
  const discoverChannels = filteredChannels.filter((c) => !c.isFollowed);

  return (
    <div className="w-full max-w-[430px] h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex-shrink-0 select-none">
      
      {/* 1. Header Title */}
      <div className="h-20 px-6 border-b border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Channels</h2>
        <button
          onClick={() => alert("Creating custom broadcast channels is restricted to administrators.")}
          title="Create a Channel"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition text-zinc-500 hover:text-emerald-500 dark:hover:text-[#19E68C]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* 2. Channel Search Bar */}
      <div className="px-4 py-3 border-b border-zinc-150/40 dark:border-zinc-900/60 flex-shrink-0">
        <div className="relative flex items-center bg-zinc-100/70 dark:bg-zinc-900/40 border border-transparent focus-within:border-zinc-200 dark:focus-within:border-zinc-800 rounded-xl px-3.5 py-2 transition-all">
          <Search className="h-4 w-4 text-zinc-450 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search channels..."
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

      {/* 3. Channels Lists Deck */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        
        {/* Section A: My Channels */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="h-3 w-3" />
            <span>My Channels ({followedChannels.length})</span>
          </div>

          {followedChannels.length > 0 ? (
            <div className="space-y-1">
              {followedChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannelId === channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                />
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-150/80 dark:border-zinc-800/80">
              You aren't following any channels yet.
              <br /> Explore recommendations below!
            </div>
          )}
        </div>

        {/* Section B: Find / Discover Channels */}
        {discoverChannels.length > 0 && (
          <div className="space-y-2">
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 border-t border-zinc-100 dark:border-zinc-900 pt-4">
              <Compass className="h-3 w-3" />
              <span>Find Channels</span>
            </div>

            <div className="space-y-2">
              {discoverChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  showFollowButton={true}
                  onFollowToggle={() => onFollowToggle(channel.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty search */}
        {filteredChannels.length === 0 && (
          <div className="py-8 text-center text-zinc-400">
            <p className="text-sm">No channels found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default ChannelsList;
