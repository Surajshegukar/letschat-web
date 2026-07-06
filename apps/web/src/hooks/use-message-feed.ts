import { useMemo } from "react";
import { Message } from "@/types/chat";
import { FeedItem, MediaGroup } from "@/types/ui";

export function useMessageFeed(messages: Message[]): FeedItem[] {
  return useMemo(() => {
    const items: FeedItem[] = [];
    let currentGroup: MediaGroup | null = null;

    const flush = () => {
      if (!currentGroup) return;
      if (currentGroup.items.length === 1) {
        items.push(currentGroup.items[0]!);
      } else {
        items.push(currentGroup);
      }
      currentGroup = null;
    };

    messages.forEach((msg) => {
      const isMedia =
        msg.attachment &&
        ((msg.attachment.type as string) === "image" || (msg.attachment.type as string) === "video");

      if (isMedia) {
        const msgTime = msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now();
        const canGroup =
          currentGroup &&
          currentGroup.senderId === msg.senderId &&
          msgTime - currentGroup.lastTime <= 15 * 60 * 1000;

        if (canGroup && currentGroup) {
          currentGroup.items.push(msg);
          currentGroup.lastTime = msgTime;
          currentGroup.status = msg.status;
          currentGroup.timestamp = msg.timestamp;
        } else {
          flush();
          currentGroup = {
            id: `group-${msg.id}`,
            type: "media_group",
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            timestamp: msg.timestamp,
            status: msg.status,
            lastTime: msgTime,
            items: [msg],
          };
        }
      } else {
        flush();
        items.push(msg);
      }
    });

    flush();
    return items;
  }, [messages]);
}
