import { z } from "zod";

export const createConversationSchema = z.object({
  type: z.enum(["direct", "group"], {
    required_error: "Conversation type is required ('direct' or 'group')",
  }),
  participantIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid participant user ID"))
    .min(1, "At least one participant ID must be provided"),
  name: z
    .string()
    .max(50, "Group name must not exceed 50 characters")
    .optional(),
  description: z
    .string()
    .max(200, "Group description must not exceed 200 characters")
    .optional(),
});

export const updateConversationSchema = z.object({
  name: z
    .string()
    .max(50, "Group name must not exceed 50 characters")
    .optional(),
  description: z
    .string()
    .max(200, "Group description must not exceed 200 characters")
    .optional(),
  avatar: z.string().url("Invalid avatar URL format").optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
