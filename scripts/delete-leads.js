import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllLeads() {
  try {
    // Delete user_leads first (foreign key constraint)
    const deletedUserLeads = await prisma.userLead.deleteMany({});
    console.log(`Deleted ${deletedUserLeads.count} user_leads`);

    // Delete leads
    const deletedLeads = await prisma.lead.deleteMany({});
    console.log(`Deleted ${deletedLeads.count} leads`);

    console.log('All leads deleted successfully!');
  } catch (error) {
    console.error('Error deleting leads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllLeads();
