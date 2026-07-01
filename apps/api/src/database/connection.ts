import mongoose from "mongoose";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

export async function connectDatabase() {
  try {
    const mongoUri = env.MONGO_URI;
    
    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connection established successfully");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected");
    });

    await mongoose.connect(mongoUri);
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}. Running in standalone server mode.`);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
