import { Request, Response, NextFunction } from "express";
import { authService } from "@/services/auth.service";
import { env } from "@/config/env";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "strict" | "lax" | "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  /** 
   * Register user and send verification email.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ status: "success", statusCode: 201, ...result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email using token from params or query string.
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = (req.params.token || req.query.token) as string;
      const result = await authService.verifyEmail(token);
      res.status(200).json({ status: "success", statusCode: 200, ...result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * User login. Sets refresh token as HTTP-Only cookie, returns access token.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deviceInfo = req.headers["user-agent"];
      const { accessToken, refreshToken, user } = await authService.login(req.body, deviceInfo);

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ status: "success", statusCode: 200, data: { accessToken, user } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh access token using refresh token cookie.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deviceInfo = req.headers["user-agent"];
      const existingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(
        existingRefreshToken,
        deviceInfo
      );

      res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ status: "success", statusCode: 200, data: { accessToken } });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user. Clears refresh token cookie and removes it from DB.
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const userId = req.user?.id;

      if (userId && existingRefreshToken) {
        await authService.logout(userId, existingRefreshToken);
      }

      res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ status: "success", statusCode: 200, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password recovery link.
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  };

  /**
   * Reset password using reset token.
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  };

  /**
   * Get redirect URL for OAuth provider.
   */
  getOAuthUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider } = req.params;
      const result = authService.getOAuthUrl(provider!);
      res.status(200).json({ status: "success", statusCode: 200, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle OAuth callback: exchange code, login/register, set refresh token cookie.
   */
  handleOAuthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider, code } = req.body;
      const deviceInfo = req.headers["user-agent"];

      const { accessToken, refreshToken, user } = await authService.handleOAuthCallback(
        provider,
        code,
        deviceInfo
      );

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ status: "success", statusCode: 200, data: { accessToken, user } });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
