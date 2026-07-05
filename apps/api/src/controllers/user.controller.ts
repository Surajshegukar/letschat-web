import { Request, Response, NextFunction } from "express";
import { userRepository } from "@/repositories/user.repository";

export class UserController {
  /**
   * Get the current authenticated user's profile.
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
