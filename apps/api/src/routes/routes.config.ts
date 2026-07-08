import { Application, Request, Response } from "express";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import conversationRoutes from "@/routes/conversation.routes";
import metaRoutes from "@/routes/meta.routes";
import { env } from "@/config/env";

export function registerRoutes(app: Application): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/conversations", conversationRoutes);
  app.use("/api/meta", metaRoutes);

  app.get("/health", (_req: Request, res: Response) => {
    console.log("Health check endpoint called");
    res.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      node_env: env.NODE_ENV,
    });
  });
}
