import { conversationRepository } from "@/repositories/conversation.repository";
import { userRepository } from "@/repositories/user.repository";
import { IConversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import mongoose from "mongoose";
import { socketService } from "./socket.service";

import { User } from "@/models/User";

export function sanitizeUserForViewer(user: any, viewerId: string): any {
  if (!user) return user;

  const userObj = typeof user.toObject === "function" ? user.toObject() : user;

  const blockedList = userObj.blockedUsers || [];
  const hasBlockedViewer = blockedList.some(
    (id: any) => (id._id || id || "").toString() === viewerId
  );

  if (hasBlockedViewer) {
    userObj.isOnline = false;
    userObj.lastSeen = undefined;
    userObj.avatar = undefined;
    userObj.avatarUrl = undefined;
    userObj.about = "";
  }

  delete userObj.blockedUsers;
  return userObj;
}

export async function sanitizeConversationForUser(conv: any, userId: string): Promise<any> {
  const convObj = typeof conv.toObject === "function" ? conv.toObject() : conv;

  const selfParticipant = convObj.participants?.find(
    (p: any) => (p.userId?._id || p.userId || "").toString() === userId
  );

  if (selfParticipant?.clearedAt && convObj.lastMessage) {
    const clearedTime = new Date(selfParticipant.clearedAt).getTime();
    const lastMsgTime = new Date(convObj.lastMessage.timestamp).getTime();
    if (lastMsgTime <= clearedTime) {
      delete convObj.lastMessage;
    }
  }

  const otherParticipant = convObj.participants?.find(
    (p: any) => (p.userId?._id || p.userId || "").toString() !== userId
  );

  if (otherParticipant && convObj.type === "direct") {
    const otherUser = otherParticipant.userId;
    if (otherUser) {
      const otherUserIdStr = (otherUser._id || otherUser || "").toString();

      const viewer = await User.findById(userId).select("blockedUsers").exec();
      const viewerBlockedList = viewer?.blockedUsers?.map((id: any) => id.toString()) || [];

      const target = await User.findById(otherUserIdStr).select("blockedUsers").exec();
      const targetBlockedList = target?.blockedUsers?.map((id: any) => id.toString()) || [];

      convObj.isBlocked = viewerBlockedList.includes(otherUserIdStr);
      convObj.hasBlockedMe = targetBlockedList.includes(userId);
    }
  }

  if (convObj.participants) {
    convObj.participants = convObj.participants.map((p: any) => {
      if (p.userId) {
        p.userId = sanitizeUserForViewer(p.userId, userId);
      }
      return p;
    });
  }

  return convObj;
}

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
        const convObj = typeof (conv as any).toObject === "function"
          ? (conv as any).toObject()
          : conv;

        const selfParticipant = conv.participants?.find(
          (p: any) => (p.userId?._id || p.userId || "").toString() === userId
        );
        const lastReadMessageId = selfParticipant?.lastReadMessageId;

        const countQuery: any = {
          conversationId: conv._id,
          senderId: { $ne: new mongoose.Types.ObjectId(userId) },
          isCleared: { $ne: true },
        };
        if (lastReadMessageId) {
          countQuery._id = { $gt: lastReadMessageId };
        }
        if (selfParticipant?.clearedAt) {
          countQuery.createdAt = { $gt: selfParticipant.clearedAt };
        }

        const unreadCount = await Message.countDocuments(countQuery);
        const sanitized = await sanitizeConversationForUser(convObj, userId);

        return {
          ...sanitized,
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
      // If the conversation was soft-deleted for either participant, restore it!
      const conversationDoc = await conversationRepository.findById(existing._id.toString());
      if (conversationDoc) {
        let wasModified = false;
        conversationDoc.participants.forEach((p) => {
          if (p.isDeleted) {
            p.isDeleted = false;
            wasModified = true;
          }
        });
        if (wasModified) {
          await conversationDoc.save();
        }
      }

      // Fetch latest populated conversation after restoration
      const updatedConversation = await conversationRepository.findById(existing._id.toString());
      if (updatedConversation) {
        // Still notify participants so their sockets join the room if needed
        for (const p of updatedConversation.participants) {
          const pId = p.userId._id.toString();
          const sanitizedForUser = await sanitizeConversationForUser(updatedConversation, pId);
          socketService.emitToUser(pId, "new_conversation", sanitizedForUser);
        }
        return updatedConversation;
      }

      return existing as unknown as IConversation;
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
    for (const p of populated.participants) {
      const pId = p.userId._id.toString();
      const sanitizedForUser = await sanitizeConversationForUser(populated, pId);
      socketService.emitToUser(pId, "new_conversation", sanitizedForUser);
    }

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
    for (const p of populated.participants) {
      const pId = p.userId._id.toString();
      const sanitizedForUser = await sanitizeConversationForUser(populated, pId);
      socketService.emitToUser(pId, "new_conversation", sanitizedForUser);
    }

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

  /**
   * Delete a conversation (soft delete by setting isActive: false) and all its messages.
   */
  async deleteConversation(conversationId: string, userId: string): Promise<{ message: string }> {
    const isMember = await conversationRepository.isParticipant(conversationId, userId);
    if (!isMember) {
      const err: any = new Error("You are not a participant of this conversation");
      err.statusCode = 403;
      throw err;
    }

    const conversation = await conversationRepository.deleteForUser(conversationId, userId);
    if (!conversation) {
      const err: any = new Error("Conversation not found");
      err.statusCode = 404;
      throw err;
    }

    // Notify the deleting user over Socket.IO (so it is removed from their list)
    socketService.emitToUser(userId, "conversation_deleted", { conversationId });

    return { message: "Conversation deleted successfully" };
  }

  /**
   * Clear all messages in a conversation.
   */
  async clearConversation(conversationId: string, userId: string): Promise<{ message: string }> {
    const isMember = await conversationRepository.isParticipant(conversationId, userId);
    if (!isMember) {
      const err: any = new Error("You are not a participant of this conversation");
      err.statusCode = 403;
      throw err;
    }

    // Clear messages for this specific user
    const conversation = await conversationRepository.clearForUser(conversationId, userId);
    if (!conversation) {
      const err: any = new Error("Conversation not found");
      err.statusCode = 404;
      throw err;
    }

    // Notify only the user who cleared the conversation
    socketService.emitToUser(userId, "conversation_cleared", { conversationId });

    return { message: "Conversation cleared successfully" };
  }
}

export const conversationService = new ConversationService();
