import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLAN_QUOTAS = {
  free: 1,
  basic: 5,
  elite: 10,
  pro: 20
};

function getCurrentPoolMonth() {
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const year = phTime.getUTCFullYear();
  const month = String(phTime.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

async function runDistribution() {
  const currentMonth = getCurrentPoolMonth();
  console.log(`\n🚀 Running distribution for ${currentMonth}...\n`);
  
  // Get pool
  const pool = await prisma.monthlyPool.findMany({
    where: { poolMonth: currentMonth },
    select: { leadId: true }
  });
  
  if (pool.length === 0) {
    console.log('❌ No pool exists for current month');
    return;
  }
  
  const poolLeadIds = pool.map(p => p.leadId);
  console.log(`📦 Pool size: ${poolLeadIds.length} leads`);
  
  // Get active users
  const activeUsers = await prisma.user.findMany({
    where: {
      role: 'wholesaler',
      subscriptionStatus: 'active'
    },
    select: { id: true, name: true, email: true, planType: true }
  });
  
  console.log(`👥 Active subscribers: ${activeUsers.length}\n`);
  
  let totalDistributed = 0;
  
  for (const user of activeUsers) {
    const dailyQuota = PLAN_QUOTAS[user.planType] || 1;
    
    // Get existing distributions
    const existingDistributions = await prisma.distributionLog.findMany({
      where: { userId: user.id, distributionMonth: currentMonth },
      select: { leadId: true }
    });
    
    const existingLeadIds = new Set(existingDistributions.map(d => d.leadId));
    const availableLeadIds = poolLeadIds.filter(id => !existingLeadIds.has(id));
    
    if (availableLeadIds.length === 0) {
      console.log(`⏭️  ${user.name}: Already received all pool leads`);
      continue;
    }
    
    // Random selection
    const shuffled = availableLeadIds.sort(() => Math.random() - 0.5);
    const toDistribute = shuffled.slice(0, Math.min(dailyQuota, availableLeadIds.length));
    
    // Create distribution logs
    await prisma.distributionLog.createMany({
      data: toDistribute.map(leadId => ({
        userId: user.id,
        leadId,
        distributionMonth: currentMonth
      })),
      skipDuplicates: true
    });
    
    // Create UserLead records
    await prisma.userLead.createMany({
      data: toDistribute.map(leadId => ({
        userId: user.id,
        leadId,
        status: 'new',
        action: 'call_now'
      })),
      skipDuplicates: true
    });
    
    totalDistributed += toDistribute.length;
    console.log(`✅ ${user.name} (${user.planType}): ${toDistribute.length} leads distributed`);
  }
  
  console.log(`\n📊 Total distributed: ${totalDistributed} leads`);
  
  await prisma.$disconnect();
}

runDistribution().catch(console.error);
