import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env file only in non-production (Railway injects vars directly in production)
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.dev") });
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
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === "production") {
    const requiredInProduction = [
      { key: "MONGO_URI", placeholder: "mongodb+srv://SurajShegukar:XJmP3pXWW%2EH%25ERT@cluster0.svo13vm.mongodb.net/letschat?retryWrites=true&w=majority&appName=Cluster0" },
      { key: "JWT_SECRET", placeholder: "letschat_dev_secret_key_123456" },
      { key: "JWT_REFRESH_SECRET", placeholder: "letschat_dev_refresh_secret_key_123456" },
      { key: "CLIENT_URL", placeholder: "https://letschat-webclient.vercel.app" },
      { key: "CORS_ORIGIN", placeholder: "https://letschat-webclient.vercel.app" },
      { key: "RESEND_API_KEY", placeholder: "re_6j1ec2bA_3CTHLAfdp5KafTVhNfaAzv2r" },
      { key: "GOOGLE_CLIENT_ID", placeholder: "209611950053-sf3hugluv01c25vgcqitrtkafm8m7pdk.apps.googleusercontent.com" },
      { key: "GOOGLE_CLIENT_SECRET", placeholder: "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" },
      { key: "GITHUB_CLIENT_ID", placeholder: "Ov23liozpMWHeR6C9DG9" },
      { key: "GITHUB_CLIENT_SECRET", placeholder: "2187241dcffa7622c2558becfb18686416d0d565" },
    ] as const;

    requiredInProduction.forEach(({ key, placeholder }) => {
      const val = data[key as keyof typeof data];
      if (!val || val === placeholder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} must be explicitly defined with a production-ready value when NODE_ENV is production.`,
        });
      }
    });
  }
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

