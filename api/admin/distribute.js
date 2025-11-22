import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';
import { PLAN_CONFIGS } from '../../lib/plans.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all active wholesalers
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'wholesaler')
      .eq('subscription_status', 'active');

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return res.status(200).json({ message: 'No active wholesalers found' });
    }

    // Get all leads ordered by sequence
    const { data: allLeads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('sequence_number', { ascending: true });

    if (leadsError) throw leadsError;

    if (!allLeads || allLeads.length === 0) {
      return res.status(200).json({ message: 'No leads available' });
    }

    let totalAssigned = 0;
    const assignments = [];

    // Process each user
    for (const user of users) {
      const planConfig = PLAN_CONFIGS[user.plan_type] || PLAN_CONFIGS.free;
      const leadsToAssign = planConfig.leadsPerDay || 0;

      if (leadsToAssign === 0) continue; // Skip free users in manual distribution

      // Get user's current position
      let currentPosition = user.lead_sequence_position || 0;

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
          const { data: assignment, error: assignError } = await supabaseAdmin
            .from('user_leads')
            .insert({
              user_id: user.id,
              lead_id: lead.id,
              status: 'new',
              action: 'call_now',
            })
            .select()
            .single();

          if (!assignError && assignment) {
            assignments.push(assignment);
            totalAssigned++;
          }
        }

        currentPosition++;
      }

      // Update user's sequence position
      await supabaseAdmin
        .from('users')
        .update({ lead_sequence_position: currentPosition })
        .eq('id', user.id);
    }

    res.status(200).json({
      message: `Distributed ${totalAssigned} leads to ${users.length} wholesalers`,
      totalAssigned,
      wholesalersProcessed: users.length,
    });
  } catch (error) {
    console.error('Distribution error:', error);
    res.status(500).json({ error: 'Failed to distribute leads' });
  }
}

export default requireAdmin(handler);
