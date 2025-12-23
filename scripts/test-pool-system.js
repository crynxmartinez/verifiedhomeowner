import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POOL_SIZE = 600;

function getCurrentPoolMonth() {
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const year = phTime.getUTCFullYear();
  const month = String(phTime.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

async function testPoolSystem() {
  console.log('='.repeat(60));
  console.log('LEAD POOL SYSTEM TEST');
  console.log('='.repeat(60));
  
  const currentMonth = getCurrentPoolMonth();
  console.log(`\nCurrent Pool Month: ${currentMonth}`);
  
  // 1. Check Queue Status
  console.log('\n--- QUEUE STATUS ---');
  const totalInQueue = await prisma.leadQueue.count();
  const unassignedInQueue = await prisma.leadQueue.count({
    where: { assignedToPool: null }
  });
  console.log(`Total in queue: ${totalInQueue}`);
  console.log(`Unassigned (available): ${unassignedInQueue}`);
  console.log(`Already assigned: ${totalInQueue - unassignedInQueue}`);
  
  // 2. Check Current Pool
  console.log('\n--- CURRENT POOL ---');
  const currentPoolCount = await prisma.monthlyPool.count({
    where: { poolMonth: currentMonth }
  });
  console.log(`Pool for ${currentMonth}: ${currentPoolCount} leads`);
  
  // 3. Generate Pool if needed
  if (currentPoolCount === 0 && unassignedInQueue > 0) {
    console.log('\n--- GENERATING POOL ---');
    const leadsToTake = Math.min(POOL_SIZE, unassignedInQueue);
    
    const queuedLeads = await prisma.leadQueue.findMany({
      where: { assignedToPool: null },
      orderBy: { queuePosition: 'asc' },
      take: leadsToTake,
      select: { id: true, leadId: true, queuePosition: true }
    });
    
    console.log(`Taking ${queuedLeads.length} leads from queue...`);
    
    // Create pool entries
    const poolEntries = queuedLeads.map(q => ({
      poolMonth: currentMonth,
      leadId: q.leadId
    }));
    
    await prisma.monthlyPool.createMany({
      data: poolEntries,
      skipDuplicates: true
    });
    
    // Mark as assigned
    await prisma.leadQueue.updateMany({
      where: { id: { in: queuedLeads.map(q => q.id) } },
      data: { assignedToPool: currentMonth }
    });
    
    console.log(`✅ Created pool with ${queuedLeads.length} leads`);
  } else if (currentPoolCount > 0) {
    console.log('Pool already exists for this month');
  } else {
    console.log('No leads available in queue to create pool');
  }
  
  // 4. Check Distribution Status
  console.log('\n--- DISTRIBUTION STATUS ---');
  const distributedThisMonth = await prisma.distributionLog.count({
    where: { distributionMonth: currentMonth }
  });
  console.log(`Total distributions this month: ${distributedThisMonth}`);
  
  // 5. Get Active Users
  console.log('\n--- ACTIVE SUBSCRIBERS ---');
  const activeUsers = await prisma.user.findMany({
    where: {
      role: 'wholesaler',
      subscriptionStatus: 'active'
    },
    select: { id: true, name: true, email: true, planType: true }
  });
  console.log(`Active subscribers: ${activeUsers.length}`);
  activeUsers.forEach(u => {
    console.log(`  - ${u.name} (${u.email}) - ${u.planType}`);
  });
  
  // 6. Simulate Distribution (dry run)
  console.log('\n--- DISTRIBUTION SIMULATION (DRY RUN) ---');
  const PLAN_QUOTAS = { free: 1, basic: 5, elite: 10, pro: 20 };
  
  const pool = await prisma.monthlyPool.findMany({
    where: { poolMonth: currentMonth },
    select: { leadId: true }
  });
  const poolLeadIds = pool.map(p => p.leadId);
  
  if (poolLeadIds.length === 0) {
    console.log('No pool available for simulation');
  } else {
    for (const user of activeUsers) {
      const dailyQuota = PLAN_QUOTAS[user.planType] || 1;
      
      const existingDistributions = await prisma.distributionLog.findMany({
        where: { userId: user.id, distributionMonth: currentMonth },
        select: { leadId: true }
      });
      
      const existingLeadIds = new Set(existingDistributions.map(d => d.leadId));
      const availableLeadIds = poolLeadIds.filter(id => !existingLeadIds.has(id));
      
      const wouldDistribute = Math.min(dailyQuota, availableLeadIds.length);
      
      console.log(`  ${user.name} (${user.planType}):`);
      console.log(`    - Already received: ${existingLeadIds.size} leads`);
      console.log(`    - Available: ${availableLeadIds.length} leads`);
      console.log(`    - Would distribute today: ${wouldDistribute} leads`);
    }
  }
  
  // 7. Summary
  console.log('\n--- SUMMARY ---');
  const finalPoolCount = await prisma.monthlyPool.count({
    where: { poolMonth: currentMonth }
  });
  const finalUnassigned = await prisma.leadQueue.count({
    where: { assignedToPool: null }
  });
  
  console.log(`Current pool: ${finalPoolCount} leads`);
  console.log(`Queue remaining: ${finalUnassigned} leads`);
  console.log(`Runway: ~${Math.floor(finalUnassigned / POOL_SIZE)} months`);
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
}

testPoolSystem().catch(console.error);
