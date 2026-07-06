import { Request, Response, NextFunction } from "express";
import { userService } from "@/services/user.service";
import { uploadService } from "@/services/upload.service";

export class UserController {
  /**
   * Get the current authenticated user's profile.
   */
  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await userService.getProfile(req.user!.id);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update the current authenticated user's profile.
   */
  updateMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search for other users by username/email/displayName.
   */
  searchUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = (req.query.q || "") as string;
      const users = await userService.searchUsers(query, req.user!.id);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete the current authenticated user's account.
   */
  deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await userService.deleteAccount(req.user!.id);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload and process a user profile avatar image.
   */
  uploadAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          status: "error",
          statusCode: 400,
          message: "No avatar image file provided",
        });
        return;
      }

      const hostUrl = `${req.protocol}://${req.get("host")}`;
      const avatarUrl = await uploadService.processAndUploadAvatar(
        req.file.buffer,
        req.user!.id,
        hostUrl
      );

      // Update user in DB
      const user = await userService.updateProfile(req.user!.id, {
        avatar: avatarUrl,
      });

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change current user's password.
   */
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await userService.changePassword(req.user!.id, req.body);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
