export interface StatusStory {
  id: string;
  type: "text" | "image";
  content: string; // Text content or Image URL
  backgroundColor?: string; // CSS class for background (e.g. gradients)
  textColor?: string; // CSS color override (defaults to white)
  fontFamily?: string; // Tailwind font class (e.g. font-serif)
  timestamp: string; // e.g. "Today, 10:45 AM"
  caption?: string; // Text caption for images
  viewed?: boolean;
  viewedBy?: { userId: string; viewedAt: string }[];
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
