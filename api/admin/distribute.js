import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';
import { PLAN_CONFIG } from '../../lib/planConfig.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, leadsCount } = req.body;

    // Validate leadsCount
    const requestedLeadsCount = parseInt(leadsCount) || 1;
    if (requestedLeadsCount < 1) {
      return res.status(400).json({ error: 'Invalid leads count' });
    }

    // Get wholesalers - either specific user or all active
    const where = { role: 'wholesaler' };
    if (userId) {
      where.id = userId;
    } else {
      where.subscriptionStatus = 'active';
    }

    const users = await prisma.user.findMany({ where });

    if (!users || users.length === 0) {
      return res.status(400).json({ 
        error: userId ? 'User not found' : 'No active wholesalers found' 
      });
    }

    // Get total leads count for validation
    const totalLeadsCount = await prisma.lead.count();

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
          assigned,
          newPosition,
          message: `Assigned ${assigned} leads`
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
