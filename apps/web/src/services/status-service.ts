import { UserStatus, StatusStory } from "@/types/status";
import { INITIAL_STATUSES } from "@/data/status-data";

export const statusService = {
  getStatuses(): Promise<UserStatus[]> {
    return Promise.resolve(INITIAL_STATUSES);
  },

  publishStatus(storyData: {
    type: "text" | "image";
    content: string;
    backgroundColor?: string;
    fontFamily?: string;
    caption?: string;
  }): Promise<StatusStory> {
    const newStory: StatusStory = {
      id: "my-story-" + Date.now(),
      type: storyData.type,
      content: storyData.content,
      backgroundColor: storyData.backgroundColor,
      fontFamily: storyData.fontFamily,
      caption: storyData.caption,
      timestamp: "Just now",
    };
    return Promise.resolve(newStory);
  }
};
