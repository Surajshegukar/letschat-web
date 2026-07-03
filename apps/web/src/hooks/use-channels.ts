import { useState, useEffect, useMemo } from "react";
import { Channel } from "@/types/channels";
import { channelsService } from "@/services/channels-service";

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Fetch initial channels
  useEffect(() => {
    channelsService.getChannels().then(setChannels);
  }, []);

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || null;
  }, [activeChannelId, channels]);

  const handleFollowToggle = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === channelId) {
          const nowFollowed = !c.isFollowed;
          return {
            ...c,
            isFollowed: nowFollowed,
            followers: nowFollowed ? c.followers + 1 : c.followers - 1,
          };
        }
        return c;
      })
    );
  };

  const handleReactToStory = (channelId: string, storyId: string, emoji: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === channelId) {
          return {
            ...c,
            updates: c.updates.map((story) => {
              if (story.id === storyId) {
                const hasEmoji = story.reactions.some((r) => r.emoji === emoji);
                let updatedReactions = [];
                if (hasEmoji) {
                  updatedReactions = story.reactions.map((r) =>
                    r.emoji === emoji ? { ...r, count: r.count + 1 } : r
                  );
                } else {
                  updatedReactions = [...story.reactions, { emoji, count: 1 }];
                }
                return {
                  ...story,
                  reactions: updatedReactions,
                };
              }
              return story;
            }),
          };
        }
        return c;
      })
    );
  };

  return {
    channels,
    activeChannelId,
    activeChannel,
    setActiveChannelId,
    handleFollowToggle,
    handleReactToStory,
  };
}
export default useChannels;
