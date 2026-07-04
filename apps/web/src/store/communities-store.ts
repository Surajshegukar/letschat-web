import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Community, GroupMessage } from "@/types/communities";
import { INITIAL_COMMUNITIES, INITIAL_MESSAGES } from "@/data/communities-data";

interface CommunitiesState {
  communities: Community[];
  groupMessages: Record<string, GroupMessage[]>;
  activeCommunityId: string | null;
  activeGroupId: string | null;
  setActiveCommunityId: (id: string | null) => void;
  setActiveGroupId: (id: string | null) => void;
  selectGroup: (communityId: string, groupId: string | null) => void;
  sendMessageToGroup: (communityId: string, groupId: string, text: string) => void;
}

export const useCommunitiesStore = create<CommunitiesState>()(
  persist(
    (set) => ({
      communities: INITIAL_COMMUNITIES,
      groupMessages: INITIAL_MESSAGES,
      activeCommunityId: null,
      activeGroupId: null,

      setActiveCommunityId: (activeCommunityId) => set({ activeCommunityId }),
      setActiveGroupId: (activeGroupId) => set({ activeGroupId }),

      selectGroup: (communityId, groupId) =>
        set((state) => {
          let updatedCommunities = state.communities;
          if (groupId) {
            updatedCommunities = state.communities.map((c) => {
              if (c.id === communityId) {
                return {
                  ...c,
                  groups: c.groups.map((g) => (g.id === groupId ? { ...g, unreadCount: 0 } : g)),
                };
              }
              return c;
            });
          }
          return {
            activeCommunityId: communityId,
            activeGroupId: groupId,
            communities: updatedCommunities,
          };
        }),

      sendMessageToGroup: (communityId, groupId, text) => {
        const newMessage: GroupMessage = {
          id: "msg-" + Date.now(),
          sender: "John Doe",
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: true,
        };

        set((state) => {
          const groupMsgs = state.groupMessages[groupId] || [];
          const updatedMessages = {
            ...state.groupMessages,
            [groupId]: [...groupMsgs, newMessage],
          };

          const updatedCommunities = state.communities.map((c) => {
            if (c.id === communityId) {
              return {
                ...c,
                groups: c.groups.map((g) => {
                  if (g.id === groupId) {
                    return {
                      ...g,
                      lastMessage: `You: ${text}`,
                      timestamp: "Just now",
                    };
                  }
                  return g;
                }),
              };
            }
            return c;
          });

          return {
            groupMessages: updatedMessages,
            communities: updatedCommunities,
          };
        });
      },
    }),
    {
      name: "letschat-communities-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCommunitiesStore;
