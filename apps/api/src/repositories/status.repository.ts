import { Status, IStatus } from "@/models/Status";
import mongoose from "mongoose";

export const statusRepository = {
  /**
   * Create a new status story document.
   */
  async create(data: Partial<IStatus>): Promise<IStatus> {
    const status = new Status(data);
    return status.save();
  },

  /**
   * Find a specific status story by ID.
   */
  async findById(statusId: string): Promise<IStatus | null> {
    return Status.findById(statusId).exec();
  },

  /**
   * Get active (non-expired) statuses for a single user.
   * Sorted by createdAt ascending so stories play chronologically.
   */
  async findActiveByUser(userId: string): Promise<IStatus[]> {
    return Status.find({
      userId,
      expiresAt: { $gt: new Date() },
    })
      .populate("userId", "username displayName avatar isOnline lastSeen")
      .populate("viewedBy.userId", "username displayName avatar")
      .populate("reactions.userId", "username displayName avatar")
      .sort({ createdAt: 1 })
      .exec();
  },

  /**
   * Get active (non-expired) statuses for a list of user IDs.
   * Sorted by createdAt ascending.
   */
  async findActiveByUsers(userIds: string[]): Promise<IStatus[]> {
    return Status.find({
      userId: { $in: userIds },
      expiresAt: { $gt: new Date() },
    })
      .populate("userId", "username displayName avatar isOnline lastSeen")
      .populate("viewedBy.userId", "username displayName avatar")
      .populate("reactions.userId", "username displayName avatar")
      .sort({ createdAt: 1 })
      .exec();
  },

  /**
   * Add a viewer to a status story viewedBy array.
   */
  async addView(
    statusId: string,
    viewerId: string
  ): Promise<IStatus | null> {
    return Status.findOneAndUpdate(
      {
        _id: statusId,
        "viewedBy.userId": { $ne: new mongoose.Types.ObjectId(viewerId) },
      },
      {
        $push: {
          viewedBy: {
            userId: new mongoose.Types.ObjectId(viewerId),
            viewedAt: new Date(),
          },
        },
      },
      { new: true }
    ).exec();
  },

  /**
   * Add or update a reaction to a status story.
   */
  async addReaction(
    statusId: string,
    userId: string,
    emoji: string
  ): Promise<IStatus | null> {
    const status = await Status.findById(statusId);
    if (!status) return null;

    const existingReactionIndex = status.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      status.reactions[existingReactionIndex].emoji = emoji;
      status.reactions[existingReactionIndex].reactedAt = new Date();
    } else {
      // Add new reaction
      status.reactions.push({
        userId: new mongoose.Types.ObjectId(userId),
        emoji,
        reactedAt: new Date(),
      });
    }

    return status.save();
  },

  /**
   * Delete a status story (must be owned by the user).
   */
  async delete(statusId: string, userId: string): Promise<IStatus | null> {
    return Status.findOneAndDelete({
      _id: statusId,
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  },
};

export default statusRepository;
