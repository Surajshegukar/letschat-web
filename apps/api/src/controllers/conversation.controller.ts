import { Request, Response, NextFunction } from "express";
import { conversationService } from "@/services/conversation.service";

export class ConversationController {
  /**
   * Retrieve active conversations for the authenticated user.
   */
  getConversations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const conversations = await conversationService.getUserConversations(
        req.user!.id,
        page,
        limit
      );

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { conversations },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new conversation (either direct direct chat or a group).
   */
  createConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type, name, participantIds, description } = req.body;
      const userId = req.user!.id;

      let conversation;

      if (type === "direct") {
        const targetUserId = participantIds[0];
        if (!targetUserId) {
          res.status(400).json({
            status: "error",
            statusCode: 400,
            message: "Direct chat requires at least one target participant user ID",
          });
          return;
        }
        conversation = await conversationService.createDirectConversation(
          userId,
          targetUserId
        );
      } else {
        if (!name) {
          res.status(400).json({
            status: "error",
            statusCode: 400,
            message: "Group chat name is required",
          });
          return;
        }
        conversation = await conversationService.createGroupConversation(
          userId,
          name,
          participantIds,
          description
        );
      }

      res.status(201).json({
        status: "success",
        statusCode: 201,
        data: { conversation },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieve a specific conversation by ID.
   */
  getConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const conversation = await conversationService.getConversationById(
        id!,
        userId
      );

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { conversation },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle pin status for a conversation.
   */
  togglePinConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const conversation = await conversationService.togglePin(id!, userId);

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { conversation },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle archive status for a conversation.
   */
  toggleArchiveConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const conversation = await conversationService.toggleArchive(id!, userId);

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { conversation },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const conversationController = new ConversationController();
