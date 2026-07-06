import mongoose, { Schema, Document, Model } from "mongoose";

export interface IParticipant {
  userId: mongoose.Types.ObjectId;
  role: "member" | "admin";
  joinedAt: Date;
  mutedUntil?: Date;
  isArchived?: boolean;
  isPinned?: boolean;
}

export interface ILastMessage {
  content: string;
  senderId: mongoose.Types.ObjectId;
  timestamp: Date;
  type: "text" | "image" | "audio" | "video" | "document" | "system";
}

export interface IConversation extends Document {
  type: "direct" | "group";
  name?: string;
  avatar?: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  participants: IParticipant[];
  lastMessage?: ILastMessage;
  pinnedMessages: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["member", "admin"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  mutedUntil: {
    type: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
});

const lastMessageSchema = new Schema<ILastMessage>({
  content: {
    type: String,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["text", "image", "audio", "video", "document", "system"],
    default: "text",
  },
});

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: [true, "Conversation type is required"],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Group name must not exceed 50 characters"],
    },
    avatar: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Group description must not exceed 200 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: {
      type: [participantSchema],
      validate: {
        validator: function (v: IParticipant[]) {
          return v && v.length >= 2;
        },
        message: "A conversation must have at least 2 participants",
      },
    },
    lastMessage: {
      type: lastMessageSchema,
    },
    pinnedMessages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────
conversationSchema.index({ "participants.userId": 1, isActive: 1, updatedAt: -1 });
conversationSchema.index({ "participants.userId": 1, "lastMessage.timestamp": -1 });

export const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
