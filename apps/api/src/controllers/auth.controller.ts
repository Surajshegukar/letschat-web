import { Request, Response, NextFunction } from "express";
import { authService } from "@/services/auth.service";
import { env } from "@/config/env";

export class AuthController {
  /**
   * Register user and send verification email.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: "success",
        statusCode: 201,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email using token.
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.params.token || req.query.token) as string;
      const result = await authService.verifyEmail(token);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login. Sets refresh token as HTTP-Only cookie, returns access token.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceInfo = req.headers["user-agent"];
      const { accessToken, refreshToken, user } = await authService.login(req.body, deviceInfo);

      // Set Refresh Token as HTTP-Only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: {
          accessToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token using refresh token cookie.
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceInfo = req.headers["user-agent"];
      const existingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(
        existingRefreshToken,
        deviceInfo
      );

      // Set new rotated Refresh Token cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user. Clears refresh token cookie and DB entry.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const userId = req.user?.id;

      if (userId && existingRefreshToken) {
        await authService.logout(userId, existingRefreshToken);
      }

      // Clear Refresh Token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      });

      res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password recovery link.
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "If the email is registered, a password recovery link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password.
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Password reset successful. You can now log in with your new password.",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get redirect URL for OAuth providers.
   */
  async getOAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider } = req.params;
      const result = authService.getOAuthUrl(provider!);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle OAuth callback: exchange code, login/register, set refresh token cookie.
   */
  async handleOAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider, code } = req.body;
      const deviceInfo = req.headers["user-agent"];

      const { accessToken, refreshToken, user } = await authService.handleOAuthCallback(
        provider,
        code,
        deviceInfo
      );

      // Set Refresh Token as HTTP-Only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: {
          accessToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
