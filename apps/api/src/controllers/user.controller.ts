import { Request, Response, NextFunction } from "express";
import { userRepository } from "@/repositories/user.repository";

export class UserController {
  /**
   * Get the current authenticated user's profile.
   */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await userRepository.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ status: "error", statusCode: 404, message: "User not found" });
        return;
      }
      res.status(200).json({ status: "success", statusCode: 200, data: { user } });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
