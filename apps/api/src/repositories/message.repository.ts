import { Message, IMessage } from "@/models/Message";
import mongoose, { UpdateQuery } from "mongoose";
import { sanitizeDeletedUser } from "@/repositories/user.repository";

export const messageRepository = {
  /**
   * Create a new message.
   */
  async create(data: Partial<IMessage>): Promise<IMessage> {
    const message = new Message(data);
    const saved = await message.save();
    return saved.populate([
      { path: "senderId", select: "username email displayName avatar about isOnline lastSeen isDeleted" },
      {
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username email displayName avatar about isOnline lastSeen isDeleted",
        },
      },
    ]);
  },

  /**
   * Find a message by ID.
   */
  async findById(id: string): Promise<IMessage | null> {
    return Message.findById(id)
      .populate("senderId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username email displayName avatar about isOnline lastSeen isDeleted",
        },
      })
      .exec();
  },

  /**
   * Find messages for a conversation, with cursor-based pagination.
   * Fetches messages created BEFORE the cursorId (if provided).
   */
  async findByConversation(
    conversationId: string,
    cursorId?: string,
    limit: number = 50,
    clearedAt?: Date,
    maxCreatedAt?: Date
  ): Promise<IMessage[]> {
    const query: any = {
      conversationId,
      isCleared: { $ne: true },
    };

    if (cursorId) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursorId) };
    }

    if (clearedAt || maxCreatedAt) {
      query.createdAt = {};
      if (clearedAt) query.createdAt.$gt = clearedAt;
      if (maxCreatedAt) query.createdAt.$lte = maxCreatedAt;
    }

    const messages = await Message.find(query)
      .populate("senderId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username email displayName avatar about isOnline lastSeen isDeleted",
        },
      })
      .sort({ _id: -1 }) // Newest messages first
      .limit(limit)
      .lean()
      .exec();

    // Sanitize soft-deleted senders in messages
    messages.forEach((msg: any) => {
      if (msg.senderId) {
        sanitizeDeletedUser(msg.senderId);
      }
      if (msg.replyTo && msg.replyTo.senderId) {
        sanitizeDeletedUser(msg.replyTo.senderId);
      }
    });

    return messages as unknown as IMessage[];
  },

  /**
   * Update a message by ID.
   */
  async updateById(
    id: string,
    update: UpdateQuery<IMessage>
  ): Promise<IMessage | null> {
    return Message.findByIdAndUpdate(id, update, { new: true })
      .populate("senderId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .exec();
  },

  /**
   * Soft delete a message.
   */
  async softDelete(id: string): Promise<IMessage | null> {
    return Message.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        content: "This message was deleted",
        attachments: [],
      },
      { new: true }
    )
      .populate("senderId", "username email displayName avatar about isOnline lastSeen isDeleted")
      .exec();
  },

  /**
   * Soft delete all messages in a conversation.
   */
  async deleteByConversation(conversationId: string): Promise<void> {
    await Message.updateMany({ conversationId }, { isCleared: true, clearedAt: new Date() }).exec();
  },

  /**
   * Toggle the starred state of a message.
   */
  async toggleStar(id: string): Promise<IMessage | null> {
    const msg = await Message.findById(id);
    if (!msg) return null;
    msg.isStarred = !msg.isStarred;
    return msg.save();
  },
};
