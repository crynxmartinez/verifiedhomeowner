/**
 * Lead Distribution Service
 * 
 * Handles automatic lead distribution to wholesalers based on their subscription plan.
 * Uses a round-robin sequence system to ensure fair distribution across all leads.
 * Each user has a position tracker that advances as leads are assigned.
 */

import prisma from './prisma.js';
import { PLAN_CONFIG } from './planConfig.js';

/**
 * Distribute leads to a specific user based on their plan
 * @param {string} userId - User ID to distribute leads to
 * @param {number} customLeadCount - Optional: override plan's lead count
 * @returns {Promise<{assigned: number, message: string}>}
 */
export async function distributeLeadsToUser(userId, customLeadCount = null) {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Determine how many leads to assign based on plan config
    let leadsToAssign = customLeadCount;
    if (leadsToAssign === null) {
      const planConfig = PLAN_CONFIG[user.planType] || PLAN_CONFIG.free;
      leadsToAssign = planConfig.dailyLeads || planConfig.weeklyLeads || 0;
    }

    if (leadsToAssign === 0) {
      return { assigned: 0, message: 'No leads to assign for this plan' };
    }

    // Get user's current position
    let currentPosition = user.leadSequencePosition || 0;

    // Get total leads count for wrap-around calculation
    const totalLeadsCount = await prisma.lead.count();

    if (!totalLeadsCount || totalLeadsCount === 0) {
      return { assigned: 0, message: 'No leads available in database' };
    }

    console.log(`[distributeLeadsToUser] User ${userId}:`);
    console.log(`  - Plan: ${user.planType}`);
    console.log(`  - Current position: ${currentPosition}`);
    console.log(`  - Requested leads: ${leadsToAssign}`);
    console.log(`  - Total leads in DB: ${totalLeadsCount}`);

    // Get leads already assigned to this user
    const assignedLeadIds = await prisma.userLead.findMany({
      where: { userId },
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
      userId: userId,
      leadId: lead.id,
      status: 'new',
      action: 'call_now',
    }));

    const inserted = await prisma.userLead.createMany({
      data: assignments
    });

    const assigned = inserted.count || 0;

    // Update position: move forward by number of leads assigned
    // Wrap around if exceeds total leads
    const newPosition = (currentPosition + assigned) % totalLeadsCount;

    console.log(`  - Assigned: ${assigned} leads`);
    console.log(`  - New position: ${newPosition}`);

    await prisma.user.update({
      where: { id: userId },
      data: { leadSequencePosition: newPosition }
    });

    return {
      assigned,
      message: `Assigned ${assigned} leads to user`,
    };
  } catch (error) {
    console.error('Distribution error:', error);
    throw error;
  }
}
