import prisma from '../../lib/prisma.js';
import { PLAN_CONFIG } from '../../lib/planConfig.js';

export default async function handler(req, res) {
  // Verify this is a cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all active wholesalers
    const users = await prisma.user.findMany({
      where: {
        role: 'wholesaler',
        subscriptionStatus: 'active'
      }
    });

    if (!users || users.length === 0) {
      return res.status(200).json({ message: 'No active wholesalers found' });
    }

    // Get total leads count for validation
    const totalLeadsCount = await prisma.lead.count();

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
      const planConfig = PLAN_CONFIG[user.planType] || PLAN_CONFIG.free;
      let leadsToAssign = 0;

      // Determine how many leads to assign based on plan
      if (planConfig.dailyLeads) {
        leadsToAssign = planConfig.dailyLeads;
      } else if (planConfig.weeklyLeads) {
        // Free plan: only on Mondays
        if (today === 1) {
          leadsToAssign = planConfig.weeklyLeads;
        }
      }

      if (leadsToAssign === 0) {
        console.log(`[User: ${user.name}] Skipping - no leads for plan ${user.planType} today`);
        continue;
      }

      let currentPosition = user.leadSequencePosition || 0;

      console.log(`\n[User: ${user.name} (${user.email})]`);
      console.log(`  - Plan: ${user.planType}`);
      console.log(`  - Current position: ${currentPosition}`);
      console.log(`  - Daily allocation: ${leadsToAssign}`);

      // Get leads already assigned to this user
      const assignedLeadIds = await prisma.userLead.findMany({
        where: { userId: user.id },
        select: { leadId: true }
      });
      const assignedIds = assignedLeadIds.map(l => l.leadId);

      // Get unassigned leads starting from current position
      let unassignedLeads = await prisma.lead.findMany({
        where: {
          id: { notIn: assignedIds },
          sequenceNumber: { gte: currentPosition }
        },
        orderBy: { sequenceNumber: 'asc' },
        take: leadsToAssign
      });

      // If we need more leads, wrap around to beginning
      if (unassignedLeads.length < leadsToAssign) {
        const remaining = leadsToAssign - unassignedLeads.length;
        const moreLeads = await prisma.lead.findMany({
          where: {
            id: { notIn: [...assignedIds, ...unassignedLeads.map(l => l.id)] },
            sequenceNumber: { lt: currentPosition }
          },
          orderBy: { sequenceNumber: 'asc' },
          take: remaining
        });
        unassignedLeads = [...unassignedLeads, ...moreLeads];
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
        userId: user.id,
        leadId: lead.id,
        status: 'new',
        action: 'call_now',
      }));

      try {
        const inserted = await prisma.userLead.createMany({
          data: assignments
        });

        const assigned = inserted.count || 0;
        totalAssigned += assigned;

        // Update position: move forward by number assigned, wrap around
        const newPosition = (currentPosition + assigned) % totalLeadsCount;

        console.log(`  - Assigned: ${assigned} leads`);
        console.log(`  - New position: ${newPosition}`);

        await prisma.user.update({
          where: { id: user.id },
          data: { leadSequencePosition: newPosition }
        });

        results.push({
          userId: user.id,
          userName: user.name,
          plan: user.planType,
          assigned,
          newPosition
        });
      } catch (insertError) {
        console.error(`  - Error inserting leads:`, insertError);
        results.push({
          userId: user.id,
          userName: user.name,
          assigned: 0,
          error: insertError.message
        });
        continue;
      }
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
