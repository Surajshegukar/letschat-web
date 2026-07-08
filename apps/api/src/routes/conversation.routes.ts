import { Router } from "express";
import { conversationController } from "@/controllers/conversation.controller";
import { messageController } from "@/controllers/message.controller";
import { authenticateJWT } from "@/middlewares/auth";
import { validate } from "@/middlewares/validate";
import { createConversationSchema } from "@/validators/conversation.validator";
import { sendMessageSchema } from "@/validators/message.validator";
import { upload } from "@/middlewares/upload";

const router = Router();

// Conversation endpoints
router.get("/", authenticateJWT, conversationController.getConversations);
router.post(
  "/",
  authenticateJWT,
  validate(createConversationSchema),
  conversationController.createConversation
);
router.get("/:id", authenticateJWT, conversationController.getConversation);
router.patch("/:id/pin", authenticateJWT, conversationController.togglePinConversation);
router.patch("/:id/archive", authenticateJWT, conversationController.toggleArchiveConversation);
router.delete("/:id", authenticateJWT, conversationController.deleteConversation);
router.delete("/:id/clear", authenticateJWT, conversationController.clearConversation);

// Message endpoints nested inside conversations
router.get(
  "/:conversationId/messages",
  authenticateJWT,
  messageController.getMessages
);
router.post(
  "/:conversationId/messages",
  authenticateJWT,
  validate(sendMessageSchema),
  messageController.sendMessage
);
router.post(
  "/:conversationId/messages/:messageId/react",
  authenticateJWT,
  messageController.reactToMessage
);
router.patch(
  "/:conversationId/messages/:messageId",
  authenticateJWT,
  messageController.editMessage
);
router.patch(
  "/:conversationId/messages/:messageId/star",
  authenticateJWT,
  messageController.toggleStarMessage
);
router.delete(
  "/:conversationId/messages/:messageId",
  authenticateJWT,
  messageController.deleteMessage
);
router.post(
  "/:conversationId/attachments",
  authenticateJWT,
  upload.array("files", 10),
  messageController.uploadAttachments
);

export default router;
