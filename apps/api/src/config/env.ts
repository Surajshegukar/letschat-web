import dotenv from "dotenv";
import path from "path";

// Load .env file only in non-production (Railway injects vars directly in production)
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.dev") });
}

export interface Env {
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  CLIENT_URL: string;
  CORS_ORIGIN: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
}

const nodeEnv = (process.env.NODE_ENV || "development") as Env["NODE_ENV"];
console.log("Env config :  ", nodeEnv);

const env: Env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: nodeEnv,
  MONGO_URI: process.env.MONGO_URI || "mongodb+srv://SurajShegukar:XJmP3pXWW%2EH%25ERT@cluster0.svo13vm.mongodb.net/letschat?retryWrites=true&w=majority&appName=Cluster0",
  JWT_SECRET: process.env.JWT_SECRET || "letschat_dev_secret_key_123456",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "letschat_dev_refresh_secret_key_123456",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "re_6j1ec2bA_3CTHLAfdp5KafTVhNfaAzv2r",
  EMAIL_FROM: process.env.EMAIL_FROM || "onboarding@resend.dev",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "209611950053-sf3hugluv01c25vgcqitrtkafm8m7pdk.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "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",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "Ov23liozpMWHeR6C9DG9",
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "2187241dcffa7622c2558becfb18686416d0d565",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

// Check for missing critical environment variables in production
if (env.NODE_ENV === "production") {
  const errors: string[] = [];

  const requiredInProduction = [
    { key: "MONGO_URI", placeholder: "mongodb+srv://SurajShegukar:XJmP3pXWW%2EH%25ERT@cluster0.svo13vm.mongodb.net/letschat?retryWrites=true&w=majority&appName=Cluster0" },
    { key: "JWT_SECRET", placeholder: "letschat_dev_secret_key_123456" },
    { key: "JWT_REFRESH_SECRET", placeholder: "letschat_dev_refresh_secret_key_123456" },
    { key: "CLIENT_URL", placeholder: "http://localhost:3000" },
    { key: "CORS_ORIGIN", placeholder: "http://localhost:3000" },
    { key: "RESEND_API_KEY", placeholder: "re_6j1ec2bA_3CTHLAfdp5KafTVhNfaAzv2r" },
    { key: "GOOGLE_CLIENT_ID", placeholder: "209611950053-sf3hugluv01c25vgcqitrtkafm8m7pdk.apps.googleusercontent.com" },
    { key: "GOOGLE_CLIENT_SECRET", placeholder: "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" },
    { key: "GITHUB_CLIENT_ID", placeholder: "Ov23liozpMWHeR6C9DG9" },
    { key: "GITHUB_CLIENT_SECRET", placeholder: "2187241dcffa7622c2558becfb18686416d0d565" },
  ] as const;

  requiredInProduction.forEach(({ key, placeholder }) => {
    const rawValue = process.env[key];
    if (!rawValue || rawValue === placeholder) {
      errors.push(`${key} must be explicitly defined with a production-ready value in production mode.`);
    }
  });

  if (errors.length > 0) {
    console.error("❌ Invalid environment configuration:");
    errors.forEach((err) => console.error(`  - ${err}`));
    throw new Error("Missing required production environment variables.");
  }
}

export { env };
