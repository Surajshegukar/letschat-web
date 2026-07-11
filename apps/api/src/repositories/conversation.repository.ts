import { Conversation, IConversation, ILastMessage } from "@/models/Conversation";
import mongoose, { FilterQuery, UpdateQuery } from "mongoose";
import { sanitizeDeletedUser } from "@/repositories/user.repository";

export const conversationRepository = {
  /**
   * Create a new conversation (direct or group).
   */
  async create(data: Partial<IConversation>): Promise<IConversation> {
    const conversation = new Conversation(data);
    return conversation.save();
  },

  /**
   * Find a conversation by ID.
   */
  async findById(id: string): Promise<IConversation | null> {
    return Conversation.findById(id)
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .exec();
  },

  /**
   * Find all conversations where the user is a participant.
   * Sorted by lastMessage timestamp or updatedAt descending.
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IConversation[]> {
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      isActive: true,
      $or: [
        {
          type: "direct",
          participants: {
            $elemMatch: {
              userId: userId,
              isDeleted: { $ne: true },
            },
          },
        },
        {
          type: "group",
          "participants.userId": userId,
        },
      ],
    })
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .sort({ "lastMessage.timestamp": -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Sanitize soft-deleted participants
    conversations.forEach((conv: any) => {
      conv.participants?.forEach((p: any) => {
        if (p.userId) {
          sanitizeDeletedUser(p.userId);
        }
      });
    });

    return conversations as unknown as IConversation[];
  },

  /**
   * Check if a direct conversation already exists between two users.
   */
  async findDirectConversation(
    userAId: string,
    userBId: string
  ): Promise<IConversation | null> {
    const conversation = await Conversation.findOne({
      type: "direct",
      isActive: true,
      "participants.userId": { $all: [userAId, userBId] },
    })
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .lean()
      .exec();

    if (conversation) {
      conversation.participants?.forEach((p: any) => {
        if (p.userId) {
          sanitizeDeletedUser(p.userId);
        }
      });
    }

    return conversation as unknown as IConversation | null;
  },

  /**
   * Update the last message preview of a conversation.
   */
  async updateLastMessage(
    conversationId: string,
    lastMessage: ILastMessage
  ): Promise<IConversation | null> {
    const conversation = await Conversation.findById(conversationId).select("type").exec();
    if (!conversation) return null;

    const update: any = { lastMessage };
    if (conversation.type === "direct") {
      update.$set = { "participants.$[].isDeleted": false };
    }

    return Conversation.findByIdAndUpdate(
      conversationId,
      update,
      { new: true }
    ).exec();
  },

  /**
   * Check if a user is a participant of a conversation.
   */
  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const count = await Conversation.countDocuments({
      _id: conversationId,
      participants: {
        $elemMatch: {
          userId: userId,
          isDeleted: { $ne: true },
        },
      },
      isActive: true,
    }).exec();
    return count > 0;
  },

  /**
   * Toggle pin status for a user in a conversation.
   */
  async togglePin(conversationId: string, userId: string): Promise<IConversation | null> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return null;

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === userId
    );
    if (!participant) return null;

    participant.isPinned = !participant.isPinned;
    return conversation.save();
  },

  /**
   * Toggle archive status for a user in a conversation.
   */
  async toggleArchive(conversationId: string, userId: string): Promise<IConversation | null> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return null;

    const participant = conversation.participants.find(
      (p) => p.userId.toString() === userId
    );
    if (!participant) return null;

    participant.isArchived = !participant.isArchived;
    return conversation.save();
  },

  /**
   * Soft delete a conversation by setting isActive: false.
   */
  async deleteById(id: string): Promise<IConversation | null> {
    return Conversation.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  },

  /**
   * Hide the conversation and clear history for a specific user.
   */
  async deleteForUser(
    conversationId: string,
    userId: string
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, "participants.userId": userId },
      {
        $set: {
          "participants.$.isDeleted": true,
          "participants.$.clearedAt": new Date(),
        },
      },
      { new: true }
    )
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .exec();
  },

  /**
   * Clear conversation message history for a specific user.
   */
  async clearForUser(
    conversationId: string,
    userId: string
  ): Promise<IConversation | null> {
    return Conversation.findOneAndUpdate(
      { _id: conversationId, "participants.userId": userId },
      {
        $set: {
          "participants.$.clearedAt": new Date(),
        },
      },
      { new: true }
    )
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .exec();
  },
};
