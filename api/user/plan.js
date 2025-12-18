import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

/**
 * Update User Plan
 * ONLY updates the plan - fast, simple, reliable
 * Lead distribution is handled separately by /api/user/leads/distribute
 */
async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan_type } = req.body;
    const userId = req.user.id;

    // Validate plan type
    const validPlans = ['free', 'basic', 'elite', 'pro'];
    if (!plan_type || !validPlans.includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    console.log(`[PLAN UPDATE] User ${userId}: Changing to ${plan_type}`);

    // Get current plan
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    const oldPlan = currentUser?.planType || 'free';

    // Update plan in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { planType: plan_type }
    });

    console.log(`[PLAN UPDATE] ✅ Success: ${oldPlan} → ${plan_type}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    // Return immediately - no lead distribution here
    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
      oldPlan: oldPlan,
      newPlan: plan_type,
      message: `Plan updated from ${oldPlan} to ${plan_type}`
    });

  } catch (error) {
    console.error('[PLAN UPDATE] Error:', error);
    return res.status(500).json({ error: 'Failed to update plan' });
  }
}

export default requireAuth(handler);
