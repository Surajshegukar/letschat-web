import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserStatus, StatusStory } from "@/types/status";
import { INITIAL_STATUSES } from "@/data/status-data";
import { statusService } from "@/services/status-service";

interface StatusState {
  statuses: UserStatus[];
  myStatus: UserStatus;
  activeUserId: string | null;
  setActiveUserId: (id: string | null) => void;
  markRead: (userId: string) => void;
  publishStatus: (newStoryData: {
    type: "text" | "image";
    content: string;
    backgroundColor?: string;
    fontFamily?: string;
    caption?: string;
  }) => Promise<void>;
}

const DEFAULT_MY_STATUS: UserStatus = {
  id: "me",
  userId: "me",
  userName: "John Doe",
  userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  stories: [],
  lastUpdated: "Never",
  hasUnread: false,
};

export const useStatusStore = create<StatusState>()(
  persist(
    (set) => ({
      statuses: INITIAL_STATUSES,
      myStatus: DEFAULT_MY_STATUS,
      activeUserId: null,

      setActiveUserId: (activeUserId) => set({ activeUserId }),

      markRead: (userId) => {
        if (userId === "me") return;
        set((state) => ({
          statuses: state.statuses.map((s) =>
            s.userId === userId ? { ...s, hasUnread: false } : s
          ),
        }));
      },

      publishStatus: async (newStoryData) => {
        const newStory = await statusService.publishStatus(newStoryData);
        set((state) => {
          const updatedStories = [...state.myStatus.stories, newStory];
          return {
            myStatus: {
              ...state.myStatus,
              stories: updatedStories,
              lastUpdated: "Just now",
            },
          };
        });
      },
    }),
    {
      name: "letschat-status-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStatusStore;
