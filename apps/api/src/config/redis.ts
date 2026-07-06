import Redis from "ioredis";
import { logger } from "@/utils/logger";

const redisUrl = process.env.REDIS_URL;
let redisClient: Redis | null = null;
let redisSubClient: Redis | null = null;

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    redisSubClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    
    redisClient.on("error", (err) => {
      logger.error(err, "Redis connection error");
    });

    redisSubClient.on("error", (err) => {
      logger.error(err, "Redis sub connection error");
    });

    logger.info("📡 Redis clients initialized successfully for adapter");
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(err, "❌ Failed to initialize Redis client");
  }
} else {
  logger.info("ℹ️ REDIS_URL not set. Running in single-instance mode without Redis adapter.");
}

export { redisClient, redisSubClient };
