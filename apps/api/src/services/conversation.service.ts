import { conversationRepository } from "@/repositories/conversation.repository";
import { userRepository } from "@/repositories/user.repository";
import { IConversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import mongoose from "mongoose";
import { socketService } from "./socket.service";

export class ConversationService {
  /**
   * Get all active conversations for a user.
   */
  async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any[]> {
    const conversations = await conversationRepository.findByUserId(userId, page, limit);

    // Map and count unread messages for each conversation
    const mappedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: new mongoose.Types.ObjectId(userId) },
          "readBy.userId": { $ne: new mongoose.Types.ObjectId(userId) }
        });
        return {
          ...convObj,
          unreadCount
        };
      })
    );

    return mappedConversations;
  }

  /**
   * Create or fetch a direct conversation between two users.
   */
  async createDirectConversation(
    userId: string,
    targetUserId: string
  ): Promise<IConversation> {
    if (userId === targetUserId) {
      const err: any = new Error("Cannot create a direct conversation with yourself");
      err.statusCode = 400;
      throw err;
    }

    // Check if target user exists
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      const err: any = new Error("Target user not found");
      err.statusCode = 404;
      throw err;
    }

    // Check if direct conversation already exists
    const existing = await conversationRepository.findDirectConversation(
      userId,
      targetUserId
    );
    if (existing) {
      // Still notify participants so their sockets join the room if needed
      existing.participants.forEach((p) => {
        const pId = p.userId._id.toString();
        socketService.emitToUser(pId, "new_conversation", existing);
      });
      return existing;
    }

    // Create a new direct conversation
    const newConversation = await conversationRepository.create({
      type: "direct",
      createdBy: new mongoose.Types.ObjectId(userId),
      participants: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          role: "admin",
          joinedAt: new Date(),
          isArchived: false,
        },
        {
          userId: new mongoose.Types.ObjectId(targetUserId),
          role: "member",
          joinedAt: new Date(),
          isArchived: false,
        },
      ],
      isActive: true,
    });

    // Re-fetch to populate participant details
    const populated = await conversationRepository.findById(newConversation.id);
    if (!populated) {
      const err: any = new Error("Failed to create conversation");
      err.statusCode = 500;
      throw err;
    }

    // Emit event to all participants' personal rooms
    populated.participants.forEach((p) => {
      const pId = p.userId._id.toString();
      socketService.emitToUser(pId, "new_conversation", populated);
    });

    return populated;
  }

  /**
   * Create a group conversation.
   */
  async createGroupConversation(
    userId: string,
    name: string,
    participantIds: string[],
    description?: string
  ): Promise<IConversation> {
    // Unique participants
    const uniqueIds = Array.from(new Set(participantIds)).filter(
      (id) => id !== userId
    );

    if (uniqueIds.length === 0) {
      const err: any = new Error("At least one other participant must be added to a group");
      err.statusCode = 400;
      throw err;
    }

    // Verify all participants exist
    for (const pId of uniqueIds) {
      const exists = await userRepository.findById(pId);
      if (!exists) {
        const err: any = new Error(`Participant user with ID ${pId} not found`);
        err.statusCode = 404;
        throw err;
      }
    }

    const participantsData = [
      {
        userId: new mongoose.Types.ObjectId(userId),
        role: "admin" as const,
        joinedAt: new Date(),
        isArchived: false,
      },
      ...uniqueIds.map((pId) => ({
        userId: new mongoose.Types.ObjectId(pId),
        role: "member" as const,
        joinedAt: new Date(),
        isArchived: false,
      })),
    ];

    const newGroup = await conversationRepository.create({
      type: "group",
      name,
      description,
      createdBy: new mongoose.Types.ObjectId(userId),
      participants: participantsData,
      isActive: true,
    });

    const populated = await conversationRepository.findById(newGroup.id);
    if (!populated) {
      const err: any = new Error("Failed to create group conversation");
      err.statusCode = 500;
      throw err;
    }

    // Emit event to all participants' personal rooms
    populated.participants.forEach((p) => {
      const pId = p.userId._id.toString();
      socketService.emitToUser(pId, "new_conversation", populated);
    });

    return populated;
  }

  /**
   * Get a conversation by ID, checking that the user is a participant.
   */
  async getConversationById(
    conversationId: string,
    userId: string
  ): Promise<IConversation> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation || !conversation.isActive) {
      const err: any = new Error("Conversation not found");
      err.statusCode = 404;
      throw err;
    }

    const isMember = conversation.participants.some(
      (p) => p.userId._id.toString() === userId
    );

    if (!isMember) {
      const err: any = new Error("You are not a participant of this conversation");
      err.statusCode = 403;
      throw err;
    }

    return conversation;
  }

  /**
   * Toggle pin status of a conversation.
   */
  async togglePin(conversationId: string, userId: string): Promise<IConversation> {
    const conversation = await conversationRepository.togglePin(conversationId, userId);
    if (!conversation) {
      const err: any = new Error("Conversation not found or user is not a participant");
      err.statusCode = 404;
      throw err;
    }
    return conversation;
  }

  /**
   * Toggle archive status of a conversation.
   */
  async toggleArchive(conversationId: string, userId: string): Promise<IConversation> {
    const conversation = await conversationRepository.toggleArchive(conversationId, userId);
    if (!conversation) {
      const err: any = new Error("Conversation not found or user is not a participant");
      err.statusCode = 404;
      throw err;
    }
    return conversation;
  }
}

export const conversationService = new ConversationService();
