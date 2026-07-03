import { Community, GroupMessage } from "@/types/communities";
import { INITIAL_COMMUNITIES, INITIAL_MESSAGES } from "@/data/communities-data";

export const communitiesService = {
  getCommunities(): Promise<Community[]> {
    return Promise.resolve(INITIAL_COMMUNITIES);
  },

  getMessages(): Promise<Record<string, GroupMessage[]>> {
    return Promise.resolve(INITIAL_MESSAGES);
  },

  sendMessage(text: string): Promise<GroupMessage> {
    const newMessage: GroupMessage = {
      id: "msg-" + Date.now(),
      sender: "John Doe",
      text,
      timestamp: "Just now",
      isMe: true,
    };
    return Promise.resolve(newMessage);
  }
};
