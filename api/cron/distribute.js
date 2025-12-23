import prisma from '../../lib/prisma.js';

/**
 * Plan quotas - daily leads per plan type
 */
const PLAN_QUOTAS = {
  free: 1,
  basic: 5,      // Starter plan
  elite: 10,     // Elite plan
  pro: 20        // Pro plan - full access
};

const POOL_SIZE = 600;

/**
 * Get current month string in YYYY-MM format (Philippine Time)
 */
function getCurrentPoolMonth() {
  // Philippine Time is UTC+8
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const year = phTime.getUTCFullYear();
  const month = String(phTime.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Generate monthly pool if it doesn't exist
 */
async function ensurePoolExists(poolMonth) {
  const existingPool = await prisma.monthlyPool.count({
    where: { poolMonth }
  });
  
  if (existingPool > 0) {
    return { exists: true, count: existingPool };
  }
  
  // Generate pool from queue
  const queuedLeads = await prisma.leadQueue.findMany({
    where: { assignedToPool: null },
    orderBy: { queuePosition: 'asc' },
    take: POOL_SIZE,
    select: { id: true, leadId: true }
  });
  
  if (queuedLeads.length === 0) {
    return { exists: false, count: 0, error: 'No leads in queue' };
  }
  
  // Create pool entries
  const poolEntries = queuedLeads.map(q => ({
    poolMonth,
    leadId: q.leadId
  }));
  
  await prisma.monthlyPool.createMany({
    data: poolEntries,
    skipDuplicates: true
  });
  
  // Mark as assigned in queue
  await prisma.leadQueue.updateMany({
    where: { id: { in: queuedLeads.map(q => q.id) } },
    data: { assignedToPool: poolMonth }
  });
  
  console.log(`[Pool] Auto-generated pool for ${poolMonth} with ${queuedLeads.length} leads`);
  return { exists: true, count: queuedLeads.length, generated: true };
}

export default async function handler(req, res) {
  // Verify this is a cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const currentMonth = getCurrentPoolMonth();
    console.log(`[CRON Distribution] Starting daily distribution for ${currentMonth}...`);
    
    // Ensure pool exists for current month
    const poolStatus = await ensurePoolExists(currentMonth);
    if (!poolStatus.exists) {
      return res.status(200).json({ 
        message: 'No pool available - queue is empty',
        poolMonth: currentMonth
      });
    }
    
    if (poolStatus.generated) {
      console.log(`[CRON Distribution] Auto-generated pool for ${currentMonth}`);
    }
    
    // Get current month's pool
    const pool = await prisma.monthlyPool.findMany({
      where: { poolMonth: currentMonth },
      select: { leadId: true }
    });
    
    const poolLeadIds = pool.map(p => p.leadId);
    console.log(`[CRON Distribution] Pool has ${poolLeadIds.length} leads`);
    
    // Get all active wholesalers
    const users = await prisma.user.findMany({
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

    if (!users || users.length === 0) {
      return res.status(200).json({ message: 'No active wholesalers found' });
    }

    console.log(`[CRON Distribution] Processing ${users.length} active subscribers`);

    let totalAssigned = 0;
    const results = [];

    // Process each user
    for (const user of users) {
      const dailyQuota = PLAN_QUOTAS[user.planType] || PLAN_QUOTAS.free;
      
      // Get leads this user already received this month (from distribution log)
      const existingDistributions = await prisma.distributionLog.findMany({
        where: {
          userId: user.id,
          distributionMonth: currentMonth
        },
        select: { leadId: true }
      });
      
      const existingLeadIds = new Set(existingDistributions.map(d => d.leadId));
      
      // Filter pool to only leads user hasn't received yet this month
      const availableLeadIds = poolLeadIds.filter(id => !existingLeadIds.has(id));
      
      if (availableLeadIds.length === 0) {
        console.log(`[User: ${user.name}] Already received all pool leads this month`);
        results.push({
          userId: user.id,
          userName: user.name,
          plan: user.planType,
          assigned: 0,
          reason: 'Already received all pool leads'
        });
        continue;
      }
      
      // Randomly select leads up to daily quota
      const shuffled = availableLeadIds.sort(() => Math.random() - 0.5);
      const toDistribute = shuffled.slice(0, Math.min(dailyQuota, availableLeadIds.length));
      
      console.log(`[User: ${user.name} (${user.planType})] Distributing ${toDistribute.length}/${dailyQuota} leads`);
      
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
      
      totalAssigned += toDistribute.length;
      
      results.push({
        userId: user.id,
        userName: user.name,
        plan: user.planType,
        assigned: toDistribute.length,
        quota: dailyQuota
      });
    }

    console.log(`\n[CRON Distribution Complete]`);
    console.log(`  - Pool month: ${currentMonth}`);
    console.log(`  - Total assigned: ${totalAssigned}`);
    console.log(`  - Users processed: ${users.length}`);

    res.status(200).json({
      message: `Daily distribution: ${totalAssigned} leads to ${users.length} wholesalers`,
      poolMonth: currentMonth,
      poolSize: poolLeadIds.length,
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
