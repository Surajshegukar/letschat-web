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
  JWT_REFRESH_SECRET: z.string().min(8, "JWT_REFRESH_SECRET must be at least 8 characters"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid client URL").default("http://localhost:3000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().default("re_dev_placeholder"),
  EMAIL_FROM: z.string().default("onboarding@resend.dev"),
  GOOGLE_CLIENT_ID: z.string().default("google_client_id_placeholder"),
  GOOGLE_CLIENT_SECRET: z.string().default("google_client_secret_placeholder"),
  GITHUB_CLIENT_ID: z.string().default("github_client_id_placeholder"),
  GITHUB_CLIENT_SECRET: z.string().default("github_client_secret_placeholder"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

