import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoryView {
  userId: mongoose.Types.ObjectId;
  viewedAt: Date;
}

export interface IStatusReaction {
  userId: mongoose.Types.ObjectId;
  emoji: string;
  reactedAt: Date;
}

export interface IStatus extends Document {
  userId: mongoose.Types.ObjectId;
  type: "text" | "image" | "video";
  content: string; // The text content or S3/local media URL
  backgroundColor?: string; // CSS background classes (e.g. Tailwind gradient)
  textColor?: string;
  fontFamily?: string;
  caption?: string;
  viewedBy: IStoryView[];
  reactions: IStatusReaction[];
  createdAt: Date;
  expiresAt: Date; // TTL field
}

const StoryViewSchema = new Schema<IStoryView>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const StatusReactionSchema = new Schema<IStatusReaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  reactedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const StatusSchema = new Schema<IStatus>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["text", "image", "video"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
  },
  textColor: {
    type: String,
  },
  fontFamily: {
    type: String,
  },
  caption: {
    type: String,
  },
  viewedBy: [StoryViewSchema],
  reactions: {
    type: [StatusReactionSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL Index: Mongo automatically deletes documents when current time is past expiresAt
StatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Status: Model<IStatus> = mongoose.model<IStatus>("Status", StatusSchema);
export default Status;
