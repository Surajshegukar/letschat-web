import { messageRepository } from "@/repositories/message.repository";
import { conversationRepository } from "@/repositories/conversation.repository";
import { socketService } from "./socket.service";
import { Message, IMessage } from "@/models/Message";
import { User } from "@/models/User";
import mongoose from "mongoose";

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
  ): Promise<IMessage> {
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

    // Check which conversation participants are currently online and pre-mark as delivered
    const conversation = await conversationRepository.findById(conversationId);
    const deliveredTo: { userId: mongoose.Types.ObjectId; deliveredAt: Date }[] = [];
    if (conversation) {
      const participantIds = conversation.participants
        .map((p) => p.userId._id)
        .filter((id) => id.toString() !== senderId);

      if (participantIds.length > 0) {
        const onlineUsers = await User.find({
          _id: { $in: participantIds },
          isOnline: true,
        }).select("_id");

        const onlineUserIds = new Set(onlineUsers.map((u) => u._id.toString()));

        for (const p of conversation.participants) {
          const pId = p.userId._id.toString();
          if (onlineUserIds.has(pId)) {
            deliveredTo.push({
              userId: p.userId._id,
              deliveredAt: new Date(),
            });
          }
        }
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
      deliveredTo,
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

    // Serialize to a plain object with string IDs for reliable socket delivery
    const messagePayload = {
      _id: message._id.toString(),
      conversationId: conversationId,
      senderId: senderId,
      type: message.type,
      content: message.content,
      attachments: message.attachments?.map((att) => ({
        url: att.url,
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
      })) || [],
      reactions: message.reactions?.map((r) => ({
        emoji: r.emoji,
        userIds: r.userIds.map((id) => id.toString()),
      })) || [],
      replyTo: message.replyTo
        ? {
            _id: (message.replyTo as any)._id?.toString() || message.replyTo.toString(),
            content: (message.replyTo as any).content || "",
            senderId: (message.replyTo as any).senderId
              ? typeof (message.replyTo as any).senderId === "object"
                ? (message.replyTo as any).senderId._id?.toString()
                : (message.replyTo as any).senderId.toString()
              : undefined,
          }
        : undefined,
      deliveredTo: message.deliveredTo.map((d) => ({
        userId: d.userId.toString(),
        deliveredAt: d.deliveredAt,
      })),
      readBy: message.readBy.map((r) => ({
        userId: r.userId.toString(),
        readAt: r.readAt,
      })),
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    // Emit real-time socket event to conversation room
    socketService.emitToConversation(conversationId, "new_message", messagePayload);

    // Emit directly to each participant's personal room (handles race where they haven't joined room yet)
    if (conversation) {
      conversation.participants.forEach((p) => {
        const pId = p.userId._id.toString();
        socketService.emitToUser(pId, "new_message", messagePayload);
      });
    }

    return message;
  }

  /**
   * Get messages inside a conversation with cursor-based pagination.
   */
  async getMessages(
    conversationId: string,
    userId: string,
    pagination: { cursor?: string; limit?: number }
  ): Promise<{ messages: IMessage[]; nextCursor: string | null; hasMore: boolean }> {
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

    return {
      messages,
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
