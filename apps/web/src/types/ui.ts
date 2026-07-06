import { Message } from "./chat";

export interface MediaGroup {
  id: string;
  type: "media_group";
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  lastTime: number;
  items: Message[];
}

export type FeedItem = Message | MediaGroup;

export interface EmojiCategory {
  name: string;
  emojis: string[];
}
