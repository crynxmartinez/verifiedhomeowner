import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDistribution() {
  const currentMonth = '2025-12';
  
  const distCount = await prisma.distributionLog.count({
    where: { distributionMonth: currentMonth }
  });
  
  const userLeadCount = await prisma.userLead.count();
  
  console.log('Distribution Log count (Dec 2025):', distCount);
  console.log('Total UserLeads:', userLeadCount);
  
  // Show breakdown per user
  const distributions = await prisma.distributionLog.groupBy({
    by: ['userId'],
    where: { distributionMonth: currentMonth },
    _count: { id: true }
  });
  
  console.log('\nDistribution per user:');
  for (const d of distributions) {
    const user = await prisma.user.findUnique({
      where: { id: d.userId },
      select: { name: true, email: true, planType: true }
    });
    console.log(`  ${user.name} (${user.planType}): ${d._count.id} leads`);
  }
  
  await prisma.$disconnect();
}

checkDistribution();
