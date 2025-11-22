import { supabaseAdmin } from './supabase.js';
import { PLAN_CONFIGS } from './plans.js';

/**
 * Distribute leads to a specific user based on their plan
 * @param {string} userId - User ID to distribute leads to
 * @param {number} customLeadCount - Optional: override plan's lead count
 * @returns {Promise<{assigned: number, message: string}>}
 */
export async function distributeLeadsToUser(userId, customLeadCount = null) {
  try {
    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Get all leads ordered by sequence
    const { data: allLeads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('sequence_number', { ascending: true });

    if (leadsError) throw leadsError;

    if (!allLeads || allLeads.length === 0) {
      return { assigned: 0, message: 'No leads available' };
    }

    // Determine how many leads to assign
    let leadsToAssign = customLeadCount;
    if (leadsToAssign === null) {
      const planConfig = PLAN_CONFIGS[user.plan_type] || PLAN_CONFIGS.free;
      leadsToAssign = planConfig.leadsPerDay || planConfig.leadsPerWeek || 0;
    }

    if (leadsToAssign === 0) {
      return { assigned: 0, message: 'No leads to assign for this plan' };
    }

    // Get user's current position
    let currentPosition = user.lead_sequence_position || 0;
    let assigned = 0;

    // Assign leads based on their sequence position
    for (let i = 0; i < leadsToAssign; i++) {
      const leadIndex = currentPosition % allLeads.length;
      const lead = allLeads[leadIndex];

      // Check if user already has this lead
      const { data: existing } = await supabaseAdmin
        .from('user_leads')
        .select('id')
        .eq('user_id', user.id)
        .eq('lead_id', lead.id)
        .single();

      if (!existing) {
        // Assign lead
        const { error: assignError } = await supabaseAdmin
          .from('user_leads')
          .insert({
            user_id: user.id,
            lead_id: lead.id,
            status: 'new',
            action: 'call_now',
          });

        if (!assignError) {
          assigned++;
        }
      }

      currentPosition++;
    }

    // Update user's sequence position
    await supabaseAdmin
      .from('users')
      .update({ lead_sequence_position: currentPosition })
      .eq('id', user.id);

    return {
      assigned,
      message: `Assigned ${assigned} leads to user`,
    };
  } catch (error) {
    console.error('Distribution error:', error);
    throw error;
  }
}
