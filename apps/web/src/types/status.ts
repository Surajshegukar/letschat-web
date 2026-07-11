export interface StatusStoryReaction {
  userId: string;
  userName: string;
  userAvatar: string;
  emoji: string;
  reactedAt: string;
}

export interface StatusStory {
  id: string;
  type: "text" | "image" | "video";
  content: string; // Text content or Media URL
  backgroundColor?: string; // CSS class for background (e.g. gradients)
  textColor?: string; // CSS color override (defaults to white)
  fontFamily?: string; // Tailwind font class (e.g. font-serif)
  timestamp: string; // e.g. "Today, 10:45 AM"
  caption?: string; // Text caption for images/videos
  viewed?: boolean;
  viewedBy?: { userId: string; userName: string; userAvatar: string; viewedAt: string }[];
  reactions?: StatusStoryReaction[];
}

export interface UserStatus {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  stories: StatusStory[];
  lastUpdated: string;
  hasUnread: boolean;
  isOnline?: boolean;
}
