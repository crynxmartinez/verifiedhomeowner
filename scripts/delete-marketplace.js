import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteMarketplaceLeads() {
  try {
    // Delete user_marketplace_leads first (foreign key constraint)
    const deletedUserMktLeads = await prisma.userMarketplaceLead.deleteMany({});
    console.log(`Deleted ${deletedUserMktLeads.count} user_marketplace_leads`);

    // Delete marketplace_leads
    const deletedMktLeads = await prisma.marketplaceLead.deleteMany({});
    console.log(`Deleted ${deletedMktLeads.count} marketplace_leads`);

    console.log('All marketplace leads deleted successfully!');
  } catch (error) {
    console.error('Error deleting marketplace leads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteMarketplaceLeads();
