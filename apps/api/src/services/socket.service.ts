import { Server } from "socket.io";
import { logger } from "@/utils/logger";

class SocketService {
  private io: Server | null = null;

  /**
   * Initializes the Socket.IO service with the server instance.
   */
  public init(io: Server): void {
    this.io = io;
    logger.info("🔌 SocketService initialized successfully");
  }

  /**
   * Emits an event to all users in a specific conversation room.
   */
  public emitToConversation(conversationId: string, event: string, data: unknown): void {
    if (!this.io) {
      logger.warn(`Cannot emit to conversation ${conversationId} - SocketService not initialized`);
      return;
    }
    this.io.to(`conv:${conversationId}`).emit(event, data);
    logger.debug(`[Socket] Emitted event '${event}' to conv:${conversationId}`);
  }

  /**
   * Emits an event to a specific user's personal room (across all their connected devices).
   */
  public emitToUser(userId: string, event: string, data: unknown): void {
    if (!this.io) {
      logger.warn(`Cannot emit to user ${userId} - SocketService not initialized`);
      return;
    }
    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug(`[Socket] Emitted event '${event}' to user:${userId}`);
  }
}

export const socketService = new SocketService();
