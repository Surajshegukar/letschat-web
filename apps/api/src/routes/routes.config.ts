import { Application, Request, Response } from "express";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";

export function registerRoutes(app: Application): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });
}
