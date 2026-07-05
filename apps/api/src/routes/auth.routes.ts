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
router.post("/register", validate(registerSchema), authController.register.bind(authController));
router.get("/verify/:token", authController.verifyEmail.bind(authController));
router.get("/verify", authController.verifyEmail.bind(authController)); // Fallback query param support

// Login, Refresh & Logout
router.post("/login", validate(loginSchema), authController.login.bind(authController));
router.post("/refresh", authController.refresh.bind(authController));
router.post("/logout", authenticateJWT, authController.logout.bind(authController));

// OAuth Endpoints
router.get("/oauth/url/:provider", authController.getOAuthUrl.bind(authController));
router.post("/oauth/callback", validate(oauthCallbackSchema), authController.handleOAuthCallback.bind(authController));

// Password Recovery
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword.bind(authController));

export default router;
