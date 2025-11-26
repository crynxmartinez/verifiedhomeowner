import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';
import { PLAN_CONFIGS } from '../../lib/plans.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, leadsCount } = req.body; // Optional: distribute to specific user, leadsCount

    // Validate leadsCount
    const requestedLeadsCount = parseInt(leadsCount) || 1;
    if (requestedLeadsCount < 1) {
      return res.status(400).json({ error: 'Invalid leads count' });
    }

    // Get wholesalers - either specific user or all active
    let query = supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'wholesaler');

    if (userId) {
      // Distribute to specific user
      query = query.eq('id', userId);
    } else {
      // Distribute to all active wholesalers
      query = query.eq('subscription_status', 'active');
    }

    const { data: users, error: usersError } = await query;

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return res.status(400).json({ 
        error: userId ? 'User not found' : 'No active wholesalers found' 
      });
    }

    // Get total leads count for validation
    const { count: totalLeadsCount } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (!totalLeadsCount || totalLeadsCount === 0) {
      return res.status(400).json({ error: 'No leads available to distribute' });
    }

    let totalAssigned = 0;
    const results = [];

    console.log(`[Manual Distribution] Starting distribution:`);
    console.log(`  - Users to process: ${users.length}`);
    console.log(`  - Leads per user: ${requestedLeadsCount}`);
    console.log(`  - Total leads in DB: ${totalLeadsCount}`);

    // Process each user
    for (const user of users) {
      const leadsToAssign = requestedLeadsCount;
      let currentPosition = user.lead_sequence_position || 0;

      console.log(`\n[User: ${user.name} (${user.email})]`);
      console.log(`  - Plan: ${user.plan_type}`);
      console.log(`  - Current position: ${currentPosition}`);
      console.log(`  - Requested: ${leadsToAssign}`);

      // Get unassigned leads for this user
      const { data: unassignedLeads, error: leadsError } = await supabaseAdmin
        .rpc('get_unassigned_leads', {
          p_user_id: user.id,
          p_start_position: currentPosition,
          p_limit: leadsToAssign
        });

      if (leadsError) {
        console.error(`  - Error getting leads:`, leadsError);
        results.push({
          userId: user.id,
          userName: user.name,
          assigned: 0,
          error: leadsError.message
        });
        continue;
      }

      if (!unassignedLeads || unassignedLeads.length === 0) {
        console.log(`  - User has all available leads`);
        results.push({
          userId: user.id,
          userName: user.name,
          assigned: 0,
          message: 'User has all available leads'
        });
        continue;
      }

      console.log(`  - Available unassigned: ${unassignedLeads.length}`);

      if (unassignedLeads.length < leadsToAssign) {
        console.warn(`  - Warning: Only ${unassignedLeads.length} of ${leadsToAssign} available`);
      }

      // Bulk insert assignments
      const assignments = unassignedLeads.map(lead => ({
        user_id: user.id,
        lead_id: lead.id,
        status: 'new',
        action: 'call_now',
      }));

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('user_leads')
        .insert(assignments)
        .select();

      if (insertError) {
        console.error(`  - Error inserting leads:`, insertError);
        results.push({
          userId: user.id,
          userName: user.name,
          assigned: 0,
          error: insertError.message
        });
        continue;
      }

      const assigned = inserted?.length || 0;
      totalAssigned += assigned;

      // Update position: move forward by number assigned, wrap around
      const newPosition = (currentPosition + assigned) % totalLeadsCount;

      console.log(`  - Assigned: ${assigned} leads`);
      console.log(`  - New position: ${newPosition}`);

      await supabaseAdmin
        .from('users')
        .update({ lead_sequence_position: newPosition })
        .eq('id', user.id);

      results.push({
        userId: user.id,
        userName: user.name,
        assigned,
        newPosition,
        message: `Assigned ${assigned} leads`
      });
    }

    console.log(`\n[Distribution Complete]`);
    console.log(`  - Total assigned: ${totalAssigned}`);
    console.log(`  - Users processed: ${users.length}`);

    res.status(200).json({
      message: `Distributed ${totalAssigned} leads to ${users.length} wholesalers`,
      totalAssigned,
      wholesalersProcessed: users.length,
      details: results
    });
  } catch (error) {
    console.error('Distribution error:', error);
    res.status(500).json({ error: 'Failed to distribute leads' });
  }
}

export default requireAdmin(handler);
