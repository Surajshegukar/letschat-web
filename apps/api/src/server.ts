import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./database/connection";
import { setupSocketHandlers } from "./sockets/handler";
import { logger } from "./utils/logger";

import { createAdapter } from "@socket.io/redis-adapter";
import { redisClient, redisSubClient } from "./config/redis";
import { socketService } from "./services/socket.service";

const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configure Redis adapter if clients are available
if (redisClient && redisSubClient) {
  io.adapter(createAdapter(redisClient, redisSubClient));
  logger.info("🔌 Redis adapter attached to Socket.IO Server");
}

// Initialize Socket Service wrapper
socketService.init(io);

setupSocketHandlers(io);

async function startServer() {
  // Connect to database
  await connectDatabase();

  const PORT = env.PORT;
  server.listen(PORT, () => {
    logger.info(`🚀 API Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    logger.info(`🔌 Socket.IO server attached and listening`);
  });
}

// Handle unhandled rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack || "No stack trace available");
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack || "No stack trace available");
  process.exit(1);
});

startServer();
