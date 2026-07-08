import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .max(50, "Display name must not exceed 50 characters")
    .optional(),
  about: z
    .string()
    .max(200, "About status must not exceed 200 characters")
    .optional(),
  avatar: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

