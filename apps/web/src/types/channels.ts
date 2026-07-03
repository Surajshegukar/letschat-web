export interface ChannelStory {
  id: string;
  content: string;
  image?: string;
  timestamp: string;
  reactions: { emoji: string; count: number }[];
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  description: string;
  followers: number;
  isFollowed: boolean;
  updates: ChannelStory[];
}
