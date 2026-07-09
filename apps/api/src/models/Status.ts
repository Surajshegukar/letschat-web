import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoryView {
  userId: mongoose.Types.ObjectId;
  viewedAt: Date;
}

export interface IStatus extends Document {
  userId: mongoose.Types.ObjectId;
  type: "text" | "image";
  content: string; // The text content or S3/local image URL
  backgroundColor?: string; // CSS background classes (e.g. Tailwind gradient)
  textColor?: string;
  fontFamily?: string;
  caption?: string;
  viewedBy: IStoryView[];
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

const StatusSchema = new Schema<IStatus>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["text", "image"],
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
