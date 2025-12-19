import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';
import { sendVerificationEmail, generateToken } from '../../lib/email.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user;

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check rate limit - only allow resend every 5 minutes
    if (user.verificationExpires) {
      const lastSent = new Date(user.verificationExpires.getTime() - 24 * 60 * 60 * 1000);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastSent > fiveMinutesAgo) {
        const waitSeconds = Math.ceil((lastSent.getTime() - fiveMinutesAgo.getTime()) / 1000);
        return res.status(429).json({ 
          error: 'Please wait before requesting another verification email',
          retryAfter: waitSeconds
        });
      }
    }

    // Generate new token
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationExpires: expires,
        lastEmailSentAt: new Date(),
        lastEmailType: 'verification',
      }
    });

    // Send verification email
    const result = await sendVerificationEmail(user.email, user.name, token);

    if (!result.success) {
      console.error('Failed to send verification email:', result.error);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.status(200).json({ 
      message: 'Verification email sent',
      email: user.email
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
}

export default requireAuth(handler);
