import { Server, Socket } from "socket.io";
import { logger } from "@/utils/logger";

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join a chat room
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      logger.info(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Leave a chat room
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      logger.info(`Socket ${socket.id} left room ${roomId}`);
    });

    // Receive message and broadcast to other participants in the room
    socket.on("send_message", (message: any) => {
      const { roomId } = message;
      if (roomId) {
        socket.to(roomId).emit("message", message);
        logger.debug(`Broadcasted message in room ${roomId} from ${socket.id}`);
      }
    });

    // Handle user typing indicators
    socket.on("typing", ({ roomId, username }: { roomId: string; username: string }) => {
      socket.to(roomId).emit("typing", { username });
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}
