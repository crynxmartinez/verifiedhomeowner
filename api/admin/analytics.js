import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Calculate dates
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Run all queries in parallel for better performance
    const [
      totalWholesalers,
      totalLeads,
      totalAssignments,
      planCounts,
      statusCounts,
      actionCounts,
      newWholesalersLast30Days,
      newLeadsLast30Days,
      // New metrics
      allWholesalers,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      inactiveUsers,
      marketplacePurchases,
      wishlistStats,
      supportTicketCount,
      activityEventCounts
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
      }),
      
      // Get all wholesalers with their preferred states
      prisma.user.findMany({
        where: { role: 'wholesaler' },
        select: {
          id: true,
          name: true,
          email: true,
          planType: true,
          preferredStates: true,
          lastLoginAt: true,
          createdAt: true,
        }
      }),
      
      // DAU - users who logged in today
      prisma.user.count({
        where: { role: 'wholesaler', lastLoginAt: { gte: oneDayAgo } }
      }),
      
      // WAU - users who logged in this week
      prisma.user.count({
        where: { role: 'wholesaler', lastLoginAt: { gte: sevenDaysAgo } }
      }),
      
      // MAU - users who logged in this month
      prisma.user.count({
        where: { role: 'wholesaler', lastLoginAt: { gte: thirtyDaysAgo } }
      }),
      
      // Inactive users (no login in 7+ days)
      prisma.user.findMany({
        where: {
          role: 'wholesaler',
          OR: [
            { lastLoginAt: { lt: sevenDaysAgo } },
            { lastLoginAt: null }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          planType: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { lastLoginAt: 'asc' },
        take: 20
      }),
      
      // Marketplace purchases count
      prisma.userMarketplaceLead.count(),
      
      // Wishlist stats
      prisma.featureRequest.count(),
      
      // Support ticket count
      prisma.supportTicket.count(),
      
      // Activity event counts by type
      prisma.userActivity.groupBy({
        by: ['eventType'],
        _count: { eventType: true }
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

    // Calculate state demand from user preferences
    const stateDemand = {};
    allWholesalers.forEach(user => {
      (user.preferredStates || []).forEach(state => {
        stateDemand[state] = (stateDemand[state] || 0) + 1;
      });
    });
    
    // Sort states by demand and get top 10
    const topStates = Object.entries(stateDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, userCount: count }));

    // Get lead counts by state for gap analysis
    const leadsByState = await prisma.lead.groupBy({
      by: ['state'],
      _count: { state: true }
    });

    // Property analytics - portfolio value and stats
    const propertyStats = await prisma.lead.aggregate({
      _sum: { zestimate: true },
      _avg: { zestimate: true, bedrooms: true, bathrooms: true, livingArea: true, yearBuilt: true },
      _count: { zestimate: true },
    });

    // Count leads by home type
    const homeTypeCounts = await prisma.lead.groupBy({
      by: ['homeType'],
      where: { homeType: { not: null } },
      _count: { homeType: true }
    });

    // Count leads with property data
    const leadsWithPropertyData = await prisma.lead.count({
      where: { propertyDataFetchedAt: { not: null } }
    });

    // Calculate equity distribution (Hot/Good/Normal/Low)
    const leadsWithEquity = await prisma.lead.findMany({
      where: { 
        zestimate: { not: null },
        lastSalePrice: { not: null }
      },
      select: { zestimate: true, lastSalePrice: true }
    });

    let equityDistribution = { hot: 0, good: 0, normal: 0, low: 0 };
    leadsWithEquity.forEach(lead => {
      const equityPercent = ((Number(lead.zestimate) - Number(lead.lastSalePrice)) / Number(lead.zestimate)) * 100;
      if (equityPercent >= 30) equityDistribution.hot++;
      else if (equityPercent >= 15) equityDistribution.good++;
      else if (equityPercent >= 0) equityDistribution.normal++;
      else equityDistribution.low++;
    });
    
    const leadStateMap = {};
    leadsByState.forEach(l => { leadStateMap[l.state] = l._count.state; });

    // Add lead availability to top states
    const stateAnalysis = topStates.map(s => ({
      ...s,
      leadsAvailable: leadStateMap[s.state] || 0,
      gap: s.userCount - (leadStateMap[s.state] || 0)
    }));

    // Calculate feature adoption rates
    const featureAdoption = {
      leadManagement: totalWholesalers > 0 ? Math.round((await prisma.user.count({
        where: { role: 'wholesaler', userLeads: { some: {} } }
      }) / totalWholesalers) * 100) : 0,
      marketplace: totalWholesalers > 0 ? Math.round((await prisma.user.count({
        where: { role: 'wholesaler', userMarketplaceLeads: { some: {} } }
      }) / totalWholesalers) * 100) : 0,
      statePreferences: totalWholesalers > 0 ? Math.round((allWholesalers.filter(u => u.preferredStates?.length > 0).length / totalWholesalers) * 100) : 0,
      feedback: totalWholesalers > 0 ? Math.round((await prisma.user.count({
        where: { role: 'wholesaler', OR: [{ featureVotes: { some: {} } }, { featureRequests: { some: {} } }] }
      }) / totalWholesalers) * 100) : 0,
      support: totalWholesalers > 0 ? Math.round((await prisma.user.count({
        where: { role: 'wholesaler', supportTickets: { some: {} } }
      }) / totalWholesalers) * 100) : 0,
    };

    // Activity event distribution
    const activityDistribution = {};
    activityEventCounts.forEach(a => {
      activityDistribution[a.eventType] = a._count.eventType;
    });

    // Calculate churn risk for inactive users
    const churnRiskUsers = inactiveUsers.map(user => {
      const daysSinceLogin = user.lastLoginAt 
        ? Math.floor((now - new Date(user.lastLoginAt)) / (1000 * 60 * 60 * 24))
        : Math.floor((now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
      
      let riskLevel = 'low';
      if (daysSinceLogin > 30) riskLevel = 'high';
      else if (daysSinceLogin > 14) riskLevel = 'medium';
      
      return {
        ...user,
        daysSinceLogin,
        riskLevel,
      };
    }).sort((a, b) => b.daysSinceLogin - a.daysSinceLogin);

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
        // New analytics
        engagement: {
          dau: dailyActiveUsers || 0,
          wau: weeklyActiveUsers || 0,
          mau: monthlyActiveUsers || 0,
          dauPercentage: totalWholesalers > 0 ? Math.round((dailyActiveUsers / totalWholesalers) * 100) : 0,
          wauPercentage: totalWholesalers > 0 ? Math.round((weeklyActiveUsers / totalWholesalers) * 100) : 0,
          mauPercentage: totalWholesalers > 0 ? Math.round((monthlyActiveUsers / totalWholesalers) * 100) : 0,
        },
        stateDemand: {
          topStates: stateAnalysis,
          totalUsersWithPreferences: allWholesalers.filter(u => u.preferredStates?.length > 0).length,
        },
        featureAdoption,
        churnRisk: {
          atRiskCount: churnRiskUsers.length,
          users: churnRiskUsers.slice(0, 10),
        },
        activityDistribution,
        totals: {
          marketplacePurchases: marketplacePurchases || 0,
          wishlistRequests: wishlistStats || 0,
          supportTickets: supportTicketCount || 0,
        },
        // Property analytics
        propertyAnalytics: {
          totalPortfolioValue: propertyStats._sum.zestimate ? Number(propertyStats._sum.zestimate) : 0,
          averagePropertyValue: propertyStats._avg.zestimate ? Number(propertyStats._avg.zestimate) : 0,
          leadsWithPropertyData: leadsWithPropertyData || 0,
          leadsWithZestimate: propertyStats._count.zestimate || 0,
          averageBedrooms: propertyStats._avg.bedrooms ? Number(propertyStats._avg.bedrooms).toFixed(1) : 0,
          averageBathrooms: propertyStats._avg.bathrooms ? Number(propertyStats._avg.bathrooms).toFixed(1) : 0,
          averageSqft: propertyStats._avg.livingArea ? Math.round(Number(propertyStats._avg.livingArea)) : 0,
          averageYearBuilt: propertyStats._avg.yearBuilt ? Math.round(Number(propertyStats._avg.yearBuilt)) : 0,
          homeTypeDistribution: Object.fromEntries(homeTypeCounts.map(h => [h.homeType, h._count.homeType])),
          equityDistribution,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export default requireAdmin(handler);
