import prisma from '../../lib/prisma.js';
import { sendPasswordResetEmail, generateToken } from '../../lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }

    // Check rate limit - only allow reset request every 5 minutes
    if (user.resetTokenExpires) {
      const lastSent = new Date(user.resetTokenExpires.getTime() - 60 * 60 * 1000); // 1 hour before expiry
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastSent > fiveMinutesAgo) {
        return res.status(200).json({ 
          message: 'If an account exists with this email, you will receive a password reset link.' 
        });
      }
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
        lastEmailSentAt: new Date(),
        lastEmailType: 'password_reset',
      }
    });

    // Send password reset email
    const result = await sendPasswordResetEmail(user.email, user.name, resetToken);

    if (!result.success) {
      console.error('Failed to send password reset email:', result.error);
      // Still return success to prevent email enumeration
    }

    res.status(200).json({ 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
