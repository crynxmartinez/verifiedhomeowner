import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

const POOL_SIZE = 600;

/**
 * Get current month string in YYYY-MM format (Philippine Time)
 */
function getCurrentPoolMonth() {
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const year = phTime.getUTCFullYear();
  const month = String(phTime.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format month string to readable format
 */
function formatPoolMonth(poolMonth) {
  const [year, month] = poolMonth.split('-');
  const date = new Date(year, parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default async function handler(req, res) {
  const authResult = await requireAdmin(req, res);
  if (!authResult.success) return;

  if (req.method === 'GET') {
    try {
      const currentMonth = getCurrentPoolMonth();
      
      // Queue statistics
      const totalInQueue = await prisma.leadQueue.count();
      const unassignedInQueue = await prisma.leadQueue.count({
        where: { assignedToPool: null }
      });
      
      // Current pool statistics
      const currentPoolCount = await prisma.monthlyPool.count({
        where: { poolMonth: currentMonth }
      });
      
      // Distribution statistics for current month
      const distributedThisMonth = await prisma.distributionLog.count({
        where: { distributionMonth: currentMonth }
      });
      
      // Unique users who received leads this month
      const usersDistributedTo = await prisma.distributionLog.groupBy({
        by: ['userId'],
        where: { distributionMonth: currentMonth }
      });
      
      // Today's distributions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayDistributions = await prisma.distributionLog.count({
        where: {
          distributionMonth: currentMonth,
          distributedAt: { gte: today }
        }
      });
      
      // Get distribution breakdown by plan
      const distributionByPlan = await prisma.$queryRaw`
        SELECT 
          u.plan_type,
          COUNT(DISTINCT dl.user_id) as user_count,
          COUNT(dl.id) as lead_count
        FROM distribution_logs dl
        JOIN users u ON dl.user_id = u.id
        WHERE dl.distribution_month = ${currentMonth}
        GROUP BY u.plan_type
      `;
      
      // Get recent upload batches
      const recentBatches = await prisma.leadQueue.groupBy({
        by: ['uploadBatch'],
        _count: { id: true },
        _min: { uploadedAt: true },
        orderBy: { _min: { uploadedAt: 'desc' } },
        take: 5
      });
      
      // Get pool history (last 6 months)
      const poolHistory = await prisma.monthlyPool.groupBy({
        by: ['poolMonth'],
        _count: { id: true },
        orderBy: { poolMonth: 'desc' },
        take: 6
      });
      
      // Calculate runway
      const monthsOfRunway = Math.floor(unassignedInQueue / POOL_SIZE);
      
      return res.status(200).json({
        currentMonth,
        currentMonthFormatted: formatPoolMonth(currentMonth),
        queue: {
          total: totalInQueue,
          unassigned: unassignedInQueue,
          assigned: totalInQueue - unassignedInQueue
        },
        pool: {
          size: currentPoolCount,
          maxSize: POOL_SIZE,
          percentFilled: currentPoolCount > 0 ? Math.round((currentPoolCount / POOL_SIZE) * 100) : 0
        },
        distribution: {
          thisMonth: distributedThisMonth,
          today: todayDistributions,
          uniqueUsers: usersDistributedTo.length,
          byPlan: distributionByPlan
        },
        runway: {
          months: monthsOfRunway,
          status: monthsOfRunway >= 3 ? 'healthy' : monthsOfRunway >= 1 ? 'warning' : 'critical'
        },
        recentBatches: recentBatches.map(b => ({
          batch: b.uploadBatch,
          count: b._count.id,
          uploadedAt: b._min.uploadedAt
        })),
        poolHistory: poolHistory.map(p => ({
          month: p.poolMonth,
          monthFormatted: formatPoolMonth(p.poolMonth),
          count: p._count.id
        }))
      });
    } catch (error) {
      console.error('Pool stats error:', error);
      return res.status(500).json({ error: 'Failed to get pool stats' });
    }
  }
  
  if (req.method === 'POST') {
    // Manual pool generation
    const { action, poolMonth } = req.body;
    
    if (action === 'generate-pool') {
      try {
        const targetMonth = poolMonth || getCurrentPoolMonth();
        
        // Check if pool already exists
        const existingPool = await prisma.monthlyPool.count({
          where: { poolMonth: targetMonth }
        });
        
        if (existingPool > 0) {
          return res.status(400).json({ 
            error: `Pool for ${formatPoolMonth(targetMonth)} already exists with ${existingPool} leads`
          });
        }
        
        // Get next leads from queue
        const queuedLeads = await prisma.leadQueue.findMany({
          where: { assignedToPool: null },
          orderBy: { queuePosition: 'asc' },
          take: POOL_SIZE,
          select: { id: true, leadId: true }
        });
        
        if (queuedLeads.length === 0) {
          return res.status(400).json({ error: 'No leads available in queue' });
        }
        
        // Create pool entries
        const poolEntries = queuedLeads.map(q => ({
          poolMonth: targetMonth,
          leadId: q.leadId
        }));
        
        await prisma.monthlyPool.createMany({
          data: poolEntries,
          skipDuplicates: true
        });
        
        // Mark as assigned in queue
        await prisma.leadQueue.updateMany({
          where: { id: { in: queuedLeads.map(q => q.id) } },
          data: { assignedToPool: targetMonth }
        });
        
        return res.status(200).json({
          success: true,
          message: `Created pool for ${formatPoolMonth(targetMonth)} with ${queuedLeads.length} leads`,
          poolMonth: targetMonth,
          leadsAdded: queuedLeads.length
        });
      } catch (error) {
        console.error('Generate pool error:', error);
        return res.status(500).json({ error: 'Failed to generate pool' });
      }
    }
    
    if (action === 'trigger-distribution') {
      try {
        // Import and call the distribution function
        const currentMonth = getCurrentPoolMonth();
        
        // Get current pool
        const pool = await prisma.monthlyPool.findMany({
          where: { poolMonth: currentMonth },
          select: { leadId: true }
        });
        
        if (pool.length === 0) {
          return res.status(400).json({ error: 'No pool exists for current month. Generate pool first.' });
        }
        
        const poolLeadIds = pool.map(p => p.leadId);
        
        // Get active users
        const users = await prisma.user.findMany({
          where: {
            role: 'wholesaler',
            subscriptionStatus: 'active'
          },
          select: { id: true, planType: true, email: true, name: true }
        });
        
        if (users.length === 0) {
          return res.status(200).json({ message: 'No active subscribers' });
        }
        
        const PLAN_QUOTAS = { free: 1, basic: 5, elite: 10, pro: 20 };
        let totalDistributed = 0;
        const results = [];
        
        for (const user of users) {
          const dailyQuota = PLAN_QUOTAS[user.planType] || 1;
          
          const existingDistributions = await prisma.distributionLog.findMany({
            where: { userId: user.id, distributionMonth: currentMonth },
            select: { leadId: true }
          });
          
          const existingLeadIds = new Set(existingDistributions.map(d => d.leadId));
          const availableLeadIds = poolLeadIds.filter(id => !existingLeadIds.has(id));
          
          if (availableLeadIds.length === 0) {
            results.push({ user: user.email, distributed: 0, reason: 'All leads received' });
            continue;
          }
          
          const shuffled = availableLeadIds.sort(() => Math.random() - 0.5);
          const toDistribute = shuffled.slice(0, Math.min(dailyQuota, availableLeadIds.length));
          
          if (toDistribute.length > 0) {
            await prisma.distributionLog.createMany({
              data: toDistribute.map(leadId => ({
                userId: user.id,
                leadId,
                distributionMonth: currentMonth
              })),
              skipDuplicates: true
            });
            
            await prisma.userLead.createMany({
              data: toDistribute.map(leadId => ({
                userId: user.id,
                leadId,
                status: 'new',
                action: 'call_now'
              })),
              skipDuplicates: true
            });
          }
          
          totalDistributed += toDistribute.length;
          results.push({ user: user.email, plan: user.planType, distributed: toDistribute.length });
        }
        
        return res.status(200).json({
          success: true,
          message: `Distributed ${totalDistributed} leads to ${users.length} users`,
          totalDistributed,
          results
        });
      } catch (error) {
        console.error('Trigger distribution error:', error);
        return res.status(500).json({ error: 'Failed to trigger distribution' });
      }
    }
    
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
