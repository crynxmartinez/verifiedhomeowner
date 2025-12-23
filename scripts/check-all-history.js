import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllHistory() {
  try {
    const leads = await prisma.lead.findMany({
      where: { zestimate: { not: null } },
      select: { id: true, propertyAddress: true, priceHistory: true, lastSalePrice: true },
    });

    console.log(`Total leads with zestimate: ${leads.length}\n`);

    let withHistory = 0;
    let emptyHistory = 0;
    let nullHistory = 0;

    leads.forEach(l => {
      if (l.priceHistory === null) {
        nullHistory++;
        console.log(`NULL: ${l.propertyAddress}`);
      } else if (Array.isArray(l.priceHistory) && l.priceHistory.length === 0) {
        emptyHistory++;
        console.log(`EMPTY []: ${l.propertyAddress}`);
      } else if (Array.isArray(l.priceHistory) && l.priceHistory.length > 0) {
        withHistory++;
        console.log(`HAS DATA (${l.priceHistory.length} items): ${l.propertyAddress} - lastSalePrice: ${l.lastSalePrice}`);
        // Show first item
        console.log(`   First item: ${JSON.stringify(l.priceHistory[0])}`);
      }
    });

    console.log(`\n--- Summary ---`);
    console.log(`With history data: ${withHistory}`);
    console.log(`Empty array []: ${emptyHistory}`);
    console.log(`Null: ${nullHistory}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllHistory();
