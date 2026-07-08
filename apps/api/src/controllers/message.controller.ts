import { Request, Response, NextFunction } from "express";
import { messageService } from "@/services/message.service";
import { uploadService } from "@/services/upload.service";

export class MessageController {
  /**
   * Retrieve messages for a conversation using cursor-based pagination.
   */
  getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const userId = req.user!.id;

      const result = await messageService.getMessages(conversationId!, userId, {
        cursor,
        limit,
      });

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Send a new message to a conversation.
   */
  sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const senderId = req.user!.id;

      const message = await messageService.sendMessage(
        senderId,
        conversationId!,
        req.body
      );

      res.status(201).json({
        status: "success",
        statusCode: 201,
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * React to a message.
   */
  /**
   * Edit a message's content (only sender, within 15 minutes).
   */
  editMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId, messageId } = req.params;
      const { content } = req.body;
      const userId = req.user!.id;

      const message = await messageService.editMessage(conversationId!, messageId!, userId, content);

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a message (only sender, within 15 minutes).
   */
  deleteMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId, messageId } = req.params;
      const userId = req.user!.id;

      await messageService.deleteMessage(conversationId!, messageId!, userId);

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * React to a message.
   */
  reactToMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId, messageId } = req.params;
      const { emoji } = req.body;
      const userId = req.user!.id;

      if (!emoji) {
        res.status(400).json({
          status: "error",
          statusCode: 400,
          message: "Emoji is required for reaction",
        });
        return;
      }

      const reactions = await messageService.reactToMessage(
        conversationId!,
        messageId!,
        userId,
        emoji
      );

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { reactions },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload multiple attachment files.
   */
  uploadAttachments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({
          status: "error",
          statusCode: 400,
          message: "No files uploaded",
        });
        return;
      }

      const hostUrl = `${req.protocol}://${req.get("host")}`;
      const attachmentResults = [];

      for (const file of files) {
        const url = await uploadService.uploadMessageAttachment(file, hostUrl);
        
        let type: "image" | "video" | "document" = "document";
        if (file.mimetype.startsWith("image/")) {
          type = "image";
        } else if (file.mimetype.startsWith("video/")) {
          type = "video";
        }

        attachmentResults.push({
          url,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          type,
        });
      }

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { files: attachmentResults },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle starring a message.
   */
  toggleStarMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId, messageId } = req.params;
      const userId = req.user!.id;

      const message = await messageService.toggleStarMessage(
        conversationId!,
        messageId!,
        userId
      );

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const messageController = new MessageController();
