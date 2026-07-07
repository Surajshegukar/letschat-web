import { Conversation, IConversation, ILastMessage } from "@/models/Conversation";
import mongoose, { FilterQuery, UpdateQuery } from "mongoose";

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
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen")
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

    return Conversation.find({
      "participants.userId": userId,
      isActive: true,
    })
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen")
      .sort({ "lastMessage.timestamp": -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as unknown as Promise<IConversation[]>;
  },

  /**
   * Check if a direct conversation already exists between two users.
   */
  async findDirectConversation(
    userAId: string,
    userBId: string
  ): Promise<IConversation | null> {
    return Conversation.findOne({
      type: "direct",
      isActive: true,
      "participants.userId": { $all: [userAId, userBId] },
    })
      .populate("participants.userId", "username email displayName avatar about isOnline lastSeen")
      .lean()
      .exec() as unknown as Promise<IConversation | null>;
  },

  /**
   * Update the last message preview of a conversation.
   */
  async updateLastMessage(
    conversationId: string,
    lastMessage: ILastMessage
  ): Promise<IConversation | null> {
    return Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage },
      { new: true }
    ).exec();
  },

  /**
   * Check if a user is a participant of a conversation.
   */
  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const count = await Conversation.countDocuments({
      _id: conversationId,
      "participants.userId": userId,
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
};
