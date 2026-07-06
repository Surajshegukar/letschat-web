export interface Attachment {
  name: string;
  size: string;
  url?: string;
  type?: "image" | "audio" | "document" | "video";
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
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  reactions?: {
    emoji: string;
    userIds: string[];
  }[];
  createdAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
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
  partnerId?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  hasMention?: boolean;
  about?: string;
  description?: string;
}
