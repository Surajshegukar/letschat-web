import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UserPayload } from "@/types";
import { User } from "@/models/User";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";
import { socketService } from "@/services/socket.service";
import { redisClient } from "@/config/redis";
import { messageService } from "@/services/message.service";
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

    // Broadcast active connections count
    io.emit("active_connections_count", io.sockets.sockets.size);

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

    // Extract unique contact IDs from active conversations for targeted presence
    const contactIds = new Set<string>();
    userConversations.forEach((conv) => {
      conv.participants.forEach((p) => {
        const pIdStr = p.userId.toString();
        if (pIdStr !== userId) {
          contactIds.add(pIdStr);
        }
      });
    });
    const contactIdsArray = Array.from(contactIds);

    // Send list of currently online contact user IDs to the connected user
    let onlineContactIds: string[] = [];
    if (contactIdsArray.length > 0) {
      const onlineContacts = await User.find({
        _id: { $in: contactIdsArray },
        isOnline: true,
      }).select("_id");
      onlineContactIds = onlineContacts.map((u) => u._id.toString());
    }
    socket.emit("initial_online_users", onlineContactIds);

    // Broadcast ONLY to direct contacts that this user is online
    contactIdsArray.forEach((cId) => {
      io.to(`user:${cId}`).emit("user_online", { userId });
    });

    // Update delivery receipts for all active conversations on connection
    for (const conv of userConversations) {
      const convId = conv._id.toString();
      const latestMsg = await Message.findOne({ conversationId: conv._id })
        .sort({ _id: -1 })
        .select("_id senderId");

      if (latestMsg) {
        const latestMsgId = latestMsg._id;
        const selfParticipant = conv.participants.find(
          (p) => p.userId.toString() === userId
        );

        const currentDeliveredId = selfParticipant?.lastDeliveredMessageId;
        const isSender = latestMsg.senderId.toString() === userId;

        if (!isSender && (!currentDeliveredId || latestMsgId.toString() > currentDeliveredId.toString())) {
          await Conversation.updateOne(
            { _id: conv._id, "participants.userId": userId },
            {
              $set: {
                "participants.$.lastDeliveredMessageId": latestMsgId,
                "participants.$.lastDeliveredAt": new Date(),
              },
            }
          );

          socketService.emitToConversation(convId, "messages_delivered", {
            conversationId: convId,
            userId,
            lastDeliveredMessageId: latestMsgId.toString(),
          });
        }
      }
    }

    // Handle marking messages as read in a conversation
    socket.on("read_conversation", async ({ conversationId }: { conversationId: string }) => {
      try {
        const roomName = `conv:${conversationId}`;
        socket.join(roomName);
        const count = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        io.to(roomName).emit("room_listeners_count", { conversationId, count });

        const latestMsg = await Message.findOne({ conversationId })
          .sort({ _id: -1 })
          .select("_id senderId");

        if (latestMsg) {
          const latestMsgId = latestMsg._id;
          const conv = await Conversation.findOne({
            _id: conversationId,
            "participants.userId": userId,
          });

          if (conv) {
            const selfParticipant = conv.participants.find(
              (p) => p.userId.toString() === userId
            );

            const currentReadId = selfParticipant?.lastReadMessageId;

            if (!currentReadId || latestMsgId.toString() > currentReadId.toString()) {
              const updateDoc: any = {
                "participants.$.lastReadMessageId": latestMsgId,
                "participants.$.lastReadAt": new Date(),
              };

              const currentDeliveredId = selfParticipant?.lastDeliveredMessageId;
              if (!currentDeliveredId || latestMsgId.toString() > currentDeliveredId.toString()) {
                updateDoc["participants.$.lastDeliveredMessageId"] = latestMsgId;
                updateDoc["participants.$.lastDeliveredAt"] = new Date();
              }

              await Conversation.updateOne(
                { _id: conversationId, "participants.userId": userId },
                { $set: updateDoc }
              );

              io.to(`conv:${conversationId}`).emit("messages_read", {
                conversationId,
                userId,
                lastReadMessageId: latestMsgId.toString(),
              });

              if (updateDoc["participants.$.lastDeliveredMessageId"]) {
                io.to(`conv:${conversationId}`).emit("messages_delivered", {
                  conversationId,
                  userId,
                  lastDeliveredMessageId: latestMsgId.toString(),
                });
              }
            }
          }
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
      const roomName = `conv:${roomId}`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined conversation room ${roomName}`);
      const count = io.sockets.adapter.rooms.get(roomName)?.size || 0;
      io.to(roomName).emit("room_listeners_count", { conversationId: roomId, count });
    });

    // Handle leave_room explicitly if frontend does it
    socket.on("leave_room", (roomId: string) => {
      const roomName = `conv:${roomId}`;
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left conversation room ${roomName}`);
      const count = io.sockets.adapter.rooms.get(roomName)?.size || 0;
      io.to(roomName).emit("room_listeners_count", { conversationId: roomId, count });
    });

    // Handle ping latency test
    socket.on("ping_test", (timestamp: number) => {
      socket.emit("pong_test", timestamp);
    });

    // Handle sending a message via WebSockets directly (WebSocket-first)
    socket.on(
      "send_message",
      async (
        payload: {
          conversationId: string;
          data: {
            type: "text" | "image" | "audio" | "video" | "document" | "system";
            content?: string;
            replyTo?: string;
            attachments?: {
              url: string;
              filename: string;
              mimeType: string;
              size: number;
            }[];
          };
        },
        callback?: (res: { status: "success" | "error"; data?: { message: any }; message?: string }) => void
      ) => {
        try {
          const message = await messageService.sendMessage(
            userId,
            payload.conversationId,
            payload.data
          );

          if (callback) {
            callback({
              status: "success",
              data: { message },
            });
          }
        } catch (err: any) {
          logger.error(`Error sending message via Socket.IO: ${err}`);
          if (callback) {
            callback({
              status: "error",
              message: err.message || "Failed to send message",
            });
          }
        }
      }
    );

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

        // Broadcast ONLY to direct contacts that this user went offline
        contactIdsArray.forEach((cId) => {
          io.to(`user:${cId}`).emit("user_offline", { userId });
        });
      }

      // Broadcast active connections count
      io.emit("active_connections_count", io.sockets.sockets.size);

      // Broadcast new room listener counts
      userConversations.forEach((conv) => {
        const convId = conv._id.toString();
        const roomName = `conv:${convId}`;
        const count = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        io.to(roomName).emit("room_listeners_count", { conversationId: convId, count });
      });
    });
  });
}
