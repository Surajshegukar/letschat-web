import { messageRepository } from "@/repositories/message.repository";
import { conversationRepository } from "@/repositories/conversation.repository";
import { socketService } from "./socket.service";
import { Message, IMessage } from "@/models/Message";
import { User } from "@/models/User";
import mongoose from "mongoose";

export function formatMessagePayload(message: any, conversation: any) {
  const msgObj = typeof message.toObject === "function" ? message.toObject() : message;
  const messageIdStr = msgObj._id.toString();
  const senderIdStr = (msgObj.senderId?._id || msgObj.senderId || "").toString();

  const deliveredTo: { userId: string; deliveredAt: Date }[] = [];
  const readBy: { userId: string; readAt: Date }[] = [];

  if (conversation) {
    conversation.participants.forEach((p: any) => {
      const pIdStr = (p.userId?._id || p.userId || "").toString();
      if (pIdStr === senderIdStr) return;

      // Check if delivered
      if (p.lastDeliveredMessageId && p.lastDeliveredMessageId.toString() >= messageIdStr) {
        deliveredTo.push({
          userId: pIdStr,
          deliveredAt: p.lastDeliveredAt || p.joinedAt || new Date(),
        });
      }

      // Check if read
      if (p.lastReadMessageId && p.lastReadMessageId.toString() >= messageIdStr) {
        readBy.push({
          userId: pIdStr,
          readAt: p.lastReadAt || p.joinedAt || new Date(),
        });
      }
    });
  }

  return {
    ...msgObj,
    _id: messageIdStr,
    conversationId: msgObj.conversationId.toString(),
    senderId: senderIdStr,
    type: msgObj.type,
    content: msgObj.content,
    attachments: msgObj.attachments?.map((att: any) => ({
      url: att.url,
      filename: att.filename,
      mimeType: att.mimeType,
      size: att.size,
    })) || [],
    reactions: msgObj.reactions?.map((r: any) => ({
      emoji: r.emoji,
      userIds: r.userIds.map((id: any) => id.toString()),
    })) || [],
    replyTo: msgObj.replyTo
      ? {
          _id: msgObj.replyTo._id?.toString() || msgObj.replyTo.toString(),
          content: msgObj.replyTo.content || "",
          senderId: msgObj.replyTo.senderId
            ? typeof msgObj.replyTo.senderId === "object"
              ? msgObj.replyTo.senderId._id?.toString()
              : msgObj.replyTo.senderId.toString()
            : undefined,
        }
      : undefined,
    deliveredTo,
    readBy,
    createdAt: msgObj.createdAt,
    updatedAt: msgObj.updatedAt,
  };
}

