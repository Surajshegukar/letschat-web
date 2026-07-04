"use client";

import React from "react";
import { ChannelsList } from "@/components/channels/ChannelsList";
import { ChannelDetailWindow } from "@/components/channels/ChannelDetailWindow";
import { useChannels } from "@/hooks/use-channels";

export default function ChannelsPage() {
  const {
    channels,
    activeChannelId,
    activeChannel,
    setActiveChannelId,
    handleFollowToggle,
    handleReactToStory,
  } = useChannels();

  return (
    <>
      <div className={`${activeChannelId ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <ChannelsList
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={setActiveChannelId}
          onFollowToggle={handleFollowToggle}
        />
      </div>

      <div className={`${activeChannelId ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
        <ChannelDetailWindow
          activeChannel={activeChannel}
          onClearSelection={() => setActiveChannelId(null)}
          onFollowToggle={handleFollowToggle}
          onReactToStory={handleReactToStory}
          showBack={!!activeChannelId}
        />
      </div>
    </>
  );
}
