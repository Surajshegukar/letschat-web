import { Router } from "express";
import { getMetaPreview } from "@/controllers/meta.controller";

const router = Router();

// Public endpoint — no auth required
router.get("/", getMetaPreview);

export default router;
