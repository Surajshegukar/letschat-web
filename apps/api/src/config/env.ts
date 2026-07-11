import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

import fs from "fs";

// Determine if running from compiled dist directory to set default NODE_ENV
const isProductionDir = __dirname.includes("dist");
const defaultNodeEnv = isProductionDir ? "production" : "development";
const nodeEnv = process.env.NODE_ENV || defaultNodeEnv;

// Ensure process.env.NODE_ENV is populated
process.env.NODE_ENV = nodeEnv;

const envFile = nodeEnv === "production" ? ".env.production" : ".env.dev";
const envPath = path.resolve(process.cwd(), envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
  // Fallback to standard .env if present
  dotenv.config({ override: true });
}

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z.string().url("MONGO_URI must be a valid MongoDB connection string".replace(/%2E/g, ".")).default("mongodb+srv://SurajShegukar:XJmP3pXWW%2EH%25ERT@cluster0.svo13vm.mongodb.net/letschat?retryWrites=true&w=majority&appName=Cluster0"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters").default("letschat_dev_secret_key_123456"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z.string().min(8, "JWT_REFRESH_SECRET must be at least 8 characters").default("letschat_dev_refresh_secret_key_123456"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid client URL").default("http://localhost:3000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().default("re_dev_placeholder"),
  EMAIL_FROM: z.string().default("onboarding@resend.dev"),
  GOOGLE_CLIENT_ID: z.string().default("google_client_id_placeholder"),
  GOOGLE_CLIENT_SECRET: z.string().default("google_client_secret_placeholder"),
  GITHUB_CLIENT_ID: z.string().default("github_client_id_placeholder"),
  GITHUB_CLIENT_SECRET: z.string().default("github_client_secret_placeholder"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().min(1, "VAPID_PUBLIC_KEY is required").default("BPWOGEyappiI3PCNTodV2phDjTgIJffpXnVaSYH8Wmp11pRA8Ep0iUu6LSVrMeoIuI7RRQn94CcTxeqPSrGDvPU"),
  VAPID_PRIVATE_KEY: z.string().min(1, "VAPID_PRIVATE_KEY is required").default("yh_z17oe85GorcwEDYWFTaoD79tQ78339Ak6-_2SsGk"),
  VAPID_EMAIL: z.string().default("mailto:support@letschat.com"),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error("❌ Invalid environment configuration:", err.format());
  }
  throw err;
}

export { env };

