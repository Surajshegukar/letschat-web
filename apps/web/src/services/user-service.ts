import { api } from "@/lib/axios";

export const userService = {
  /**
   * Get current authenticated user profile.
   */
  async getMe() {
    const response = await api.get("/users/me");
    return response.data;
  },

  /**
   * Update the current authenticated user's profile settings.
   */
  async updateMe(data: {
    username?: string;
    displayName?: string;
    about?: string;
    avatarUrl?: string;
  }) {
    const response = await api.patch("/users/me", data);
    return response.data;
  },

  /**
   * Upload user profile avatar image.
   */
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Search users by name/username/email.
   */
  async searchUsers(query: string) {
    const response = await api.get("/users/search", {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Change current user's password.
   */
  async changePassword(data: any) {
    const response = await api.patch("/users/me/password", data);
    return response.data;
  },

  /**
   * Delete current user account.
   */
  async deleteAccount() {
    const response = await api.delete("/users/me");
    return response.data;
  },

  /**
   * Block a user.
   */
  async blockUser(userId: string) {
    const response = await api.post(`/users/me/block/${userId}`);
    return response.data;
  },

  /**
   * Unblock a user.
   */
  async unblockUser(userId: string) {
    const response = await api.post(`/users/me/unblock/${userId}`);
    return response.data;
  },

  /**
   * Get blocked users list.
   */
  async getBlockedUsers() {
    const response = await api.get("/users/me/blocked");
    return response.data;
  },
};
