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

    // Get total leads count for wrap-around calculation
    const { count: totalLeadsCount } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (!totalLeadsCount || totalLeadsCount === 0) {
      return { assigned: 0, message: 'No leads available in database' };
    }

    console.log(`[distributeLeadsToUser] User ${userId}:`);
    console.log(`  - Plan: ${user.plan_type}`);
    console.log(`  - Current position: ${currentPosition}`);
    console.log(`  - Requested leads: ${leadsToAssign}`);
    console.log(`  - Total leads in DB: ${totalLeadsCount}`);

    // Get unassigned leads using database function
    const { data: unassignedLeads, error: leadsError } = await supabaseAdmin
      .rpc('get_unassigned_leads', {
        p_user_id: userId,
        p_start_position: currentPosition,
        p_limit: leadsToAssign
      });

    if (leadsError) {
      console.error('Error getting unassigned leads:', leadsError);
      throw leadsError;
    }

    if (!unassignedLeads || unassignedLeads.length === 0) {
      console.log(`  - User already has all available leads`);
      return { 
        assigned: 0, 
        message: 'User already has all available leads' 
      };
    }

    console.log(`  - Available unassigned leads: ${unassignedLeads.length}`);

    if (unassignedLeads.length < leadsToAssign) {
      console.warn(`  - Warning: Requested ${leadsToAssign} but only ${unassignedLeads.length} available`);
    }

    // Bulk insert all assignments
    const assignments = unassignedLeads.map(lead => ({
      user_id: userId,
      lead_id: lead.id,
      status: 'new',
      action: 'call_now',
    }));

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('user_leads')
      .insert(assignments)
      .select();

    if (insertError) {
      console.error('Error inserting leads:', insertError);
      throw insertError;
    }

    const assigned = inserted?.length || 0;

    // Update position: move forward by number of leads assigned
    // Wrap around if exceeds total leads
    const newPosition = (currentPosition + assigned) % totalLeadsCount;

    console.log(`  - Assigned: ${assigned} leads`);
    console.log(`  - New position: ${newPosition}`);

    await supabaseAdmin
      .from('users')
      .update({ lead_sequence_position: newPosition })
      .eq('id', userId);

    return {
      assigned,
      message: `Assigned ${assigned} leads to user`,
    };
  } catch (error) {
    console.error('Distribution error:', error);
    throw error;
  }
}
