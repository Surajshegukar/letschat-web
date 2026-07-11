import webpush from "web-push";
import { env } from "@/config/env";
import { userRepository } from "@/repositories/user.repository";
import { logger } from "@/utils/logger";

// Initialize VAPID details
try {
  webpush.setVapidDetails(
    env.VAPID_EMAIL,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
  logger.info("🔑 VAPID details set successfully for Push Notifications");
} catch (error) {
  logger.error(error as Error, "❌ Failed to set VAPID details for Push Notifications");
}

export class PushService {
  /**
   * Send a Web Push Notification to a user.
   */
  async sendPushNotification(
    userId: string,
    payload: {
      title: string;
      body: string;
      icon?: string;
      data?: {
        url?: string;
        conversationId?: string;
      };
    }
  ): Promise<void> {
    try {
      const user = await userRepository.findById(userId, "+pushToken");
      if (!user || !user.pushToken) {
        return;
      }

      const subscription = JSON.parse(user.pushToken);
      
      await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );
      
      logger.debug(`[Push] Successfully sent push notification to user ${userId}`);
    } catch (error: any) {
      logger.warn(`[Push] Failed to send push to user ${userId}:`, error.message);
      
      // If the push subscription has expired or is invalid (410 Gone / 404 Not Found), clear it
      if (error.statusCode === 410 || error.statusCode === 404) {
        logger.info(`[Push] Subscription for user ${userId} expired. Clearing pushToken.`);
        try {
          await userRepository.updateById(userId, { $unset: { pushToken: "" } });
        } catch (dbErr: any) {
          logger.error(`[Push] Failed to clear expired pushToken for user ${userId}:`, dbErr.message);
        }
      }
    }
  }

  /**
   * Send a Web Push Notification for a new chat message to a user.
   */
  async sendNewMessageNotification(
    userId: string,
    senderName: string,
    senderAvatar: string,
    contentPreview: string,
    conversationId: string,
    conversationType: "direct" | "group",
    conversationName?: string
  ): Promise<void> {
    const title = conversationType === "group" 
      ? (conversationName || "Group Chat") 
      : senderName;
    const body = conversationType === "group" 
      ? `${senderName}: ${contentPreview}` 
      : contentPreview;

    return this.sendPushNotification(userId, {
      title,
      body,
      icon: senderAvatar || undefined,
      data: {
        url: `/chat?conv=${conversationId}`,
        conversationId,
      },
    });
  }
}

export const pushService = new PushService();

