import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateLeadsToQueue() {
  console.log('Starting migration of existing leads to LeadQueue...');
  
  try {
    // Get all leads ordered by sequence_number (FIFO order)
    const leads = await prisma.lead.findMany({
      orderBy: { sequenceNumber: 'asc' },
      select: { id: true, sequenceNumber: true, createdAt: true }
    });
    
    console.log(`Found ${leads.length} leads to migrate`);
    
    if (leads.length === 0) {
      console.log('No leads to migrate');
      return;
    }
    
    // Check how many are already in queue
    const existingQueueCount = await prisma.leadQueue.count();
    console.log(`Existing queue entries: ${existingQueueCount}`);
    
    // Get leads not yet in queue
    const existingQueueLeadIds = await prisma.leadQueue.findMany({
      select: { leadId: true }
    });
    const existingLeadIdSet = new Set(existingQueueLeadIds.map(q => q.leadId));
    
    const leadsToMigrate = leads.filter(lead => !existingLeadIdSet.has(lead.id));
    console.log(`Leads to add to queue: ${leadsToMigrate.length}`);
    
    if (leadsToMigrate.length === 0) {
      console.log('All leads already in queue');
      return;
    }
    
    // Get the current max queue position
    const maxPosition = await prisma.leadQueue.aggregate({
      _max: { queuePosition: true }
    });
    let currentPosition = (maxPosition._max.queuePosition || 0);
    
    // Generate batch ID for this migration
    const batchId = `migration-${new Date().toISOString().split('T')[0]}`;
    
    // Insert in batches of 100
    const batchSize = 100;
    let processed = 0;
    
    for (let i = 0; i < leadsToMigrate.length; i += batchSize) {
      const batch = leadsToMigrate.slice(i, i + batchSize);
      
      const queueEntries = batch.map((lead, index) => ({
        leadId: lead.id,
        queuePosition: currentPosition + i + index + 1,
        uploadBatch: batchId,
        uploadedAt: lead.createdAt
      }));
      
      await prisma.leadQueue.createMany({
        data: queueEntries,
        skipDuplicates: true
      });
      
      processed += batch.length;
      console.log(`Processed ${processed}/${leadsToMigrate.length} leads`);
    }
    
    console.log('\n✅ Migration complete!');
    
    // Show summary
    const totalQueue = await prisma.leadQueue.count();
    const unassigned = await prisma.leadQueue.count({
      where: { assignedToPool: null }
    });
    
    console.log(`\nQueue Summary:`);
    console.log(`  Total in queue: ${totalQueue}`);
    console.log(`  Unassigned (available for pools): ${unassigned}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateLeadsToQueue();
