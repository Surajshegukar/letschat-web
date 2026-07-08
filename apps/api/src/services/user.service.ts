import { userRepository } from "@/repositories/user.repository";
import { IUser, User } from "@/models/User";
import { UpdateProfileInput, ChangePasswordInput } from "@/validators/user.validator";
import mongoose from "mongoose";

export class UserService {
  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  /**
   * Update user profile settings.
   */
  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const { displayName, about, avatar, avatarUrl } = input;

    if (displayName !== undefined) {
      user.displayName = displayName;
    }

    if (about !== undefined) {
      user.about = about;
    }

    // Accept either avatar or avatarUrl for frontend compatibility
    const newAvatar = avatar || avatarUrl;
    if (newAvatar !== undefined) {
      user.avatar = newAvatar;
    }

    await user.save();
    return user;
  }

  /**
   * Change user password.
   */
  async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<void> {
    const user = await userRepository.findById(userId, "+password +refreshTokens");
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await user.comparePassword(input.currentPassword);
    if (!isMatch) {
      const err: any = new Error("Incorrect current password");
      err.statusCode = 401;
      throw err;
    }

    user.password = input.newPassword;
    user.refreshTokens = []; // Invalidate all refresh tokens (rotation security)
    await user.save();
  }

  /**
   * Search users by username, email, or display name.
   */
  async searchUsers(query: string, excludeUserId: string): Promise<IUser[]> {
    return userRepository.search(query || "", excludeUserId);
  }

  /**
   * Delete user account by ID.
   */
  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await userRepository.deleteById(userId);
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return { message: "Account deleted successfully" };
  }

  /**
   * Block a user.
   */
  async blockUser(userId: string, targetUserId: string): Promise<IUser> {
    if (userId === targetUserId) {
      const err: any = new Error("Cannot block yourself");
      err.statusCode = 400;
      throw err;
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      const err: any = new Error("User to block not found");
      err.statusCode = 404;
      throw err;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }

    const targetObjectId = targetUser._id as mongoose.Types.ObjectId;
    const isAlreadyBlocked = user.blockedUsers.some(
      (id) => id.toString() === targetObjectId.toString()
    );

    if (!isAlreadyBlocked) {
      user.blockedUsers.push(targetObjectId);
      await user.save();
    }

    return user;
  }

  /**
   * Unblock a user.
   */
  async unblockUser(userId: string, targetUserId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetUserId
    );

    await user.save();
    return user;
  }

  /**
   * Get list of blocked users.
   */
  async getBlockedUsers(userId: string): Promise<IUser[]> {
    const user = await User.findById(userId)
      .populate("blockedUsers", "username email displayName avatar about isOnline lastSeen isDeleted")
      .exec();
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return (user.blockedUsers as unknown as IUser[]) || [];
  }
}

export const userService = new UserService();
