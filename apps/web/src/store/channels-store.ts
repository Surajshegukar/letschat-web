import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Channel } from "@/types/channels";
import { INITIAL_CHANNELS } from "@/data/channels-data";

interface ChannelsState {
  channels: Channel[];
  activeChannelId: string | null;
  setActiveChannelId: (channelId: string | null) => void;
  toggleFollow: (channelId: string) => void;
  reactToStory: (channelId: string, storyId: string, emoji: string) => void;
}

export const useChannelsStore = create<ChannelsState>()(
  persist(
    (set) => ({
      channels: INITIAL_CHANNELS,
      activeChannelId: null,

      setActiveChannelId: (activeChannelId) => set({ activeChannelId }),

      toggleFollow: (channelId) =>
        set((state) => ({
          channels: state.channels.map((c) => {
            if (c.id === channelId) {
              const nowFollowed = !c.isFollowed;
              return {
                ...c,
                isFollowed: nowFollowed,
                followers: nowFollowed ? c.followers + 1 : c.followers - 1,
              };
            }
            return c;
          }),
        })),

      reactToStory: (channelId, storyId, emoji) =>
        set((state) => ({
          channels: state.channels.map((c) => {
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
          }),
        })),
    }),
    {
      name: "letschat-channels-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChannelsStore;
