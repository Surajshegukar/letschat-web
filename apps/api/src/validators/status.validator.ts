import { z } from "zod";

export const publishStatusSchema = z.object({
  type: z.enum(["text", "image"], {
    errorMap: () => ({ message: "Type must be 'text' or 'image'" }),
  }),
  content: z.string().max(1000, "Content cannot exceed 1000 characters").optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  caption: z.string().max(200, "Caption cannot exceed 200 characters").optional(),
});

export type PublishStatusInput = z.infer<typeof publishStatusSchema>;
