import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

/**
 * Generate a cryptographically secure random token (hex string).
 * Used for email verification and password reset tokens.
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a token using SHA-256 for secure storage.
 * We store hashed tokens in the DB so even if the DB is compromised,
 * the raw tokens cannot be recovered.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a short-lived JWT access token (15 minutes).
 * Stored in-memory on the client — never in localStorage.
 */
export function generateAccessToken(payload: {
  id: string;
  username: string;
  email: string;
}): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

/**
 * Generate a long-lived JWT refresh token (7 days).
 * Sent as an HTTP-only secure cookie.
 */
export function generateRefreshToken(payload: {
  id: string;
}): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}
