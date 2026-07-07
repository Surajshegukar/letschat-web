import { User, IUser } from "@/models/User";
import { FilterQuery, UpdateQuery } from "mongoose";

/**
 * User Repository — Data access layer for User documents.
 * All MongoDB operations for users go through this class.
 * Controllers and services never touch Mongoose directly.
 */
export const userRepository = {
  /**
   * Find a user by email. Does NOT include sensitive fields by default.
   */
  async findByEmail(
    email: string,
    selectFields?: string
  ): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (selectFields) query.select(selectFields);
    return query.exec();
  },

  /**
   * Find a user by ID. Does NOT include sensitive fields by default.
   */
  async findById(id: string, selectFields?: string): Promise<IUser | null> {
    const query = User.findById(id);
    if (selectFields) query.select(selectFields);
    return query.exec();
  },

  /**
   * Find a user by username.
   */
  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username }).exec();
  },

  /**
   * Find a user by a custom query (e.g. verification token, reset token).
   */
  async findOne(
    filter: FilterQuery<IUser>,
    selectFields?: string
  ): Promise<IUser | null> {
    const query = User.findOne(filter);
    if (selectFields) query.select(selectFields);
    return query.exec();
  },

  /**
   * Create a new user document.
   */
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  },

  /**
   * Update a user by ID.
   */
  async updateById(
    id: string,
    update: UpdateQuery<IUser>
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  /**
   * Check if a user with the given email already exists.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({
      email: email.toLowerCase(),
    }).exec();
    return count > 0;
  },

  /**
   * Check if a user with the given username already exists.
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await User.countDocuments({ username }).exec();
    return count > 0;
  },

  /**
   * Search users by username or email (for finding contacts).
   * Excludes the current user from results.
   */
  async search(
    query: string,
    excludeUserId: string,
    limit: number = 100
  ): Promise<IUser[]> {
    // When query is empty, return ALL users (except self).
    // When query has text, filter by username/email/displayName regex.
    const filter: FilterQuery<IUser> = {
      _id: { $ne: excludeUserId },
    };

    if (query.trim()) {
      const regex = new RegExp(query.trim(), "i");
      filter.$or = [
        { username: regex },
        { email: regex },
        { displayName: regex },
      ];
    }

    return User.find(filter)
      .select("username email displayName avatar about isOnline lastSeen")
      .sort({ isOnline: -1, username: 1 }) // online users first, then alphabetical
      .limit(limit)
      .lean()
      .exec() as unknown as Promise<IUser[]>;
  },

  /**
   * Delete a user by ID.
   */
  async deleteById(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id).exec();
  },
};
