import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  avatar?: string;
  about: string;
  isOnline: boolean;
  lastSeen?: Date;
  socketIds: string[];
  pushToken?: string;
  soundEnabled: boolean;
  isVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  refreshTokens: {
    token: string;
    expiresAt: Date;
    device?: string;
  }[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username must not exceed 20 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Excluded from queries by default
    },

    // Profile
    displayName: {
      type: String,
      maxlength: [50, "Display name must not exceed 50 characters"],
    },
    avatar: {
      type: String,
    },
    about: {
      type: String,
      default: "Hey there! I am using Let's Chat.",
      maxlength: [200, "About must not exceed 200 characters"],
    },

    // Presence
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    socketIds: [{ type: String }],

    // Settings
    pushToken: {
      type: String,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },

    // Account verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },

    // Password reset
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },

    // Refresh tokens (for multi-device session management)
    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          expiresAt: { type: Date, required: true },
          device: { type: String },
        },
      ],
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } });
userSchema.index({ username: 1 }, { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } });
userSchema.index({ isOnline: 1 });

// ── Pre-save: Hash password if modified ──────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ── Instance method: Compare password ────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Sanitize JSON output ─────────────────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.avatarUrl = obj.avatar;
  if (obj.isDeleted) {
    obj.username = "deleted_user";
    obj.email = "";
    obj.displayName = obj.displayName || "Deleted User";
    obj.avatar = undefined;
    obj.avatarUrl = undefined;
    obj.about = "This account was deleted.";
  }
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.verificationToken;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  delete obj.__v;
  return obj;
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
