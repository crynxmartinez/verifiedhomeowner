import { supabaseAdmin } from '../../../lib/supabase.js';
import { requireAuth } from '../../../lib/auth.js';
import { distributeLeadsToUser } from '../../../lib/distributeLeads.js';

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
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('plan_type')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[LEAD DISTRIBUTION] User not found:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[LEAD DISTRIBUTION] User plan: ${user.plan_type}`);

    // Distribute leads based on current plan
    const result = await distributeLeadsToUser(userId);

    console.log(`[LEAD DISTRIBUTION] ✅ Success:`, result);

    // Return result
    return res.status(200).json({
      success: true,
      leadsAssigned: result.assigned || 0,
      message: result.message || 'Leads distributed successfully',
      planType: user.plan_type
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
