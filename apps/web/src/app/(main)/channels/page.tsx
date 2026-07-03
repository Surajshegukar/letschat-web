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
      {/* Pane 2: Channels Navigation List */}
      <ChannelsList
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        onFollowToggle={handleFollowToggle}
      />

      {/* Pane 3: Channel Stream Dialogue Area */}
      <ChannelDetailWindow
        activeChannel={activeChannel}
        onClearSelection={() => setActiveChannelId(null)}
        onFollowToggle={handleFollowToggle}
        onReactToStory={handleReactToStory}
      />
    </>
  );
}
