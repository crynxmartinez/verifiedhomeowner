import prisma from '../../lib/prisma.js';
import { getCurrentPoolMonth, POOL_SIZE } from './generate-pool.js';

/**
 * Plan quotas - daily leads per plan type
 */
const PLAN_QUOTAS = {
  free: 1,
  basic: 5,      // Starter plan
  elite: 10,     // Elite plan
  pro: 20        // Pro plan - full access
};

/**
 * Distribute leads to all active subscribers
 * Runs daily at midnight PH time
 */
async function distributeLeadsToUsers() {
  const currentMonth = getCurrentPoolMonth();
  
  console.log(`[Distribution] Starting daily distribution for ${currentMonth}...`);
  
  // Get current month's pool
  const pool = await prisma.monthlyPool.findMany({
    where: { poolMonth: currentMonth },
    select: { leadId: true }
  });
  
  if (pool.length === 0) {
    console.log(`[Distribution] No pool exists for ${currentMonth}. Run pool generator first.`);
    return {
      success: false,
      message: `No pool exists for ${currentMonth}`,
      distributed: 0
    };
  }
  
  const poolLeadIds = pool.map(p => p.leadId);
  console.log(`[Distribution] Pool has ${poolLeadIds.length} leads`);
  
  // Get all active subscribers (wholesalers with active subscription)
  const activeUsers = await prisma.user.findMany({
    where: {
      role: 'wholesaler',
      subscriptionStatus: 'active'
    },
    select: {
      id: true,
      planType: true,
      email: true,
      name: true
    }
  });
  
  console.log(`[Distribution] Found ${activeUsers.length} active subscribers`);
  
  if (activeUsers.length === 0) {
    return {
      success: true,
      message: 'No active subscribers to distribute to',
      distributed: 0
    };
  }
  
  let totalDistributed = 0;
  const distributionResults = [];
  
  for (const user of activeUsers) {
    const dailyQuota = PLAN_QUOTAS[user.planType] || PLAN_QUOTAS.free;
    
    // Get leads this user already received this month
    const existingDistributions = await prisma.distributionLog.findMany({
      where: {
        userId: user.id,
        distributionMonth: currentMonth
      },
      select: { leadId: true }
    });
    
    const existingLeadIds = new Set(existingDistributions.map(d => d.leadId));
    
    // Filter pool to only leads user hasn't received yet
    const availableLeadIds = poolLeadIds.filter(id => !existingLeadIds.has(id));
    
    if (availableLeadIds.length === 0) {
      console.log(`[Distribution] User ${user.email} has received all pool leads this month`);
      distributionResults.push({
        userId: user.id,
        email: user.email,
        plan: user.planType,
        distributed: 0,
        reason: 'Already received all pool leads'
      });
      continue;
    }
    
    // Randomly select leads up to daily quota
    const shuffled = availableLeadIds.sort(() => Math.random() - 0.5);
    const toDistribute = shuffled.slice(0, Math.min(dailyQuota, availableLeadIds.length));
    
    // Create distribution logs
    const distributionLogs = toDistribute.map(leadId => ({
      userId: user.id,
      leadId: leadId,
      distributionMonth: currentMonth
    }));
    
    if (distributionLogs.length > 0) {
      await prisma.distributionLog.createMany({
        data: distributionLogs,
        skipDuplicates: true
      });
      
      // Also create UserLead records so users can see these leads
      const userLeadRecords = toDistribute.map(leadId => ({
        userId: user.id,
        leadId: leadId,
        status: 'new',
        action: 'call_now'
      }));
      
      await prisma.userLead.createMany({
        data: userLeadRecords,
        skipDuplicates: true
      });
    }
    
    totalDistributed += toDistribute.length;
    
    console.log(`[Distribution] Distributed ${toDistribute.length} leads to ${user.email} (${user.planType})`);
    distributionResults.push({
      userId: user.id,
      email: user.email,
      plan: user.planType,
      distributed: toDistribute.length,
      quota: dailyQuota
    });
  }
  
  console.log(`[Distribution] ✅ Total distributed: ${totalDistributed} leads to ${activeUsers.length} users`);
  
  return {
    success: true,
    message: `Distributed ${totalDistributed} leads to ${activeUsers.length} users`,
    poolMonth: currentMonth,
    totalDistributed,
    userCount: activeUsers.length,
    results: distributionResults
  };
}

/**
 * Get distribution statistics
 */
async function getDistributionStats() {
  const currentMonth = getCurrentPoolMonth();
  
  // Get distribution counts by plan
  const distributionsByPlan = await prisma.$queryRaw`
    SELECT u.plan_type, COUNT(DISTINCT dl.user_id) as user_count, COUNT(dl.id) as lead_count
    FROM distribution_logs dl
    JOIN users u ON dl.user_id = u.id
    WHERE dl.distribution_month = ${currentMonth}
    GROUP BY u.plan_type
  `;
  
  // Today's distributions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayDistributions = await prisma.distributionLog.count({
    where: {
      distributionMonth: currentMonth,
      distributedAt: { gte: today }
    }
  });
  
  return {
    currentMonth,
    todayDistributions,
    distributionsByPlan
  };
}

// API Handler
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const stats = await getDistributionStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error('[Distribution] Stats error:', error);
      return res.status(500).json({ error: 'Failed to get distribution stats' });
    }
  }
  
  if (req.method === 'POST') {
    // Check for cron secret or admin auth
    const cronSecret = req.headers['x-cron-secret'];
    const isValidCron = cronSecret === process.env.CRON_SECRET;
    
    // Also allow admin users to trigger manually
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { role: true }
        });
        isAdmin = user?.role === 'admin';
      } catch (e) {
        // Token invalid, not admin
      }
    }
    
    if (!isValidCron && !isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      const result = await distributeLeadsToUsers();
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('[Distribution] Error:', error);
      return res.status(500).json({ error: 'Failed to distribute leads' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export { distributeLeadsToUsers, getDistributionStats, PLAN_QUOTAS };
