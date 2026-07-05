import { Router } from "express";
import { authController } from "@/controllers/auth.controller";
import { validate } from "@/middlewares/validate";
import { authenticateJWT } from "@/middlewares/auth";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  oauthCallbackSchema,
} from "@/validators/auth.validator";

const router = Router();

// Registration & Verification
router.post("/register", validate(registerSchema), authController.register);
router.get("/verify/:token", authController.verifyEmail);
router.get("/verify", authController.verifyEmail);

// Login, Refresh & Logout
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticateJWT, authController.logout);

// OAuth
router.get("/oauth/url/:provider", authController.getOAuthUrl);
router.post("/oauth/callback", validate(oauthCallbackSchema), authController.handleOAuthCallback);

// Password Recovery
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

export default router;
