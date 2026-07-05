import { api } from "@/lib/axios";
import { LoginInput, RegisterInput, ResetPasswordInput } from "@/validation";

export const authService = {
  /**
   * Register a new user.
   */
  async register(data: RegisterInput) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  /**
   * Verify email using token.
   */
  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  },

  /**
   * Login user, returns access token and user info.
   */
  async login(data: LoginInput) {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  /**
   * Invalidate current refresh token and return new access token.
   */
  async refreshToken() {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  /**
   * Log out the current user session.
   */
  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  /**
   * Get current authenticated user profile.
   */
  async getMe() {
    const response = await api.get("/users/me");
    return response.data;
  },

  /**
   * Send a password reset email link.
   */
  async forgotPassword(email: string) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password with valid token.
   */
  async resetPassword(data: ResetPasswordInput) {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  /**
   * Get redirect URL for OAuth provider authorization.
   */
  async getOAuthUrl(provider: string) {
    const response = await api.get(`/auth/oauth/url/${provider}`);
    return response.data;
  },

  /**
   * Complete OAuth authentication by sending provider and code.
   */
  async handleOAuthCallback(provider: string, code: string) {
    const response = await api.post("/auth/oauth/callback", { provider, code });
    return response.data;
  },
};
