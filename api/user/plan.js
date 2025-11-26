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
    console.log('=== PLAN UPDATE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User from auth:', req.user);

    const { plan_type } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!plan_type) {
      console.error('No plan_type in request body');
      return res.status(400).json({ error: 'plan_type is required' });
    }

    console.log('User plan update request:', { userId, plan_type });

    // Validate plan type
    const validPlans = ['free', 'basic', 'elite', 'pro'];
    if (!validPlans.includes(plan_type)) {
      console.error('Invalid plan type:', plan_type);
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Get current user data
    console.log('Fetching user from database...');
    const { data: currentUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (getUserError) {
      console.error('Error fetching user:', getUserError);
      return res.status(500).json({ 
        error: 'Failed to fetch user',
        details: getUserError.message 
      });
    }

    if (!currentUser) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Current user:', { id: currentUser.id, plan: currentUser.plan_type });

    const oldPlan = currentUser.plan_type || 'free';

    // Update user plan
    console.log('Updating user plan in database...');
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
      return res.status(500).json({ 
        error: 'Failed to update plan in database',
        details: updateError.message 
      });
    }

    console.log(`✅ Plan updated: ${oldPlan} → ${plan_type} for user ${userId}`);

    // Calculate if this is an upgrade
    const planHierarchy = { free: 0, basic: 1, elite: 2, pro: 3 };
    const oldPlanLevel = planHierarchy[oldPlan] || 0;
    const newPlanLevel = planHierarchy[plan_type] || 0;
    const isUpgrade = newPlanLevel > oldPlanLevel;

    console.log('Plan comparison:', { oldPlan, oldPlanLevel, newPlan: plan_type, newPlanLevel, isUpgrade });

    // Distribute leads BEFORE sending response (with timeout protection)
    let leadsDistributed = false;
    if (isUpgrade) {
      console.log('Upgrade detected - distributing leads...');
      try {
        // Race between lead distribution and 8-second timeout
        const result = await Promise.race([
          distributeLeadsToUser(userId),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Lead distribution timeout after 8 seconds')), 8000)
          )
        ]);
        console.log('✅ Leads distributed successfully:', result);
        leadsDistributed = true;
      } catch (distributeError) {
        console.error('❌ Error distributing leads:', distributeError);
        console.error('Error details:', {
          message: distributeError.message,
          stack: distributeError.stack
        });
        // Continue anyway - plan update succeeded, leads can be distributed manually or via CRON
      }
    } else {
      console.log('Not an upgrade - skipping lead distribution');
    }

    // Send response AFTER lead distribution attempt
    res.status(200).json({
      success: true,
      user: updatedUser,
      message: `Plan updated to ${plan_type}`,
      leadsDistributed: leadsDistributed
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
