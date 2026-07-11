import { conversationRepository } from "@/repositories/conversation.repository";
import { userRepository } from "@/repositories/user.repository";
import { IConversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import mongoose from "mongoose";
import { socketService } from "./socket.service";
import { User } from "@/models/User";
import { messageRepository } from "@/repositories/message.repository";
import { systemMessages } from "@/utils/system-messages";
import { formatMessagePayload } from "./message.service";

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

  const isRemovedFromGroupGlobal = convObj.type === "group" && selfParticipant?.isDeleted === true;
  const removedAtGlobal: Date | undefined = selfParticipant?.removedAt
    ? new Date(selfParticipant.removedAt)
    : undefined;

  if (selfParticipant?.clearedAt && convObj.lastMessage) {
    const clearedTime = new Date(selfParticipant.clearedAt).getTime();
    const lastMsgTime = new Date(convObj.lastMessage.timestamp).getTime();
    if (lastMsgTime <= clearedTime) {
      delete convObj.lastMessage;
    }
  }

  // For removed group members: hide any lastMessage that arrived after their removal
  if (isRemovedFromGroupGlobal && removedAtGlobal && convObj.lastMessage) {
    const lastMsgTime = new Date(convObj.lastMessage.timestamp).getTime();
    if (lastMsgTime > removedAtGlobal.getTime()) {
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
    // For group chats: if the requesting user has been removed (isDeleted=true),
    // freeze the participants list to only those who were members at the time of removal.
    // This prevents the removed user from seeing newly-added members or updated member count.
    const isRemovedFromGroup = convObj.type === "group" && selfParticipant?.isDeleted === true;
    const removedAt: Date | undefined = selfParticipant?.removedAt
      ? new Date(selfParticipant.removedAt)
      : undefined;

    convObj.participants = convObj.participants
      .filter((p: any) => {
        if (!isRemovedFromGroup) return true;
        // Keep the removed user themselves so isDeleted flag is visible to frontend
        const pId = (p.userId?._id || p.userId || "").toString();
        if (pId === userId) return true;
        // Exclude members who joined after this user was removed
        if (removedAt && p.joinedAt && new Date(p.joinedAt) > removedAt) return false;
        // Exclude members who are also soft-deleted (they left before the snapshot)
        if (p.isDeleted) return false;
        return true;
      })
      .map((p: any) => {
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

        // Removed group participants should always show 0 unread
        const effectiveUnreadCount =
          conv.type === "group" && selfParticipant?.isDeleted ? 0 : unreadCount;

        const sanitized = await sanitizeConversationForUser(convObj, userId);

        return {
          ...sanitized,
          unreadCount: effectiveUnreadCount
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

  /**
   * Helper: emit an event only to active (non-deleted) participants via personal rooms.
   */
  private emitToActiveParticipants(
    conversation: IConversation,
    event: string,
    data: unknown
  ): void {
    conversation.participants.forEach((p) => {
      if (p.isDeleted) return;
      const pId = (p.userId as any)._id?.toString() || p.userId.toString();
      socketService.emitToUser(pId, event, data);
    });
  }

  /**
   * Helper to send system message to conversation and update lastMessage preview.
   */
  async sendSystemMessage(
    conversationId: string,
    content: string,
    initiatorId: string
  ): Promise<any> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) return;

    // Create the system message in DB
    const message = await messageRepository.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(initiatorId),
      type: "system",
      content: content,
    });

    // Update conversation lastMessage preview
    await conversationRepository.updateLastMessage(conversationId, {
      content: content,
      senderId: new mongoose.Types.ObjectId(initiatorId),
      timestamp: message.createdAt,
      type: "system",
    });

    // Notify participants
    conversation.participants.forEach((p) => {
      if (p.isDeleted) return;
      const pId = p.userId._id.toString();
      const messagePayloadForUser = formatMessagePayload(message, conversation, pId);
      socketService.emitToUser(pId, "new_message", messagePayloadForUser);
    });

    return message;
  }

  /**
   * Add participants to group chat.
   */
  async addParticipants(
    conversationId: string,
    adminId: string,
    participantIds: string[]
  ): Promise<IConversation> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation || !conversation.isActive) {
      const err: any = new Error("Conversation not found");
      err.statusCode = 404;
      throw err;
    }

    if (conversation.type !== "group") {
      const err: any = new Error("Conversation is not a group");
      err.statusCode = 400;
      throw err;
    }

    // Verify requester is admin
    const requester = conversation.participants.find(
      (p) => p.userId._id.toString() === adminId && !p.isDeleted
    );
    if (!requester || requester.role !== "admin") {
      const err: any = new Error("Only admins can add participants");
      err.statusCode = 403;
      throw err;
    }

    const adminUser = await User.findById(adminId);
    const adminName = adminUser?.displayName || adminUser?.username || "Admin";

    const addedUserNames: string[] = [];
    const uniqueIds = Array.from(new Set(participantIds));

    for (const pId of uniqueIds) {
      const user = await User.findById(pId);
      if (!user) {
        const err: any = new Error(`User with ID ${pId} not found`);
        err.statusCode = 404;
        throw err;
      }

      addedUserNames.push(user.displayName || user.username);

      const existingPartIndex = conversation.participants.findIndex(
        (p) => p.userId._id.toString() === pId
      );

      if (existingPartIndex > -1) {
        const p = conversation.participants[existingPartIndex];
        if (p.isDeleted) {
          p.isDeleted = false;
          p.role = "member";
          p.joinedAt = new Date();
        }
      } else {
        conversation.participants.push({
          userId: new mongoose.Types.ObjectId(pId),
          role: "member",
          joinedAt: new Date(),
          isArchived: false,
        });
      }
    }

    await conversation.save();

    // Re-fetch populated conversation
    const updatedConv = await conversationRepository.findById(conversationId);
    if (!updatedConv) {
      const err: any = new Error("Failed to retrieve updated conversation");
      err.statusCode = 500;
      throw err;
    }

    // Create system message
    const systemContent = systemMessages.memberAdded(adminName, addedUserNames);
    await this.sendSystemMessage(conversationId, systemContent, adminId);

    // Emit new_conversation to newly added participants
    for (const p of updatedConv.participants) {
      const pId = p.userId._id.toString();
      if (uniqueIds.includes(pId)) {
        const sanitizedForUser = await sanitizeConversationForUser(updatedConv, pId);
        socketService.emitToUser(pId, "new_conversation", sanitizedForUser);
      }
    }

    // Emit conversation_updated only to active (non-deleted) participants
    this.emitToActiveParticipants(updatedConv, "conversation_updated", updatedConv);

    return updatedConv;
  }

  /**
   * Remove a participant or leave the group.
   */
  async removeParticipant(
    conversationId: string,
    requesterId: string,
    targetUserId: string
  ): Promise<IConversation> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation || !conversation.isActive) {
      const err: any = new Error("Conversation not found");
      err.statusCode = 404;
      throw err;
    }

    if (conversation.type !== "group") {
      const err: any = new Error("Conversation is not a group");
      err.statusCode = 400;
      throw err;
    }

    const requesterPart = conversation.participants.find(
      (p) => p.userId._id.toString() === requesterId && !p.isDeleted
    );
    if (!requesterPart) {
      const err: any = new Error("You are not a participant of this group");
      err.statusCode = 403;
      throw err;
    }

    const targetPartIndex = conversation.participants.findIndex(
      (p) => p.userId._id.toString() === targetUserId && !p.isDeleted
    );
    if (targetPartIndex === -1) {
      const err: any = new Error("Target user is not a participant of this group");
      err.statusCode = 404;
      throw err;
    }

    const requesterUser = await User.findById(requesterId);
    const targetUser = await User.findById(targetUserId);
    const requesterName = requesterUser?.displayName || requesterUser?.username || "User";
    const targetName = targetUser?.displayName || targetUser?.username || "User";

    const isSelf = requesterId === targetUserId;

    if (!isSelf && requesterPart.role !== "admin") {
      const err: any = new Error("Only admins can remove participants");
      err.statusCode = 403;
      throw err;
    }

    // Soft delete participant
    const targetPart = conversation.participants[targetPartIndex];
    targetPart.isDeleted = true;
    targetPart.removedAt = new Date();

    // Check if group is empty
    const remainingActive = conversation.participants.filter((p) => !p.isDeleted);
    if (remainingActive.length === 0) {
      conversation.isActive = false;
    } else if (targetPart.role === "admin") {
      // If target was admin, check if there's any remaining admin
      const hasAdmin = remainingActive.some((p) => p.role === "admin");
      if (!hasAdmin) {
        // Promote the next oldest remaining participant to admin
        const nextAdminPart = remainingActive[0];
        nextAdminPart.role = "admin";
        
        const nextAdminUser = await User.findById(nextAdminPart.userId);
        const nextAdminName = nextAdminUser?.displayName || nextAdminUser?.username || "User";
        
        await conversation.save();
        
        const promoteContent = systemMessages.madeAdmin("System", nextAdminName);
        await this.sendSystemMessage(conversationId, promoteContent, requesterId);
      }
    }

    await conversation.save();

    const updatedConv = await conversationRepository.findById(conversationId);
    if (!updatedConv) {
      const err: any = new Error("Failed to retrieve updated conversation");
      err.statusCode = 500;
      throw err;
    }

    // Send system message
    const systemContent = isSelf
      ? systemMessages.memberLeft(targetName)
      : systemMessages.memberRemoved(requesterName, targetName);
    await this.sendSystemMessage(conversationId, systemContent, requesterId);

    // Emit conversation_deleted to target user
    socketService.emitToUser(targetUserId, "conversation_deleted", { conversationId, type: "group" });

    // Emit conversation_updated only to remaining active (non-deleted) members
    this.emitToActiveParticipants(updatedConv, "conversation_updated", updatedConv);

    return updatedConv;
  }

  /**
   * Update group properties (name, description, avatar).
   */
  async updateGroup(
    conversationId: string,
    adminId: string,
    updates: { name?: string; description?: string; avatar?: string }
  ): Promise<IConversation> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation || !conversation.isActive) {
      const err: any = new Error("Conversation not found");
      err.statusCode = 404;
      throw err;
    }

    if (conversation.type !== "group") {
      const err: any = new Error("Conversation is not a group");
      err.statusCode = 400;
      throw err;
    }

    // Verify requester is admin
    const requester = conversation.participants.find(
      (p) => p.userId._id.toString() === adminId && !p.isDeleted
    );
    if (!requester || requester.role !== "admin") {
      const err: any = new Error("Only admins can update group properties");
      err.statusCode = 403;
      throw err;
    }

    const adminUser = await User.findById(adminId);
    const adminName = adminUser?.displayName || adminUser?.username || "Admin";

    const systemMsgContents: string[] = [];

    if (updates.name && updates.name !== conversation.name) {
      systemMsgContents.push(systemMessages.groupNameChanged(adminName, updates.name));
      conversation.name = updates.name;
    }

    if (updates.description !== undefined && updates.description !== conversation.description) {
      systemMsgContents.push(systemMessages.groupDescriptionChanged(adminName));
      conversation.description = updates.description;
    }

    if (updates.avatar && updates.avatar !== conversation.avatar) {
      systemMsgContents.push(systemMessages.groupAvatarChanged(adminName));
      conversation.avatar = updates.avatar;
    }

    await conversation.save();

    const updatedConv = await conversationRepository.findById(conversationId);
    if (!updatedConv) {
      const err: any = new Error("Failed to retrieve updated conversation");
      err.statusCode = 500;
      throw err;
    }

    // Send system messages
    for (const content of systemMsgContents) {
      await this.sendSystemMessage(conversationId, content, adminId);
    }

    // Emit conversation_updated only to active (non-deleted) participants
    this.emitToActiveParticipants(updatedConv, "conversation_updated", updatedConv);

    return updatedConv;
  }

  /**
   * Promote a participant to Admin.
   */
  async promoteToAdmin(
    conversationId: string,
    adminId: string,
    targetUserId: string
  ): Promise<IConversation> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation || !conversation.isActive) {
      const err: any = new Error("Conversation not found");
      err.statusCode = 404;
      throw err;
    }

    if (conversation.type !== "group") {
      const err: any = new Error("Conversation is not a group");
      err.statusCode = 400;
      throw err;
    }

    // Verify requester is admin
    const requester = conversation.participants.find(
      (p) => p.userId._id.toString() === adminId && !p.isDeleted
    );
    if (!requester || requester.role !== "admin") {
      const err: any = new Error("Only admins can promote members");
      err.statusCode = 403;
      throw err;
    }

    const targetPart = conversation.participants.find(
      (p) => p.userId._id.toString() === targetUserId && !p.isDeleted
    );
    if (!targetPart) {
      const err: any = new Error("Target user is not a participant of this group");
      err.statusCode = 404;
      throw err;
    }

    if (targetPart.role === "admin") {
      const err: any = new Error("Target user is already an admin");
      err.statusCode = 400;
      throw err;
    }

    targetPart.role = "admin";
    await conversation.save();

    const updatedConv = await conversationRepository.findById(conversationId);
    if (!updatedConv) {
      const err: any = new Error("Failed to retrieve updated conversation");
      err.statusCode = 500;
      throw err;
    }

    const adminUser = await User.findById(adminId);
    const targetUser = await User.findById(targetUserId);
    const adminName = adminUser?.displayName || adminUser?.username || "Admin";
    const targetName = targetUser?.displayName || targetUser?.username || "User";

    // Send system message
    const promoteContent = systemMessages.madeAdmin(adminName, targetName);
    await this.sendSystemMessage(conversationId, promoteContent, adminId);

    // Emit conversation_updated only to active (non-deleted) participants
    this.emitToActiveParticipants(updatedConv, "conversation_updated", updatedConv);

    return updatedConv;
  }
}

export const conversationService = new ConversationService();
