import { z } from "zod";

export const sendMessageSchema = z
  .object({
    type: z
      .enum(["text", "image", "audio", "video", "document", "system"])
      .default("text"),
    content: z
      .string()
      .max(2000, "Message content must not exceed 2000 characters")
      .optional(),
    replyTo: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID format for replyTo")
      .optional(),
    attachments: z
      .array(
        z.object({
          url: z.string().url(),
          filename: z.string(),
          mimeType: z.string(),
          size: z.number(),
        })
      )
      .optional(),
  })
  .refine((data) => data.content || data.type !== "text", {
    message: "Message content is required for text messages",
    path: ["content"],
  });

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
