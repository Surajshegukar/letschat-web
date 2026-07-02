export interface Attachment {
  name: string;
  size: string;
  url?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  attachment?: Attachment;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group";
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  hasMention?: boolean;
}
