import { Resend } from 'resend';

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'Verified Homeowner <noreply@verifiedhomeowner.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.verifiedhomeowner.com';

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email, name, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  
  // Skip if Resend is not configured
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping verification email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - Verified Homeowner',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">Verified Homeowner</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 10px 0;">Verify Your Email</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0;">Hi ${name}, please verify your email address</p>
          </div>
          
          <p>Thanks for signing up! Please click the button below to verify your email address:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4b5563;">
            ${verifyUrl}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in <strong>24 hours</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't create an account with Verified Homeowner, you can safely ignore this email.
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Verified Homeowner. All rights reserved.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  // Skip if Resend is not configured
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping password reset email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password - Verified Homeowner',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">Verified Homeowner</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 10px 0;">Reset Your Password</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 0;">Hi ${name}, we received a password reset request</p>
          </div>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4b5563;">
            ${resetUrl}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in <strong>1 hour</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Verified Homeowner. All rights reserved.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a secure random token
 */
export function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
