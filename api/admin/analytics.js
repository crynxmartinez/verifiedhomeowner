import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get total counts
    const totalWholesalers = await prisma.user.count({
      where: { role: 'wholesaler' }
    });

    const totalLeads = await prisma.lead.count();

    const totalAssignments = await prisma.userLead.count();

    // Get plan distribution
    const planData = await prisma.user.findMany({
      where: { role: 'wholesaler' },
      select: { planType: true }
    });

    const planDistribution = {
      free: planData?.filter(u => u.planType === 'free').length || 0,
      basic: planData?.filter(u => u.planType === 'basic').length || 0,
      elite: planData?.filter(u => u.planType === 'elite').length || 0,
      pro: planData?.filter(u => u.planType === 'pro').length || 0,
    };

    // Get status distribution across all assignments
    const statusData = await prisma.userLead.findMany({
      select: { status: true, action: true }
    });

    const statusDistribution = {
      new: statusData?.filter(l => l.status === 'new').length || 0,
      follow_up: statusData?.filter(l => l.status === 'follow_up').length || 0,
      not_interested: statusData?.filter(l => l.status === 'not_interested').length || 0,
    };

    const actionDistribution = {
      call_now: statusData?.filter(l => l.action === 'call_now').length || 0,
      pending: statusData?.filter(l => l.action === 'pending').length || 0,
    };

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newWholesalersLast30Days = await prisma.user.count({
      where: {
        role: 'wholesaler',
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const newLeadsLast30Days = await prisma.lead.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
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
