import prisma from '../../../lib/prisma.js';
import { requireAuth } from '../../../lib/auth-prisma.js';
import { distributeLeadsToUser } from '../../../lib/distributeLeads-prisma.js';

/**
 * Distribute Leads to User
 * Distributes leads based on user's current plan
 * Separate from plan update for reliability and clarity
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;

    console.log(`[LEAD DISTRIBUTION] Starting for user ${userId}`);

    // Get user's current plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (!user) {
      console.error('[LEAD DISTRIBUTION] User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[LEAD DISTRIBUTION] User plan: ${user.planType}`);

    // Distribute leads based on current plan
    const result = await distributeLeadsToUser(userId);

    console.log(`[LEAD DISTRIBUTION] ✅ Success:`, result);

    // Return result
    return res.status(200).json({
      success: true,
      leadsAssigned: result.assigned || 0,
      message: result.message || 'Leads distributed successfully',
      planType: user.planType
    });

  } catch (error) {
    console.error('[LEAD DISTRIBUTION] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to distribute leads',
      details: error.message 
    });
  }
}

export default requireAuth(handler);
