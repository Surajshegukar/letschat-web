import { Router } from "express";
import { userController } from "@/controllers/user.controller";
import { authenticateJWT } from "@/middlewares/auth";

const router = Router();

router.get("/me", authenticateJWT, userController.getMe);

export default router;
