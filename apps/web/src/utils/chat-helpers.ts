import { ChatRoom, Message } from "@/types/chat";

interface RawParticipant {
  userId?: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    isOnline?: boolean;
    about?: string;
  } | string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface RawConversation {
  _id: string;
  type: "direct" | "group";
  name?: string;
  avatar?: string;
  updatedAt: string;
  participants?: RawParticipant[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount?: number;
}

export interface RawMessage {
  _id: string;
  senderId?: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  } | string;
  content?: string;
  createdAt?: string;
  readBy?: any[];
  deliveredTo?: any[];
  replyTo?: any;
  reactions?: any[];
  attachments?: {
    filename: string;
    size: number;
    url: string;
    mimeType: string;
  }[];
  isStarred?: boolean;
}

/**
 * Utility to format backend mongoose Conversation object to frontend ChatRoom object.
 */
export const formatConversation = (conv: RawConversation, currentUserId: string): ChatRoom => {
  const otherParticipant = conv.participants?.find((p) => {
    if (typeof p.userId === "object" && p.userId !== null) {
      return p.userId._id !== currentUserId;
    }
    return p.userId !== currentUserId;
  })?.userId;

  const otherParticipantObj =
    typeof otherParticipant === "object" ? otherParticipant : null;

  const name =
    conv.type === "group"
      ? conv.name || "Group Chat"
      : otherParticipantObj?.displayName || otherParticipantObj?.username || "Direct Chat";

  const avatar = conv.type === "group" ? conv.avatar : otherParticipantObj?.avatar;

  const isOnline =
    conv.type === "group" ? false : otherParticipantObj?.isOnline || false;

  const timestamp = conv.lastMessage
    ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date(conv.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  const selfParticipant = conv.participants?.find((p) => {
    if (typeof p.userId === "object" && p.userId !== null) {
      return p.userId._id === currentUserId;
    }
    return p.userId === currentUserId;
  });

  return {
    id: conv._id,
    name,
    type: conv.type,
    avatar,
    lastMessage: conv.lastMessage
      ? (conv.lastMessage as any).isDeleted
        ? "This message was deleted"
        : conv.lastMessage.content
      : "No messages yet",
    timestamp,
    unreadCount: conv.unreadCount || 0,
    isOnline,
    partnerId: otherParticipantObj?._id || undefined,
    isPinned: selfParticipant?.isPinned || false,
    isArchived: selfParticipant?.isArchived || false,
    about: otherParticipantObj?.about || undefined,
    description: (conv as any).description || undefined,
  };
};

/**
 * Utility to format backend mongoose Message object to frontend Message object.
 */
export const formatMessage = (msg: RawMessage, currentUserId: string): Message => {
  const senderIdStr =
    typeof msg.senderId === "object" && msg.senderId !== null
      ? msg.senderId._id
      : msg.senderId || "";

  const isMe = senderIdStr === currentUserId;

  const senderObj =
    typeof msg.senderId === "object" && msg.senderId !== null ? msg.senderId : null;

  const senderName = isMe
    ? "You"
    : senderObj?.displayName || senderObj?.username || "User";

  const senderAvatar = senderObj?.avatar || undefined;

  const timestamp = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  const firstAttachment = msg.attachments?.[0];

  let status: "sent" | "delivered" | "read" = "sent";

  const otherRead = msg.readBy?.some((r: any) => {
    const rId = typeof r.userId === "object" && r.userId !== null ? r.userId._id : r.userId;
    return rId !== currentUserId;
  });

  const otherDelivered = msg.deliveredTo?.some((d: any) => {
    const dId = typeof d.userId === "object" && d.userId !== null ? d.userId._id : d.userId;
    return dId !== currentUserId;
  });

  if (otherRead) {
    status = "read";
  } else if (otherDelivered) {
    status = "delivered";
  }

  let replyToObj = undefined;
  if (msg.replyTo && typeof msg.replyTo === "object") {
    const rSender = msg.replyTo.senderId;
    const rSenderName = typeof rSender === "object" && rSender !== null
      ? (rSender.displayName || rSender.username || "User")
      : "User";
    replyToObj = {
      id: msg.replyTo._id,
      senderName: rSenderName,
      content: msg.replyTo.content || "Attachment",
    };
  }

  const reactionsMapped = msg.reactions?.map((r: any) => ({
    emoji: r.emoji,
    userIds: r.userIds?.map((id: any) => typeof id === "object" && id !== null ? id._id : id) || [],
  })) || [];

  return {
    id: msg._id,
    senderId: isMe ? "me" : senderIdStr,
    senderName,
    senderAvatar,
    content: msg.content || "",
    timestamp,
    status,
    replyTo: replyToObj,
    reactions: reactionsMapped,
    createdAt: msg.createdAt,
    isEdited: (msg as any).isEdited || false,
    isDeleted: (msg as any).isDeleted || false,
    isStarred: msg.isStarred || false,
    attachment: firstAttachment
      ? {
          name: firstAttachment.filename,
          size: firstAttachment.mimeType?.startsWith("audio/")
            ? (() => {
                const secs = firstAttachment.size || 0;
                const mins = Math.floor(secs / 60);
                const rem = Math.floor(secs % 60);
                return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
              })()
            : `${Math.round(firstAttachment.size / 1024)} KB`,
          url: firstAttachment.url,
          type: firstAttachment.mimeType?.startsWith("image/")
            ? "image"
            : firstAttachment.mimeType?.startsWith("video/")
              ? "video"
              : firstAttachment.mimeType?.startsWith("audio/")
                ? "audio"
                : "document",
        }
      : undefined,
  };
};
