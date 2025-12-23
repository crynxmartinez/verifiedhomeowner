import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLastSalePrice() {
  try {
    // Find leads with price_history but no last_sale_price
    const leads = await prisma.lead.findMany({
      where: {
        lastSalePrice: null,
        zestimate: { not: null },
      },
      select: {
        id: true,
        propertyAddress: true,
        priceHistory: true,
        lastSalePrice: true,
      }
    });

    console.log(`Found ${leads.length} leads without last_sale_price`);

    let updatedCount = 0;
    let noPrice = [];

    for (const lead of leads) {
      const priceHistory = lead.priceHistory;
      
      if (!priceHistory || !Array.isArray(priceHistory) || priceHistory.length === 0) {
        noPrice.push(lead.propertyAddress);
        continue;
      }

      // Strategy: Find ANY price in the history
      // 1. First try "Sold" events with a price
      // 2. Then try any non-rental event with a price
      // 3. Finally use any event with a price (even rentals, just to have something)
      
      let lastSalePrice = null;
      let lastSaleDate = null;

      // 1. Try sold events with price
      const soldWithPrice = priceHistory.find(h => 
        h.event?.toLowerCase().includes('sold') && h.price && h.price > 0
      );
      
      if (soldWithPrice) {
        lastSalePrice = soldWithPrice.price;
        lastSaleDate = soldWithPrice.date;
      } else {
        // 2. Try any non-rental event with price
        const nonRentalWithPrice = priceHistory.find(h => 
          !h.postingIsRental && h.price && h.price > 0
        );
        
        if (nonRentalWithPrice) {
          lastSalePrice = nonRentalWithPrice.price;
          lastSaleDate = nonRentalWithPrice.date;
        } else {
          // 3. Use any price we can find (skip very low rental prices like $1000-2000)
          const anyHighPrice = priceHistory.find(h => h.price && h.price > 10000);
          if (anyHighPrice) {
            lastSalePrice = anyHighPrice.price;
            lastSaleDate = anyHighPrice.date;
          }
        }
      }

      if (lastSalePrice) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            lastSalePrice: lastSalePrice,
            lastSaleDate: lastSaleDate ? new Date(lastSaleDate) : null,
          }
        });
        updatedCount++;
        console.log(`Updated ${lead.propertyAddress}: $${lastSalePrice}`);
      } else {
        noPrice.push(lead.propertyAddress);
      }
    }

    console.log(`\nDone! Updated ${updatedCount} leads with last_sale_price from price_history`);
    console.log(`\nLeads with no usable price (${noPrice.length}):`);
    noPrice.forEach(addr => console.log(`  - ${addr}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLastSalePrice();
