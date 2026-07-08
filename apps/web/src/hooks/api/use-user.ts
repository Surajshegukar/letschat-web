import { useMutation, useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user-service";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

/**
 * Hook for updating profile details (username, displayName, about, presets).
 */
export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (data: {
      username?: string;
      displayName?: string;
      about?: string;
      avatarUrl?: string;
    }) => userService.updateMe(data),
    onSuccess: (response) => {
      const updatedUser = response.data.user;
      updateUser(updatedUser);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update profile settings";
      toast.error(message);
    },
  });
}

/**
 * Hook for uploading custom avatar images.
 */
export function useUploadAvatar() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (response) => {
      const updatedUser = response.data.user;
      updateUser(updatedUser);
      toast.success("Avatar uploaded successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to upload avatar";
      toast.error(message);
    },
  });
}

/**
 * Hook for deleting the user's account.
 */
export function useDeleteAccount() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: (response) => {
      toast.success(response.message || "Account deleted successfully");
      logout();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete account";
      toast.error(message);
    },
  });
}

/**
 * Hook for changing the user's password.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: any) => userService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to change password";
      toast.error(message);
    },
  });
}

/**
 * Hook for searching other users by username/email/displayName.
 */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => userService.searchUsers(query),
  });
}

/**
 * Hook to block a user.
 */
export function useBlockUser() {
  return useMutation({
    mutationFn: (userId: string) => userService.blockUser(userId),
    onSuccess: () => {
      toast.success("User blocked successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to block user";
      toast.error(message);
    },
  });
}

/**
 * Hook to unblock a user.
 */
export function useUnblockUser() {
  return useMutation({
    mutationFn: (userId: string) => userService.unblockUser(userId),
    onSuccess: () => {
      toast.success("User unblocked successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to unblock user";
      toast.error(message);
    },
  });
}

/**
 * Hook to retrieve list of blocked users.
 */
export function useBlockedUsers() {
  return useQuery({
    queryKey: ["users", "blocked"],
    queryFn: () => userService.getBlockedUsers(),
  });
}
