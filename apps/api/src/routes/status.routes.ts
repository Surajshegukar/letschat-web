import { Router } from "express";
import { statusController } from "@/controllers/status.controller";
import { authenticateJWT } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { publishStatusSchema } from "@/validators/status.validator";
import { upload } from "@/middlewares/upload";

const router = Router();

// Retrieve all active statuses (self + contacts)
router.get("/", authenticateJWT, statusController.getStatuses);

// Publish a new status story (can accept multipart for images/videos)
router.post(
  "/",
  authenticateJWT,
  upload.single("media"),
  validate(publishStatusSchema),
  statusController.publishStatus
);

// Mark a specific story as viewed
router.post("/:storyId/view", authenticateJWT, statusController.viewStory);

// React to a specific story
router.post("/:storyId/react", authenticateJWT, statusController.reactStory);

// Reply to a specific story (sends DM)
router.post("/:storyId/reply", authenticateJWT, statusController.replyToStatus);

// Delete a specific story owned by the user
router.delete("/:storyId", authenticateJWT, statusController.deleteStory);

export default router;
