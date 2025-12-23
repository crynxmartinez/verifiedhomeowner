import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMarketplace() {
  try {
    const count = await prisma.marketplaceLead.count();
    console.log('Marketplace leads count:', count);
    
    if (count > 0) {
      const leads = await prisma.marketplaceLead.findMany({ take: 5 });
      console.log('Sample marketplace leads:', leads);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMarketplace();
