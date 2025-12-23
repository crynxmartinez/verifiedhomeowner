import prisma from '../../lib/prisma.js';

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
 * Generate monthly pool from queue
 * Takes the next 600 leads from queue (FIFO) and creates MonthlyPool entries
 */
async function generateMonthlyPool(poolMonth = null) {
  const targetMonth = poolMonth || getCurrentPoolMonth();
  
  console.log(`[Pool Generator] Starting pool generation for ${targetMonth}...`);
  
  // Check if pool already exists for this month
  const existingPool = await prisma.monthlyPool.count({
    where: { poolMonth: targetMonth }
  });
  
  if (existingPool > 0) {
    console.log(`[Pool Generator] Pool for ${targetMonth} already exists with ${existingPool} leads. Skipping.`);
    return {
      success: false,
      message: `Pool for ${targetMonth} already exists`,
      poolMonth: targetMonth,
      existingCount: existingPool
    };
  }
  
  // Get next 600 leads from queue that haven't been assigned to a pool yet
  const queuedLeads = await prisma.leadQueue.findMany({
    where: { assignedToPool: null },
    orderBy: { queuePosition: 'asc' },
    take: POOL_SIZE,
    select: { id: true, leadId: true, queuePosition: true }
  });
  
  if (queuedLeads.length === 0) {
    console.log(`[Pool Generator] No leads available in queue!`);
    return {
      success: false,
      message: 'No leads available in queue',
      poolMonth: targetMonth,
      queuedCount: 0
    };
  }
  
  console.log(`[Pool Generator] Found ${queuedLeads.length} leads to add to pool`);
  
  // Create MonthlyPool entries
  const poolEntries = queuedLeads.map(q => ({
    poolMonth: targetMonth,
    leadId: q.leadId
  }));
  
  await prisma.monthlyPool.createMany({
    data: poolEntries,
    skipDuplicates: true
  });
  
  // Mark these leads as assigned to this pool in the queue
  const queueIds = queuedLeads.map(q => q.id);
  await prisma.leadQueue.updateMany({
    where: { id: { in: queueIds } },
    data: { assignedToPool: targetMonth }
  });
  
  console.log(`[Pool Generator] ✅ Created pool for ${targetMonth} with ${queuedLeads.length} leads`);
  
  // Get remaining queue count
  const remainingInQueue = await prisma.leadQueue.count({
    where: { assignedToPool: null }
  });
  
  return {
    success: true,
    message: `Pool created for ${targetMonth}`,
    poolMonth: targetMonth,
    leadsAdded: queuedLeads.length,
    remainingInQueue: remainingInQueue
  };
}

/**
 * Get pool statistics
 */
async function getPoolStats() {
  const currentMonth = getCurrentPoolMonth();
  
  // Current pool count
  const currentPoolCount = await prisma.monthlyPool.count({
    where: { poolMonth: currentMonth }
  });
  
  // Queue stats
  const totalInQueue = await prisma.leadQueue.count();
  const unassignedInQueue = await prisma.leadQueue.count({
    where: { assignedToPool: null }
  });
  
  // Distribution stats for current month
  const distributedThisMonth = await prisma.distributionLog.count({
    where: { distributionMonth: currentMonth }
  });
  
  // Unique users who received leads this month
  const usersDistributedTo = await prisma.distributionLog.groupBy({
    by: ['userId'],
    where: { distributionMonth: currentMonth }
  });
  
  return {
    currentMonth,
    currentPoolSize: currentPoolCount,
    totalInQueue,
    unassignedInQueue,
    distributedThisMonth,
    usersDistributedTo: usersDistributedTo.length,
    monthsOfRunway: Math.floor(unassignedInQueue / POOL_SIZE)
  };
}

// API Handler
export default async function handler(req, res) {
  // Only allow POST for generating pool, GET for stats
  if (req.method === 'GET') {
    try {
      const stats = await getPoolStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error('[Pool Generator] Stats error:', error);
      return res.status(500).json({ error: 'Failed to get pool stats' });
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
      const { poolMonth } = req.body || {};
      const result = await generateMonthlyPool(poolMonth);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('[Pool Generator] Error:', error);
      return res.status(500).json({ error: 'Failed to generate pool' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export { generateMonthlyPool, getPoolStats, getCurrentPoolMonth, POOL_SIZE };
