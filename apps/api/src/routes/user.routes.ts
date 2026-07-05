import { Router } from "express";
import { userController } from "@/controllers/user.controller";
import { authenticateJWT } from "@/middlewares/auth";

const router = Router();

// Protected profile route
router.get("/me", authenticateJWT, userController.getMe.bind(userController));

export default router;
