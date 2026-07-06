import { Application, Request, Response } from "express";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import conversationRoutes from "@/routes/conversation.routes";

export function registerRoutes(app: Application): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/conversations", conversationRoutes);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });
}
