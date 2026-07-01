import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const messageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty").max(1000, "Message is too long"),
});

export type MessageInput = z.infer<typeof messageSchema>;
