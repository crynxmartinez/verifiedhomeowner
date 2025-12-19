import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Calculate date for 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all queries in parallel for better performance
    const [
      totalWholesalers,
      totalLeads,
      totalAssignments,
      planCounts,
      statusCounts,
      actionCounts,
      newWholesalersLast30Days,
      newLeadsLast30Days
    ] = await Promise.all([
      // Total counts
      prisma.user.count({ where: { role: 'wholesaler' } }),
      prisma.lead.count(),
      prisma.userLead.count(),
      
      // Plan distribution using groupBy
      prisma.user.groupBy({
        by: ['planType'],
        where: { role: 'wholesaler' },
        _count: { planType: true }
      }),
      
      // Status distribution using groupBy
      prisma.userLead.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Action distribution using groupBy
      prisma.userLead.groupBy({
        by: ['action'],
        _count: { action: true }
      }),
      
      // Recent activity
      prisma.user.count({
        where: { role: 'wholesaler', createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.lead.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      })
    ]);

    // Convert groupBy results to objects
    const planDistribution = { free: 0, basic: 0, elite: 0, pro: 0 };
    planCounts.forEach(p => { planDistribution[p.planType] = p._count.planType; });

    const statusDistribution = { new: 0, follow_up: 0, not_interested: 0 };
    statusCounts.forEach(s => { 
      if (statusDistribution[s.status] !== undefined) {
        statusDistribution[s.status] = s._count.status; 
      }
    });

    const actionDistribution = { call_now: 0, pending: 0 };
    actionCounts.forEach(a => { 
      if (actionDistribution[a.action] !== undefined) {
        actionDistribution[a.action] = a._count.action; 
      }
    });

    res.status(200).json({
      analytics: {
        overview: {
          totalWholesalers: totalWholesalers || 0,
          totalLeads: totalLeads || 0,
          totalAssignments: totalAssignments || 0,
          averageLeadsPerWholesaler: totalWholesalers > 0 
            ? Math.round((totalAssignments || 0) / totalWholesalers) 
            : 0,
        },
        planDistribution,
        statusDistribution,
        actionDistribution,
        recentActivity: {
          newWholesalersLast30Days: newWholesalersLast30Days || 0,
          newLeadsLast30Days: newLeadsLast30Days || 0,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export default requireAdmin(handler);
