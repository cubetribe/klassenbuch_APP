import { Resend } from 'resend';

// Lazy initialization to avoid errors during build time
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Sends an email verification link to the user
 * @param to - Recipient email address
 * @param token - Verification token
 * @param name - User's name
 * @returns Promise with success status
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  name: string
): Promise<EmailResult> {
  try {
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    const client = getResendClient();

    await client.emails.send({
      from: emailFrom,
      to,
      subject: 'Verify your email - Klassenbuch App',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin-top: 0;">Welcome to Klassenbuch App!</h1>
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for registering with Klassenbuch App. To complete your registration and verify your email address, please click the button below:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #666; word-break: break-all;">
                ${verificationUrl}
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #999;">
              <p>Klassenbuch App - Classroom Behavior Management</p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Sends a password reset link to the user
 * @param to - Recipient email address
 * @param token - Reset token
 * @param name - User's name
 * @returns Promise with success status
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string,
  name: string
): Promise<EmailResult> {
  try {
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const client = getResendClient();

    await client.emails.send({
      from: emailFrom,
      to,
      subject: 'Reset your password - Klassenbuch App',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #dc2626; margin-top: 0;">Password Reset Request</h1>
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                We received a request to reset your password for your Klassenbuch App account. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #666; word-break: break-all;">
                ${resetUrl}
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
              </p>
              <p style="font-size: 14px; color: #666;">
                If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
              </p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #999;">
              <p>Klassenbuch App - Classroom Behavior Management</p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
