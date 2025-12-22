import prisma from '../../lib/prisma.js';
import { generateToken, comparePassword } from '../../lib/auth-prisma.js';
import { rateLimitLogin } from '../../lib/rateLimit.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Fetch updated user data with new fields
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        planType: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        dodoSubscriptionId: true,
        emailVerified: true,
        preferredStates: true,
        marketplaceEmails: true,
        createdAt: true,
      }
    });

    // Format user for frontend (snake_case)
    const formattedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      plan_type: updatedUser.planType,
      subscription_status: updatedUser.subscriptionStatus,
      subscription_end_date: updatedUser.subscriptionEndDate,
      has_active_subscription: !!updatedUser.dodoSubscriptionId,
      email_verified: updatedUser.emailVerified,
      preferred_states: updatedUser.preferredStates || [],
      marketplace_emails: updatedUser.marketplaceEmails !== false,
      created_at: updatedUser.createdAt,
    };

    res.status(200).json({
      token,
      user: formattedUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// Apply rate limiting: 5 attempts per 15 minutes per IP
export default rateLimitLogin(handler);
