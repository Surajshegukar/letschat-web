import { api } from "@/lib/axios";
import { UserStatus, StatusStory } from "@/types/status";

export const statusService = {
  /**
   * Fetch active statuses for self and contacts.
   * Returns { myStatus: UserStatus, statuses: UserStatus[] }
   */
  async getStatuses(): Promise<{ myStatus: UserStatus; statuses: UserStatus[] }> {
    const response = await api.get("/statuses");
    return response.data.data;
  },

  /**
   * Publish a new status story.
   * Supports text statuses, image statuses, or video statuses via FormData.
   */
  async publishStatus(
    storyData: {
      type: "text" | "image" | "video";
      content?: string;
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
      caption?: string;
    },
    file?: File
  ): Promise<StatusStory> {
    if ((storyData.type === "image" || storyData.type === "video") && file) {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("type", storyData.type);
      if (storyData.caption) {
        formData.append("caption", storyData.caption);
      }
      const response = await api.post("/statuses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data.story;
    } else {
      const response = await api.post("/statuses", storyData);
      return response.data.data.story;
    }
  },

  /**
   * Mark a specific status story as viewed.
   */
  async viewStory(storyId: string): Promise<void> {
    await api.post(`/statuses/${storyId}/view`);
  },

  /**
   * React to a specific status story with an emoji.
   */
  async reactStory(storyId: string, emoji: string): Promise<void> {
    await api.post(`/statuses/${storyId}/react`, { emoji });
  },

  /**
   * Reply to a specific status story via DM.
   */
  async replyToStory(storyId: string, message: string): Promise<unknown> {
    const response = await api.post(`/statuses/${storyId}/reply`, { message });
    return response.data.data.message;
  },

  /**
   * Delete a specific status story.
   */
  async deleteStory(storyId: string): Promise<void> {
    await api.delete(`/statuses/${storyId}`);
  },
};

export default statusService;
