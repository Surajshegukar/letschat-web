import { statusRepository } from "@/repositories/status.repository";
import { Conversation } from "@/models/Conversation";
import { User } from "@/models/User";
import { uploadService } from "@/services/upload.service";
import { socketService } from "@/services/socket.service";
import { IStatus } from "@/models/Status";
import mongoose from "mongoose";

function formatStatusTimestamp(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (targetDate.getTime() === today.getTime()) {
    return `Today, ${timeStr}`;
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${dateStr}, ${timeStr}`;
  }
}

export class StatusService {
  /**
   * Publish a status story.
   */
  async publishStatus(
    userId: string,
    storyData: {
      type: "text" | "image";
      content?: string;
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
      caption?: string;
    },
    file?: Express.Multer.File,
    hostUrl?: string
  ): Promise<any> {
    let content = storyData.content || "";

    if (storyData.type === "image" && file && hostUrl) {
      // Upload image and get URL
      content = await uploadService.uploadMessageAttachment(file, hostUrl);
    }

    if (!content && storyData.type === "text") {
      const err: any = new Error("Text status content is required");
      err.statusCode = 400;
      throw err;
    }

    // Story expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const statusDoc = await statusRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: storyData.type,
      content,
      backgroundColor: storyData.backgroundColor,
      textColor: storyData.textColor,
      fontFamily: storyData.fontFamily,
      caption: storyData.caption,
      viewedBy: [],
      expiresAt,
    });

    // Notify contacts via socket event
    const userConversations = await Conversation.find({
      isActive: true,
      "participants.userId": userId,
    });

    const contactIds = new Set<string>();
    userConversations.forEach((conv) => {
      conv.participants.forEach((p) => {
        const pIdStr = p.userId.toString();
        if (pIdStr !== userId) {
          contactIds.add(pIdStr);
        }
      });
    });

    const contactIdsArray = Array.from(contactIds);
    contactIdsArray.forEach((contactId) => {
      socketService.emitToUser(contactId, "status_update", {
        publisherId: userId,
      });
    });

    return {
      id: statusDoc._id.toString(),
      type: statusDoc.type,
      content: statusDoc.content,
      backgroundColor: statusDoc.backgroundColor,
      textColor: statusDoc.textColor,
      fontFamily: statusDoc.fontFamily,
      caption: statusDoc.caption,
      timestamp: formatStatusTimestamp(statusDoc.createdAt),
      viewed: false,
      viewedBy: [],
    };
  }

  /**
   * Get active statuses for the user and their contacts.
   */
  async getStatuses(userId: string): Promise<any> {
    const userConversations = await Conversation.find({
      isActive: true,
      "participants.userId": userId,
    });

    const contactIds = new Set<string>();
    userConversations.forEach((conv) => {
      conv.participants.forEach((p) => {
        const pIdStr = p.userId.toString();
        if (pIdStr !== userId) {
          contactIds.add(pIdStr);
        }
      });
    });
    const contactIdsArray = Array.from(contactIds);

    // Fetch all active stories for self and contacts
    const allStories = await statusRepository.findActiveByUsers([
      userId,
      ...contactIdsArray,
    ]);

    // Group by userId
    const grouped: Record<string, IStatus[]> = {};
    allStories.forEach((story) => {
      const sUserId = story.userId._id.toString();
      if (!grouped[sUserId]) {
        grouped[sUserId] = [];
      }
      grouped[sUserId].push(story);
    });

    const formattedStatuses: any[] = [];
    for (const [sUserId, stories] of Object.entries(grouped)) {
      const firstStory = stories[0];
      if (!firstStory) continue;
      
      const user: any = firstStory.userId;

      const formattedStories = stories.map((story) => {
        const hasViewed = story.viewedBy.some(
          (view: any) => view.userId.toString() === userId
        );
        return {
          id: story._id.toString(),
          type: story.type,
          content: story.content,
          backgroundColor: story.backgroundColor,
          textColor: story.textColor,
          fontFamily: story.fontFamily,
          caption: story.caption,
          timestamp: formatStatusTimestamp(story.createdAt),
          viewed: hasViewed,
          viewedBy: story.viewedBy.map((view: any) => ({
            userId: view.userId.toString(),
            viewedAt: view.viewedAt.toISOString(),
          })),
        };
      });

      const isSelf = sUserId === userId;
      const hasUnread = isSelf
        ? false
        : formattedStories.some((story) => !story.viewed);

      const lastStory = stories[stories.length - 1];
      const lastUpdated = lastStory
        ? formatStatusTimestamp(lastStory.createdAt)
        : "Never";

      formattedStatuses.push({
        id: sUserId,
        userId: sUserId,
        userName: user.displayName || user.username,
        userAvatar: user.avatar || "",
        stories: formattedStories,
        lastUpdated,
        hasUnread,
      });
    }

    const currentUser = await User.findById(userId);
    const myStatus = formattedStatuses.find((s) => s.userId === userId) || {
      id: userId,
      userId: userId,
      userName: currentUser?.displayName || currentUser?.username || "Me",
      userAvatar: currentUser?.avatar || "",
      stories: [],
      lastUpdated: "Never",
      hasUnread: false,
    };

    const contactStatuses = formattedStatuses.filter((s) => s.userId !== userId);

    return {
      myStatus,
      statuses: contactStatuses,
    };
  }

  /**
   * Mark a story as viewed.
   */
  async viewStory(storyId: string, viewerId: string): Promise<void> {
    await statusRepository.addView(storyId, viewerId);
  }

  /**
   * Delete a story.
   */
  async deleteStory(storyId: string, userId: string): Promise<void> {
    const deleted = await statusRepository.delete(storyId, userId);
    if (!deleted) {
      const err: any = new Error("Story not found or you are not authorized to delete it");
      err.statusCode = 404;
      throw err;
    }
  }
}

export const statusService = new StatusService();
export default statusService;
