import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { distributeLeadsToUser } from '../../lib/distributeLeads.js';

/**
 * User Plan Management
 * Allows wholesalers to update their own plan
 */
async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan_type } = req.body;
    const userId = req.user.id;

    console.log('User plan update request:', { userId, plan_type });

    // Validate plan type
    const validPlans = ['free', 'basic', 'elite', 'pro'];
    if (!validPlans.includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Get current user data
    const { data: currentUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (getUserError) {
      console.error('Error fetching user:', getUserError);
      throw getUserError;
    }

    const oldPlan = currentUser.plan_type;

    // Update user plan
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        plan_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating plan:', updateError);
      throw updateError;
    }

    console.log(`✅ Plan updated: ${oldPlan} → ${plan_type} for user ${userId}`);

    // Distribute leads based on new plan (if upgrading)
    const planHierarchy = { free: 0, basic: 1, elite: 2, pro: 3 };
    const isUpgrade = planHierarchy[plan_type] > planHierarchy[oldPlan];

    if (isUpgrade) {
      console.log('Upgrade detected - distributing leads...');
      try {
        await distributeLeadsToUser(userId);
        console.log('✅ Leads distributed for upgraded plan');
      } catch (distributeError) {
        console.error('Error distributing leads:', distributeError);
        // Don't fail the plan update if lead distribution fails
      }
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: `Plan updated to ${plan_type}`,
      leadsDistributed: isUpgrade
    });

  } catch (error) {
    console.error('Plan update error:', error);
    res.status(500).json({
      error: 'Failed to update plan',
      details: error.message
    });
  }
}

export default requireAuth(handler);
