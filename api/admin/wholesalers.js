import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all wholesalers with their lead counts
    const wholesalers = await prisma.user.findMany({
      where: { role: 'wholesaler' },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        subscriptionStatus: true,
        emailVerified: true,
        preferredStates: true,
        lastLoginAt: true,
        lastEmailSentAt: true,
        lastEmailType: true,
        createdAt: true,
        _count: {
          select: {
            userLeads: true,
            userMarketplaceLeads: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get leads this month for each user
    const leadsThisMonth = await prisma.userLead.groupBy({
      by: ['userId'],
      where: {
        assignedAt: { gte: startOfMonth }
      },
      _count: { id: true }
    });

    const leadsThisMonthMap = new Map(
      leadsThisMonth.map(l => [l.userId, l._count.id])
    );

    // Calculate stats
    const totalWholesalers = wholesalers.length;
    const activeThisWeek = wholesalers.filter(w => 
      w.lastLoginAt && new Date(w.lastLoginAt) >= sevenDaysAgo
    ).length;
    const paidPlans = wholesalers.filter(w => 
      w.planType !== 'free'
    ).length;
    const emailedThisWeek = wholesalers.filter(w => 
      w.lastEmailSentAt && new Date(w.lastEmailSentAt) >= sevenDaysAgo
    ).length;

    // Format wholesalers for frontend
    const formattedWholesalers = wholesalers.map(w => {
      // Determine activity status
      let activityStatus = 'inactive'; // 30+ days or never
      if (w.lastLoginAt) {
        const lastLogin = new Date(w.lastLoginAt);
        if (lastLogin >= sevenDaysAgo) {
          activityStatus = 'active'; // < 7 days
        } else if (lastLogin >= thirtyDaysAgo) {
          activityStatus = 'idle'; // 7-30 days
        }
      }

      return {
        id: w.id,
        email: w.email,
        name: w.name,
        plan_type: w.planType,
        subscription_status: w.subscriptionStatus,
        email_verified: w.emailVerified,
        preferred_states: w.preferredStates || [],
        last_login_at: w.lastLoginAt,
        last_email_sent_at: w.lastEmailSentAt,
        last_email_type: w.lastEmailType,
        created_at: w.createdAt,
        total_leads: w._count.userLeads + w._count.userMarketplaceLeads,
        subscription_leads: w._count.userLeads,
        marketplace_purchases: w._count.userMarketplaceLeads,
        leads_this_month: leadsThisMonthMap.get(w.id) || 0,
        activity_status: activityStatus,
      };
    });

    res.status(200).json({
      stats: {
        total: totalWholesalers,
        activeThisWeek,
        paidPlans,
        emailedThisWeek,
      },
      wholesalers: formattedWholesalers,
    });
  } catch (error) {
    console.error('Fetch wholesalers error:', error);
    res.status(500).json({ error: 'Failed to fetch wholesalers' });
  }
}

export default requireAdmin(handler);
