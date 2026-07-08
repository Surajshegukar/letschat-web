import { Router } from "express";
import { userController } from "@/controllers/user.controller";
import { authenticateJWT } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { updateProfileSchema, changePasswordSchema } from "@/validators/user.validator";
import { uploadSingleAvatar } from "@/middlewares/upload";

const router = Router();

// Retrieve current user profile
router.get("/me", authenticateJWT, userController.getMe);

// Update current user profile
router.patch(
  "/me",
  authenticateJWT,
  validate(updateProfileSchema),
  userController.updateMe
);

// Change current user password
router.patch(
  "/me/password",
  authenticateJWT,
  validate(changePasswordSchema),
  userController.changePassword
);

// Upload profile avatar image
router.post(
  "/me/avatar",
  authenticateJWT,
  uploadSingleAvatar,
  userController.uploadAvatar
);

// Search for other users
router.get("/search", authenticateJWT, userController.searchUsers);

// Delete current user account
router.delete("/me", authenticateJWT, userController.deleteAccount);

// Block user
router.post("/me/block/:userId", authenticateJWT, userController.blockUser);

// Unblock user
router.post("/me/unblock/:userId", authenticateJWT, userController.unblockUser);

// Get blocked users
router.get("/me/blocked", authenticateJWT, userController.getBlockedUsers);

export default router;
