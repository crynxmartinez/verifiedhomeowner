import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

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
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('plan_type')
      .eq('id', userId)
      .single();

    const oldPlan = currentUser?.plan_type || 'free';

    // Update plan in database
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
      console.error('[PLAN UPDATE] Error:', updateError);
      return res.status(500).json({ error: 'Failed to update plan' });
    }

    console.log(`[PLAN UPDATE] ✅ Success: ${oldPlan} → ${plan_type}`);

    // Return immediately - no lead distribution here
    return res.status(200).json({
      success: true,
      user: updatedUser,
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
