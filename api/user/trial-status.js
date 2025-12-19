import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        hasUsedTrial: true,
        trialUsedAt: true,
        planType: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      hasUsedTrial: user.hasUsedTrial || false,
      trialUsedAt: user.trialUsedAt,
      currentPlan: user.planType,
      canUseTrial: !user.hasUsedTrial && user.planType === 'free',
    });

  } catch (error) {
    console.error('Trial status error:', error);
    return res.status(500).json({ error: 'Failed to get trial status' });
  }
}

export default requireAuth(handler);
