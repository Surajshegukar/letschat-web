import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachment {
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
  duration?: number; // for audio/video (seconds)
  width?: number; // for images/videos (pixels)
  height?: number;
}

export interface IReaction {
  emoji: string;
  userIds: mongoose.Types.ObjectId[];
}

export interface IDeliveredTo {
  userId: mongoose.Types.ObjectId;
  deliveredAt: Date;
}

export interface IReadBy {
  userId: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: "text" | "image" | "audio" | "video" | "document" | "system";
  content?: string;
  attachments: IAttachment[];
  replyTo?: mongoose.Types.ObjectId;
  reactions: IReaction[];
  deliveredTo: IDeliveredTo[];
  readBy: IReadBy[];
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>({
  url: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  filename: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
});

const reactionSchema = new Schema<IReaction>({
  emoji: {
    type: String,
    required: true,
  },
  userIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const deliveredSchema = new Schema<IDeliveredTo>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deliveredAt: {
    type: Date,
    default: Date.now,
  },
});

const readSchema = new Schema<IReadBy>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  readAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation ID is required"],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    type: {
      type: String,
      enum: ["text", "image", "audio", "video", "document", "system"],
      required: [true, "Message type is required"],
      default: "text",
    },
    content: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    deliveredTo: {
      type: [deliveredSchema],
      default: [],
    },
    readBy: {
      type: [readSchema],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────
// Query: Find messages in a conversation sorted by date (newest first for cursor-based pagination)
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);