export class MessageService {
  /**
   * Send a new message inside a conversation.
   */
  async sendMessage(
    senderId: string,
    conversationId: string,
    input: {
      type: "text" | "image" | "audio" | "video" | "document" | "system";
      content?: string;
      replyTo?: string;
      attachments?: {
        url: string;
        filename: string;
        mimeType: string;
        size: number;
      }[];
    }
  ): Promise<any> {
    // 1. Verify conversation exists and sender is a participant
    const isMember = await conversationRepository.isParticipant(
      conversationId,
      senderId
    );
    if (!isMember) {
      const err: any = new Error("Conversation not found or you are not a participant");
      err.statusCode = 403;
      throw err;
    }

    // 2. If replyTo is provided, verify it exists in the database
    if (input.replyTo) {
      const replyMsg = await messageRepository.findById(input.replyTo);
      if (!replyMsg) {
        const err: any = new Error("Reply message not found");
        err.statusCode = 404;
        throw err;
      }
    }

    // 3. Create the message
    const message = await messageRepository.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(senderId),
      type: input.type,
      content: input.content,
      attachments: input.attachments || [],
      replyTo: input.replyTo ? new mongoose.Types.ObjectId(input.replyTo) : undefined,
    });

    // 4. Update the last message in the conversation (denormalization)
    const contentPreview =
      input.type === "text"
        ? input.content || ""
        : `[${input.type.charAt(0).toUpperCase() + input.type.slice(1)}]`;

    await conversationRepository.updateLastMessage(conversationId, {
      content: contentPreview,
      senderId: new mongoose.Types.ObjectId(senderId),
      timestamp: message.createdAt,
      type: input.type,
    });

    // 5. Update cursors in the Conversation collection
    const conversation = await conversationRepository.findById(conversationId);
    if (conversation) {
      const messageObjectId = message._id;
      const now = new Date();

      const participantIds = conversation.participants
        .map((p) => p.userId._id)
        .filter((id) => id.toString() !== senderId);

      let onlineUserIds: Set<string> = new Set();
      if (participantIds.length > 0) {
        const onlineUsers = await User.find({
          _id: { $in: participantIds },
          isOnline: true,
        }).select("_id");
        onlineUserIds = new Set(onlineUsers.map((u) => u._id.toString()));
      }

      conversation.participants.forEach((p) => {
        const pIdStr = p.userId._id.toString();
        if (pIdStr === senderId) {
          p.lastReadMessageId = messageObjectId;
          p.lastReadAt = now;
          p.lastDeliveredMessageId = messageObjectId;
          p.lastDeliveredAt = now;
        } else if (onlineUserIds.has(pIdStr)) {
          p.lastDeliveredMessageId = messageObjectId;
          p.lastDeliveredAt = now;
        }
      });

      await conversation.save();
    }

    // 6. Format payload & emit socket events
    const messagePayload = formatMessagePayload(message, conversation);

    // Emit real-time socket event to conversation room
    socketService.emitToConversation(conversationId, "new_message", messagePayload);

    // Emit directly to each participant's personal room (handles race where they haven't joined room yet)
    if (conversation) {
      conversation.participants.forEach((p) => {
        const pId = p.userId._id.toString();
        socketService.emitToUser(pId, "new_message", messagePayload);
      });
    }

    return messagePayload;
  }

  /**
   * Get messages inside a conversation with cursor-based pagination.
   */
  async getMessages(
    conversationId: string,
    userId: string,
    pagination: { cursor?: string; limit?: number }
  ): Promise<{ messages: any[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = pagination.limit || 50;

    // 1. Verify user is participant
    const isMember = await conversationRepository.isParticipant(
      conversationId,
      userId
    );
    if (!isMember) {
      const err: any = new Error("Conversation not found or you are not a participant");
      err.statusCode = 403;
      throw err;
    }

    // 2. Fetch messages (requests 1 extra item to check for hasMore)
    const messages = await messageRepository.findByConversation(
      conversationId,
      pagination.cursor,
      limit + 1
    );

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Remove the extra item
    }

    const nextCursor = hasMore && messages.length > 0 ? messages[messages.length - 1]!._id.toString() : null;

    // Fetch conversation participant states to construct dynamic read/delivered arrays
    const conversation = await conversationRepository.findById(conversationId);
    const formattedMessages = messages.map((m) => formatMessagePayload(m, conversation));

    return {
      messages: formattedMessages,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Edit a message's content. Only the sender can edit, within 15 minutes.
   */
  async editMessage(
    conversationId: string,
    messageId: string,
    userId: string,
    content: string
  ): Promise<IMessage> {
    const message = await messageRepository.findById(messageId);
    if (!message || message.conversationId.toString() !== conversationId) {
      const err: any = new Error("Message not found in this conversation");
      err.statusCode = 404;
      throw err;
    }
    const senderId = (message.senderId as any)._id 
      ? (message.senderId as any)._id.toString() 
      : message.senderId.toString();
    if (senderId !== userId) {
      const err: any = new Error("You can only edit your own messages");
      err.statusCode = 403;
      throw err;
    }
    const FIFTEEN_MIN = 15 * 60 * 1000;
    if (Date.now() - new Date(message.createdAt).getTime() > FIFTEEN_MIN) {
      const err: any = new Error("Messages can only be edited within 15 minutes of sending");
      err.statusCode = 403;
      throw err;
    }
    const updated = await messageRepository.updateById(messageId, { content, isEdited: true });
    socketService.emitToConversation(conversationId, "message_edited", {
      conversationId,
      messageId,
      content,
    });
    return updated!;
  }

  /**
   * Soft-delete a message. Only the sender can delete, within 15 minutes.
   */
  async deleteMessage(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const message = await messageRepository.findById(messageId);
    if (!message || message.conversationId.toString() !== conversationId) {
      const err: any = new Error("Message not found in this conversation");
      err.statusCode = 404;
      throw err;
    }
    const senderId = (message.senderId as any)._id 
      ? (message.senderId as any)._id.toString() 
      : message.senderId.toString();
    if (senderId !== userId) {
      const err: any = new Error("You can only delete your own messages");
      err.statusCode = 403;
      throw err;
    }
    const FIFTEEN_MIN = 15 * 60 * 1000;
    if (Date.now() - new Date(message.createdAt).getTime() > FIFTEEN_MIN) {
      const err: any = new Error("Messages can only be deleted within 15 minutes of sending");
      err.statusCode = 403;
      throw err;
    }
    await messageRepository.softDelete(messageId);

    // Update conversation's lastMessage preview if this was the last message
    const conversation = await conversationRepository.findById(conversationId);
    if (conversation?.lastMessage) {
      // Fetch the latest message after deletion to check
      const latest = await messageRepository.findByConversation(conversationId, undefined, 1);
      const latestMsg = latest[0];
      // If the latest message is the one we just deleted (isDeleted), update the preview
      if (latestMsg && latestMsg._id.toString() === messageId) {
        await conversationRepository.updateLastMessage(conversationId, {
          ...conversation.lastMessage,
          content: "This message was deleted",
        });
      }
    }

    socketService.emitToConversation(conversationId, "message_deleted", {
      conversationId,
      messageId,
    });
  }

  /**
   * React to a message in a conversation.
   */
  async reactToMessage(
    conversationId: string,
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<any> {
    const message = await Message.findById(messageId);
    if (!message || message.conversationId.toString() !== conversationId) {
      const err: any = new Error("Message not found in this conversation");
      err.statusCode = 404;
      throw err;
    }

    const uId = new mongoose.Types.ObjectId(userId);

    let userReactedBefore = false;
    let sameEmoji = false;

    // Check existing reactions
    for (const r of message.reactions) {
      const hasUser = r.userIds.some((id) => id.toString() === userId);
      if (hasUser) {
        userReactedBefore = true;
        if (r.emoji === emoji) {
          sameEmoji = true;
        }
        r.userIds = r.userIds.filter((id) => id.toString() !== userId);
      }
    }

    // Clean up empty reactions
    message.reactions = message.reactions.filter((r) => r.userIds.length > 0);

    // Add reaction if not toggling off the same emoji
    if (!userReactedBefore || !sameEmoji) {
      const target = message.reactions.find((r) => r.emoji === emoji);
      if (target) {
        target.userIds.push(uId);
      } else {
        message.reactions.push({
          emoji,
          userIds: [uId],
        } as any);
      }
    }

    await message.save();

    // Map reactions to string arrays for serialization
    const serializedReactions = message.reactions.map((r) => ({
      emoji: r.emoji,
      userIds: r.userIds.map((id) => id.toString()),
    }));

    // Broadcast to conversation participants
    socketService.emitToConversation(conversationId, "message_reaction", {
      conversationId,
      messageId,
      reactions: serializedReactions,
    });

    return serializedReactions;
  }
}

export const messageService = new MessageService();
