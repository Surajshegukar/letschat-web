import { Request, Response, NextFunction } from "express";
import { statusService } from "@/services/status.service";

export class StatusController {
  /**
   * Publish a status story.
   */
  publishStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const hostUrl = `${req.protocol}://${req.get("host")}`;

      const { type, content, backgroundColor, textColor, fontFamily, caption } = req.body;

      const story = await statusService.publishStatus(
        userId,
        { type, content, backgroundColor, textColor, fontFamily, caption },
        req.file,
        hostUrl
      );

      res.status(201).json({
        status: "success",
        statusCode: 201,
        data: { story },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active statuses for self and contacts.
   */
  getStatuses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await statusService.getStatuses(userId);

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
   * Mark a story as viewed.
   */
  viewStory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { storyId } = req.params;
      const viewerId = req.user!.id;

      await statusService.viewStory(storyId!, viewerId);

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
   * Delete a story owned by the user.
   */
  deleteStory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { storyId } = req.params;
      const userId = req.user!.id;

      await statusService.deleteStory(storyId!, userId);

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
   * React to a status story with an emoji.
   */
  reactStory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { storyId } = req.params;
      const { emoji } = req.body;
      const userId = req.user!.id;

      if (!emoji) {
        const err: any = new Error("Emoji is required");
        err.statusCode = 400;
        throw err;
      }

      await statusService.reactStory(storyId!, userId, emoji);

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
   * Reply to a status story (sends DM to publisher).
   */
  replyToStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { storyId } = req.params;
      const { message } = req.body;
      const userId = req.user!.id;

      if (!message) {
        const err: any = new Error("Message text is required");
        err.statusCode = 400;
        throw err;
      }

      const chatMessage = await statusService.replyToStatus(userId, storyId!, message);

      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { message: chatMessage },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const statusController = new StatusController();
export default statusController;
