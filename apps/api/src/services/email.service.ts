import { logger } from "@/utils/logger";
import { env } from "@/config/env";
import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Initialize Resend if valid API key is present
const resend = env.RESEND_API_KEY && env.RESEND_API_KEY !== "re_dev_placeholder" && env.RESEND_API_KEY !== "re_prod_placeholder"
  ? new Resend(env.RESEND_API_KEY)
  : null;

/**
 * Send an email using the Resend email provider.
 * Falls back to logging to console in development mode when Resend is not configured.
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        logger.error({ message: "Resend email delivery failed", error });
        throw new Error(`Email delivery failed: ${error.message}`);
      }

      logger.info({
        message: "Email sent successfully via Resend",
        to: options.to,
        subject: options.subject,
        emailId: data?.id,
      });
      return;
    } catch (error) {
      logger.error({ message: "Failed to send email via Resend", error });
      if (env.NODE_ENV !== "development") {
        throw error;
      }
    }
  }

  // Fallback console log for development or unconfigured states
  logger.info({
    message: "Email sent (dev fallback - logged to console)",
    to: options.to,
    subject: options.subject,
  });

  if (env.NODE_ENV === "development") {
    logger.debug({ html: options.html });
  }
}

/**
 * Send email verification link to a newly registered user.
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your Let's Chat account",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #19E68C; font-size: 28px; margin: 0;">Let's Chat</h1>
        </div>
        <h2 style="color: #1a1a1a; font-size: 22px;">Verify your email address</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Thanks for signing up! Please click the button below to verify your email address and activate your account.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #19E68C; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="color: #888; font-size: 13px;">
          Or copy and paste this link into your browser:<br/>
          <a href="${verificationUrl}" style="color: #19E68C; word-break: break-all;">${verificationUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          This link will expire in 24 hours. &copy; Let's Chat
        </p>
      </div>
    `,
  });
}

/**
 * Send password reset link to the user.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your Let's Chat password",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #19E68C; font-size: 28px; margin: 0;">Let's Chat</h1>
        </div>
        <h2 style="color: #1a1a1a; font-size: 22px;">Reset your password</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new password.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" 
             style="background-color: #19E68C; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <p style="color: #888; font-size: 13px;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #19E68C; word-break: break-all;">${resetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          This link will expire in 1 hour. &copy; Let's Chat
        </p>
      </div>
    `,
  });
}
