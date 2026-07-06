import { Application, Request, Response } from "express";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import conversationRoutes from "@/routes/conversation.routes";
import { env } from "@/config/env";

export function registerRoutes(app: Application): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/conversations", conversationRoutes);

  app.get("/health", (_req: Request, res: Response) => {
    console.log("Health check endpoint called");
    console.log({
      env: {
        NODE_ENV: env.NODE_ENV,
        PORT: env.PORT,
        MONGO_URI: env.MONGO_URI ? "configured" : "missing",
        CLIENT_URL: env.CLIENT_URL,
        CORS_ORIGIN: env.CORS_ORIGIN,
        RESEND_API_KEY: env.RESEND_API_KEY ? "configured" : "missing",
        EMAIL_FROM: env.EMAIL_FROM,
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ? "configured" : "missing",
        GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET ? "configured" : "missing",
        AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY ? "configured" : "missing",
        AWS_REGION: env.AWS_REGION,
        AWS_S3_BUCKET: env.AWS_S3_BUCKET,
      }
    });
    res.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      node_env: env.NODE_ENV,
    });
  });
}
