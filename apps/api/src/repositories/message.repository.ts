import { Message, IMessage } from "@/models/Message";
import mongoose, { UpdateQuery } from "mongoose";

export const messageRepository = {
  /**
   * Create a new message.
   */
  async create(data: Partial<IMessage>): Promise<IMessage> {
    const message = new Message(data);
    const saved = await message.save();
    return saved.populate([
      { path: "senderId", select: "username email displayName avatar about isOnline lastSeen" },
      {
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username email displayName avatar about isOnline lastSeen",
        },
      },
    ]);
  },

  /**
   * Find a message by ID.
   */
  async findById(id: string): Promise<IMessage | null> {
    return Message.findById(id)
      .populate("senderId", "username email displayName avatar about isOnline lastSeen")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username email displayName avatar about isOnline lastSeen",
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
    limit: number = 50
  ): Promise<IMessage[]> {
    const query: any = {
      conversationId,
    };

    if (cursorId) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursorId) };
    }

    return Message.find(query)
      .populate("senderId", "username email displayName avatar about isOnline lastSeen")
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "username email displayName avatar about isOnline lastSeen",
        },
      })
      .sort({ _id: -1 }) // Newest messages first
      .limit(limit)
      .lean()
      .exec() as unknown as Promise<IMessage[]>;
  },

  /**
   * Update a message by ID.
   */
  async updateById(
    id: string,
    update: UpdateQuery<IMessage>
  ): Promise<IMessage | null> {
    return Message.findByIdAndUpdate(id, update, { new: true })
      .populate("senderId", "username email displayName avatar about isOnline lastSeen")
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
      .populate("senderId", "username email displayName avatar about isOnline lastSeen")
      .exec();
  },
};
