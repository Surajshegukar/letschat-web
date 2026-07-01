import pino from "pino";
import { env } from "@/config/env";

const isProduction = env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
});
