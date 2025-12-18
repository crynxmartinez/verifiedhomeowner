import prisma from '../../lib/prisma.js';

/**
 * Daily CRON job to decrement countdown_days and auto-change status
 * Runs at midnight UTC (0 0 * * *)
 * 
 * Process:
 * 1. Decrement all countdown_days by 1 where countdown_days > 0
 * 2. Reset leads where countdown_days reached 0
 */
async function handler(req, res) {
  console.log('=== COUNTDOWN CRON STARTED ===');
  console.log('Time:', new Date().toISOString());

  try {
    // Verify CRON secret for security (Vercel sends Authorization: Bearer header)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized CRON request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const results = {
      subscription_leads: { decremented: 0, reset: 0 },
      purchased_leads: { decremented: 0, reset: 0 },
      errors: []
    };

    // ========================================================================
    // STEP 1: Process user_leads (subscription leads)
    // ========================================================================
    console.log('\n--- Processing subscription leads (user_leads) ---');

    // Decrement countdown_days by 1 for all leads with countdown > 0
    try {
      const decremented = await prisma.userLead.updateMany({
        where: { countdownDays: { gt: 0 } },
        data: { countdownDays: { decrement: 1 } }
      });
      results.subscription_leads.decremented = decremented.count;
      console.log(`✅ Decremented ${results.subscription_leads.decremented} subscription leads`);
    } catch (error) {
      console.error('Error decrementing subscription leads:', error);
      results.errors.push({ table: 'user_leads', step: 'decrement', error: error.message });
    }

    // Reset leads where countdown reached 0
    try {
      const reset = await prisma.userLead.updateMany({
        where: { countdownDays: 0 },
        data: {
          status: 'new',
          action: 'call_now',
          countdownDays: null
        }
      });
      results.subscription_leads.reset = reset.count;
      console.log(`✅ Reset ${results.subscription_leads.reset} subscription leads to "call now"`);
    } catch (error) {
      console.error('Error resetting subscription leads:', error);
      results.errors.push({ table: 'user_leads', step: 'reset', error: error.message });
    }

    // ========================================================================
    // STEP 2: Process user_marketplace_leads (purchased leads)
    // ========================================================================
    console.log('\n--- Processing purchased leads (user_marketplace_leads) ---');

    // Decrement countdown_days by 1 for all leads with countdown > 0
    try {
      const decremented = await prisma.userMarketplaceLead.updateMany({
        where: { countdownDays: { gt: 0 } },
        data: { countdownDays: { decrement: 1 } }
      });
      results.purchased_leads.decremented = decremented.count;
      console.log(`✅ Decremented ${results.purchased_leads.decremented} purchased leads`);
    } catch (error) {
      console.error('Error decrementing purchased leads:', error);
      results.errors.push({ table: 'user_marketplace_leads', step: 'decrement', error: error.message });
    }

    // Reset leads where countdown reached 0
    try {
      const reset = await prisma.userMarketplaceLead.updateMany({
        where: { countdownDays: 0 },
        data: {
          status: 'new',
          action: 'call_now',
          countdownDays: null
        }
      });
      results.purchased_leads.reset = reset.count;
      console.log(`✅ Reset ${results.purchased_leads.reset} purchased leads to "call now"`);
    } catch (error) {
      console.error('Error resetting purchased leads:', error);
      results.errors.push({ table: 'user_marketplace_leads', step: 'reset', error: error.message });
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n=== COUNTDOWN CRON SUMMARY ===');
    console.log('Subscription Leads:');
    console.log(`  - Decremented: ${results.subscription_leads.decremented}`);
    console.log(`  - Reset to Call Now: ${results.subscription_leads.reset}`);
    console.log('Purchased Leads:');
    console.log(`  - Decremented: ${results.purchased_leads.decremented}`);
    console.log(`  - Reset to Call Now: ${results.purchased_leads.reset}`);
    console.log('Errors:', results.errors.length);
    console.log('=== COUNTDOWN CRON COMPLETED ===\n');

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('COUNTDOWN CRON ERROR:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

export default handler;
