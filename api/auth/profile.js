import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format user for frontend (snake_case)
    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan_type: user.planType,
      subscription_status: user.subscriptionStatus,
      email_verified: user.emailVerified,
      created_at: user.createdAt,
    };

    res.status(200).json({ user: formattedUser });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export default requireAuth(handler);
