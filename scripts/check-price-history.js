import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPriceHistory() {
  try {
    const leads = await prisma.lead.findMany({
      where: { lastSalePrice: null },
      select: { propertyAddress: true, priceHistory: true },
      take: 5
    });

    leads.forEach(l => {
      console.log(l.propertyAddress, ':', JSON.stringify(l.priceHistory));
    });

    const totalWithoutPrice = await prisma.lead.count({ where: { lastSalePrice: null } });
    const totalWithPrice = await prisma.lead.count({ where: { lastSalePrice: { not: null } } });
    
    console.log(`\nTotal leads without last_sale_price: ${totalWithoutPrice}`);
    console.log(`Total leads with last_sale_price: ${totalWithPrice}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPriceHistory();
