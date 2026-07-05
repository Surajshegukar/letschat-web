import { userRepository } from "@/repositories/user.repository";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/services/email.service";
import {
  generateRandomToken,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/utils/token";
import { RegisterInput, LoginInput, ResetPasswordInput } from "@/validators/auth.validator";
import { IUser } from "@/models/User";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export class AuthService {
  /**
   * Register a new user, generate verification token, and send verification email.
   */
  async register(input: RegisterInput): Promise<{ message: string }> {
    const { username, email, password } = input;

    // 1. Check if email already exists
    const emailExists = await userRepository.existsByEmail(email);
    if (emailExists) {
      const err: any = new Error("Email is already registered");
      err.statusCode = 409;
      throw err;
    }

    // 2. Check if username already exists
    const usernameExists = await userRepository.existsByUsername(username);
    if (usernameExists) {
      const err: any = new Error("Username is already taken");
      err.statusCode = 409;
      throw err;
    }

    // 3. Generate verification token
    const rawToken = generateRandomToken();
    const hashedToken = hashToken(rawToken);

    // 4. Create user
    await userRepository.create({
      username,
      email,
      password,
      verificationToken: hashedToken,
      isVerified: false,
    });

    // 5. Send verification email with the raw token
    await sendVerificationEmail(email, rawToken);

    return { message: "Registration successful. Please check your email to verify your account." };
  }

  /**
   * Verify a user's email using the token received in the email.
   */
  async verifyEmail(rawToken: string): Promise<{ message: string }> {
    if (!rawToken) {
      const err: any = new Error("Verification token is required");
      err.statusCode = 400;
      throw err;
    }

    const hashedToken = hashToken(rawToken);
    
    // Find user by verification token
    const user = await userRepository.findOne({ verificationToken: hashedToken }, "+verificationToken");
    if (!user) {
      const err: any = new Error("Invalid or expired verification token");
      err.statusCode = 400;
      throw err;
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return { message: "Email verified successfully. You can now log in." };
  }

  /**
   * Authenticate user, generate access + refresh tokens, and return user info.
   */
  async login(
    input: LoginInput,
    deviceInfo?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const { email, password } = input;

    // 1. Find user by email (include password)
    const user = await userRepository.findByEmail(email, "+password");
    if (!user) {
      const err: any = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    // 2. Check if user is verified
    if (!user.isVerified) {
      const err: any = new Error("Please verify your email address before logging in");
      err.statusCode = 403;
      throw err;
    }

    // 3. Compare password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      const err: any = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    
    const refreshToken = generateRefreshToken({ id: user.id });
    const hashedRefreshToken = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 5. Store refresh token in user document (need to fetch refreshTokens field first)
    const userWithTokens = await userRepository.findById(user.id, "+refreshTokens");
    if (userWithTokens) {
      userWithTokens.refreshTokens.push({
        token: hashedRefreshToken,
        expiresAt,
        device: deviceInfo,
      });
      await userWithTokens.save();
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        about: user.about,
      },
    };
  }

  /**
   * Invalidate the current refresh token and generate a new access + refresh token pair.
   * Includes token rotation and reuse detection.
   */
  async refresh(
    rawRefreshToken: string,
    deviceInfo?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!rawRefreshToken) {
      const err: any = new Error("Refresh token is required");
      err.statusCode = 401;
      throw err;
    }

    // 1. Verify token signature
    let payload: any;
    try {
      payload = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET);
    } catch (e) {
      const err: any = new Error("Invalid or expired refresh token");
      err.statusCode = 401;
      throw err;
    }

    const userId = payload.id;
    const hashedToken = hashToken(rawRefreshToken);

    // 2. Find user including refresh tokens
    const user = await userRepository.findById(userId, "+refreshTokens");
    if (!user) {
      const err: any = new Error("User not found");
      err.statusCode = 401;
      throw err;
    }

    // 3. Find target token
    const tokenIndex = user.refreshTokens.findIndex(
      (rt) => rt.token === hashedToken
    );

    // Token Reuse Detection / Invalidation
    if (tokenIndex === -1) {
      // Stolen/reused token detected! Invalidate all refresh tokens for this user
      user.refreshTokens = [];
      await user.save();
      const err: any = new Error("Token reuse detected. All sessions invalidated.");
      err.statusCode = 401;
      throw err;
    }

    // Check if token is expired
    const targetToken = user.refreshTokens[tokenIndex];
    if (targetToken && targetToken.expiresAt < new Date()) {
      user.refreshTokens.splice(tokenIndex, 1);
      await user.save();
      const err: any = new Error("Refresh token expired");
      err.statusCode = 401;
      throw err;
    }

    // 4. Generate new tokens
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    
    const newRefreshToken = generateRefreshToken({ id: user.id });
    const newHashedRefreshToken = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 5. Replace used refresh token with the new one (Rotation)
    user.refreshTokens[tokenIndex] = {
      token: newHashedRefreshToken,
      expiresAt,
      device: deviceInfo || targetToken?.device,
    };
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Log out the user by removing their refresh token from the database.
   */
  async logout(userId: string, rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) return;

    const hashedToken = hashToken(rawRefreshToken);
    const user = await userRepository.findById(userId, "+refreshTokens");
    
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt.token !== hashedToken
      );
      await user.save();
    }
  }

  /**
   * Initiate password recovery process by generating reset token and emailing the user.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't leak user existence for security
      return;
    }

    // Generate reset token
    const rawToken = generateRandomToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token & expiry to user document
    await userRepository.updateById(user.id, {
      resetToken: hashedToken,
      resetTokenExpiry: expiry,
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, rawToken);
  }

  /**
   * Reset the password using the reset token.
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { token, newPassword } = input;
    const hashedToken = hashToken(token);

    // Find user with valid reset token that is not expired
    const user = await userRepository.findOne(
      {
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: new Date() },
      },
      "+resetToken +resetTokenExpiry"
    );

    if (!user) {
      const err: any = new Error("Invalid or expired password reset token");
      err.statusCode = 400;
      throw err;
    }

    // Set new password (pre-save hook hashes it) and clear reset token fields
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    // Invalidate all active sessions for security
    user.refreshTokens = [];
    
    await user.save();
  }

  /**
   * Get the redirect URL for Google or GitHub OAuth.
   */
  getOAuthUrl(provider: string): { url: string } {
    const redirectUri = `${env.CLIENT_URL}/auth/callback`;
    if (provider === "google") {
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&state=google`;
      return { url };
    } else if (provider === "github") {
      const url = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=github`;
      return { url };
    }
    const err: any = new Error("Unsupported OAuth provider");
    err.statusCode = 400;
    throw err;
  }

  /**
   * Handle OAuth callback by exchanging authorization code for tokens and signing user in.
   */
  async handleOAuthCallback(
    provider: string,
    code: string,
    deviceInfo?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    let email = "";
    let username = "";
    let displayName = "";
    let avatar = "";

    const redirectUri = `${env.CLIENT_URL}/auth/callback`;

    if (provider === "google") {
      // 1. Exchange code for Google access token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        const err: any = new Error(tokenData.error_description || "Google token exchange failed");
        err.statusCode = 400;
        throw err;
      }

      // 2. Fetch Google profile info
      const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        const err: any = new Error("Failed to fetch Google profile info");
        err.statusCode = 400;
        throw err;
      }

      email = profileData.email;
      displayName = profileData.name || profileData.given_name;
      avatar = profileData.picture;
      username = email.split("@")[0] || "user_" + Date.now();
    } else if (provider === "github") {
      // 1. Exchange code for GitHub access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          code,
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        const err: any = new Error(tokenData.error_description || "GitHub token exchange failed");
        err.statusCode = 400;
        throw err;
      }

      // 2. Fetch GitHub profile info
      const profileResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "LetsChat",
        },
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        const err: any = new Error("Failed to fetch GitHub profile info");
        err.statusCode = 400;
        throw err;
      }

      displayName = profileData.name || profileData.login;
      username = profileData.login;
      avatar = profileData.avatar_url;
      email = profileData.email;

      // 3. Fallback: If GitHub email is private, fetch it separately
      if (!email) {
        const emailsResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "User-Agent": "LetsChat",
          },
        });
        const emailsData = await emailsResponse.json();
        if (emailsResponse.ok && Array.isArray(emailsData)) {
          const primaryEmail = emailsData.find((e: any) => e.primary && e.verified) || emailsData[0];
          email = primaryEmail?.email || "";
        }
      }
    }

    if (!email) {
      const err: any = new Error("Could not retrieve email from OAuth provider");
      err.statusCode = 400;
      throw err;
    }

    // 4. Find or create user
    let user = await userRepository.findByEmail(email);

    if (!user) {
      // Ensure username is unique (e.g. if another user has this username, append numbers)
      let finalUsername = username.replace(/[^a-zA-Z0-9_]/g, "");
      if (finalUsername.length < 3) finalUsername = "user_" + finalUsername;
      const isTaken = await userRepository.existsByUsername(finalUsername);
      if (isTaken) {
        finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }

      // Create new user (generate secure random password since they won't use password login)
      const randomPassword = generateRandomToken();
      user = await userRepository.create({
        username: finalUsername,
        email,
        password: randomPassword,
        displayName,
        avatar,
        isVerified: true, // OAuth emails are already verified
      });
    } else {
      // If user exists, ensure they are verified (since they authenticated via Google/GitHub)
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    }

    // 5. Generate and store access + refresh tokens
    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({ id: user.id });
    const hashedRefreshToken = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const userWithTokens = await userRepository.findById(user.id, "+refreshTokens");
    if (userWithTokens) {
      userWithTokens.refreshTokens.push({
        token: hashedRefreshToken,
        expiresAt,
        device: deviceInfo,
      });
      await userWithTokens.save();
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        about: user.about,
      },
    };
  }
}

export const authService = new AuthService();
