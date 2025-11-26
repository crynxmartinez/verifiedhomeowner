import { supabaseAdmin } from '../../lib/supabase.js';
import { PLAN_CONFIGS } from '../../lib/plans.js';

export default async function handler(req, res) {
  // Verify this is a cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
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

    // Get total leads count for validation
    const { count: totalLeadsCount } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (!totalLeadsCount || totalLeadsCount === 0) {
      return res.status(200).json({ message: 'No leads available' });
    }

    let totalAssigned = 0;
    const results = [];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday

    console.log(`[CRON Distribution] Starting daily distribution:`);
    console.log(`  - Day of week: ${today} (1 = Monday)`);
    console.log(`  - Users to process: ${users.length}`);
    console.log(`  - Total leads in DB: ${totalLeadsCount}`);

    // Process each user
    for (const user of users) {
      const planConfig = PLAN_CONFIGS[user.plan_type] || PLAN_CONFIGS.free;
      let leadsToAssign = 0;

      // Determine how many leads to assign based on plan
      if (planConfig.leadsPerDay) {
        leadsToAssign = planConfig.leadsPerDay;
      } else if (planConfig.leadsPerWeek) {
        // Free plan: only on Mondays
        if (today === 1) {
          leadsToAssign = planConfig.leadsPerWeek;
        }
      }

      if (leadsToAssign === 0) {
        console.log(`[User: ${user.name}] Skipping - no leads for plan ${user.plan_type} today`);
        continue;
      }

      let currentPosition = user.lead_sequence_position || 0;

      console.log(`\n[User: ${user.name} (${user.email})]`);
      console.log(`  - Plan: ${user.plan_type}`);
      console.log(`  - Current position: ${currentPosition}`);
      console.log(`  - Daily allocation: ${leadsToAssign}`);

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
        plan: user.plan_type,
        assigned,
        newPosition
      });
    }

    console.log(`\n[CRON Distribution Complete]`);
    console.log(`  - Total assigned: ${totalAssigned}`);
    console.log(`  - Users processed: ${users.length}`);

    res.status(200).json({
      message: `Daily distribution: ${totalAssigned} leads to ${users.length} wholesalers`,
      totalAssigned,
      wholesalersProcessed: users.length,
      timestamp: new Date().toISOString(),
      details: results
    });
  } catch (error) {
    console.error('Cron distribution error:', error);
    res.status(500).json({ error: 'Failed to distribute leads' });
  }
}
