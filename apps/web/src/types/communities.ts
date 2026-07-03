export interface CommunityGroup {
  id: string;
  name: string;
  type: "announcement" | "general" | "custom";
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: string;
}

export interface Community {
  id: string;
  name: string;
  avatar: string; // Square avatar representation
  description: string;
  memberCount: number;
  groups: CommunityGroup[];
}

export interface GroupMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}
