import { Application, Request, Response } from "express";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import conversationRoutes from "@/routes/conversation.routes";

export function registerRoutes(app: Application): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/conversations", conversationRoutes);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date().toISOString(),
      // all env variables 
      env:{
          Node_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT,
          MONGO_URI: process.env.MONGO_URI,
          CLIENT_URL: process.env.CLIENT_URL,
          CORS_ORIGIN: process.env.CORS_ORIGIN,
          RESEND_API_KEY: process.env.RESEND_API_KEY,
          EMAIL_FROM: process.env.EMAIL_FROM,
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
          GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
          GITHUB_CLIENT_SECRET_KEY: process.env.GITHUB_CLIENT_SECRET,
          AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
          AWS_REGION: process.env.AWS_REGION,
          AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      }

     });
  });
}
