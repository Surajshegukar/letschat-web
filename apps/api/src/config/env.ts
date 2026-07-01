import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load appropriate env file based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || "development";
const envFile = nodeEnv === "production" ? ".env.production" : ".env.dev";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z.string().url("MONGO_URI must be a valid MongoDB connection string"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
