import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UserPayload } from "@/types";
import { User } from "@/models/User";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { socketService } from "@/services/socket.service";
import { redisClient } from "@/config/redis";
import { logger } from "@/utils/logger";
import mongoose from "mongoose";

export function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use((socket: Socket, next) => {
    let token = socket.handshake.auth?.token;
    if (!token && socket.handshake.headers.authorization) {
      const parts = socket.handshake.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as UserPayload;
      socket.data.user = payload;
      next();
    } catch {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const payload = socket.data.user as UserPayload;
    const userId = payload.id;

    logger.info(`Socket connected: ${socket.id} (User: ${payload.username})`);

    // 1. Join user's personal room
    socket.join(`user:${userId}`);

    // 2. Set user online in MongoDB
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // 3. Keep track of socket mappings in Redis (if configured)
    if (redisClient) {
      await redisClient.sadd("online_users", userId);
      await redisClient.hset(`user_sockets:${userId}`, socket.id, "desktop");
    }

    // 4. Find all user's active conversations and join room channels
    const userConversations = await Conversation.find({
      "participants.userId": userId,
      isActive: true,
    });

    for (const conv of userConversations) {
      const convId = conv._id.toString();
      socket.join(`conv:${convId}`);
    }

    // Mark list of pending undelivered messages as delivered
    const undelivered = await Message.find({
      conversationId: { $in: userConversations.map((c) => c._id) },
      senderId: { $ne: new mongoose.Types.ObjectId(userId) },
      "deliveredTo.userId": { $ne: new mongoose.Types.ObjectId(userId) },
    });

    if (undelivered.length > 0) {
      await Message.updateMany(
        { _id: { $in: undelivered.map((m) => m._id) } },
        {
          $addToSet: {
            deliveredTo: {
              userId: new mongoose.Types.ObjectId(userId),
              deliveredAt: new Date(),
            },
          },
        }
      );

      const groups: Record<string, string[]> = {};
      undelivered.forEach((m) => {
        const cId = m.conversationId.toString();
        if (!groups[cId]) groups[cId] = [];
        groups[cId].push(m._id.toString());
      });

      for (const [cId, msgIds] of Object.entries(groups)) {
        socketService.emitToConversation(cId, "messages_delivered", {
          conversationId: cId,
          userId,
          messageIds: msgIds,
        });
      }
    }

    // Send list of currently online user IDs to the connected user
    const onlineUsers = await User.find({ isOnline: true }).select("_id");
    socket.emit("initial_online_users", onlineUsers.map((u) => u._id.toString()));

    // Broadcast globally that this user is online
    io.emit("user_online", { userId });

    // Handle marking messages as read in a conversation
    socket.on("read_conversation", async ({ conversationId }: { conversationId: string }) => {
      try {
        const unread = await Message.find({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          senderId: { $ne: new mongoose.Types.ObjectId(userId) },
          "readBy.userId": { $ne: new mongoose.Types.ObjectId(userId) },
        });

        if (unread.length > 0) {
          const messageIds = unread.map((m) => m._id.toString());
          await Message.updateMany(
            { _id: { $in: unread.map((m) => m._id) } },
            {
              $addToSet: {
                readBy: {
                  userId: new mongoose.Types.ObjectId(userId),
                  readAt: new Date(),
                },
              },
            }
          );

          io.to(`conv:${conversationId}`).emit("messages_read", {
            conversationId,
            userId,
            messageIds,
          });
        }
      } catch (err) {
        logger.error(`Error in read_conversation event: ${err}`);
      }
    });

    // Handle user typing indicators
    socket.on("typing_start", async ({ conversationId }: { conversationId: string }) => {
      if (redisClient) {
        await redisClient.set(`typing:${conversationId}:${userId}`, "1", "EX", 5);
      }
      socket.to(`conv:${conversationId}`).emit("typing_indicator", {
        conversationId,
        userId,
        username: payload.username,
      });
      logger.debug(`User ${payload.username} started typing in conv:${conversationId}`);
    });

    socket.on("typing_stop", async ({ conversationId }: { conversationId: string }) => {
      if (redisClient) {
        await redisClient.del(`typing:${conversationId}:${userId}`);
      }
      socket.to(`conv:${conversationId}`).emit("typing_stopped", {
        conversationId,
        userId,
        username: payload.username,
      });
      logger.debug(`User ${payload.username} stopped typing in conv:${conversationId}`);
    });

    // Handle join_room explicitly if frontend does it
    socket.on("join_room", (roomId: string) => {
      socket.join(`conv:${roomId}`);
      logger.info(`Socket ${socket.id} joined conversation room conv:${roomId}`);
    });

    // Handle leave_room explicitly if frontend does it
    socket.on("leave_room", (roomId: string) => {
      socket.leave(`conv:${roomId}`);
      logger.info(`Socket ${socket.id} left conversation room conv:${roomId}`);
    });

    socket.on("disconnect", async () => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${payload.username})`);

      let shouldOffline = true;

      // Clean up Redis mapping
      if (redisClient) {
        await redisClient.hdel(`user_sockets:${userId}`, socket.id);
        const remainingSockets = await redisClient.hlen(`user_sockets:${userId}`);
        if (remainingSockets > 0) {
          shouldOffline = false;
        } else {
          await redisClient.srem("online_users", userId);
        }
      }

      if (shouldOffline) {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Broadcast globally that this user went offline
        io.emit("user_offline", { userId });
      }
    });
  });
}
