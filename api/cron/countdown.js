import { supabaseAdmin } from '../../lib/supabase.js';

/**
 * Daily CRON job to decrement countdown_days and auto-change status
 * Runs at midnight UTC (0 0 * * *)
 * 
 * Process:
 * 1. Decrement all countdown_days by 1 where countdown_days > 0
 * 2. Find leads where countdown_days reached 0
 * 3. Change those leads to status='new', action='call_now', countdown_days=NULL
 */
async function handler(req, res) {
  console.log('=== COUNTDOWN CRON STARTED ===');
  console.log('Time:', new Date().toISOString());

  try {
    // Verify CRON secret for security
    const cronSecret = req.headers['x-vercel-cron-secret'];
    if (cronSecret !== process.env.CRON_SECRET) {
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
    const { data: decrementedSubscription, error: decrementError1 } = await supabaseAdmin
      .from('user_leads')
      .update({ 
        countdown_days: supabaseAdmin.raw('countdown_days - 1'),
        updated_at: new Date().toISOString()
      })
      .gt('countdown_days', 0)
      .select('id, countdown_days');

    if (decrementError1) {
      console.error('Error decrementing subscription leads:', decrementError1);
      results.errors.push({ table: 'user_leads', step: 'decrement', error: decrementError1.message });
    } else {
      results.subscription_leads.decremented = decrementedSubscription?.length || 0;
      console.log(`✅ Decremented ${results.subscription_leads.decremented} subscription leads`);
    }

    // Find leads where countdown reached 0 and reset them
    const { data: zeroCountdownSubscription, error: findError1 } = await supabaseAdmin
      .from('user_leads')
      .select('id, user_id, status')
      .eq('countdown_days', 0);

    if (findError1) {
      console.error('Error finding zero countdown subscription leads:', findError1);
      results.errors.push({ table: 'user_leads', step: 'find_zero', error: findError1.message });
    } else if (zeroCountdownSubscription && zeroCountdownSubscription.length > 0) {
      console.log(`Found ${zeroCountdownSubscription.length} subscription leads with countdown = 0`);

      // Reset status to 'new', action to 'call_now', countdown to NULL
      const { data: resetSubscription, error: resetError1 } = await supabaseAdmin
        .from('user_leads')
        .update({
          status: 'new',
          action: 'call_now',
          countdown_days: null,
          updated_at: new Date().toISOString()
        })
        .eq('countdown_days', 0)
        .select('id, user_id');

      if (resetError1) {
        console.error('Error resetting subscription leads:', resetError1);
        results.errors.push({ table: 'user_leads', step: 'reset', error: resetError1.message });
      } else {
        results.subscription_leads.reset = resetSubscription?.length || 0;
        console.log(`✅ Reset ${results.subscription_leads.reset} subscription leads to "call now"`);
        
        // Log each reset lead
        resetSubscription?.forEach(lead => {
          console.log(`  - Lead ${lead.id} (User: ${lead.user_id}) → status: new, action: call_now`);
        });
      }
    } else {
      console.log('No subscription leads with countdown = 0');
    }

    // ========================================================================
    // STEP 2: Process user_marketplace_leads (purchased leads)
    // ========================================================================
    console.log('\n--- Processing purchased leads (user_marketplace_leads) ---');

    // Decrement countdown_days by 1 for all leads with countdown > 0
    const { data: decrementedPurchased, error: decrementError2 } = await supabaseAdmin
      .from('user_marketplace_leads')
      .update({ 
        countdown_days: supabaseAdmin.raw('countdown_days - 1'),
        updated_at: new Date().toISOString()
      })
      .gt('countdown_days', 0)
      .select('id, countdown_days');

    if (decrementError2) {
      console.error('Error decrementing purchased leads:', decrementError2);
      results.errors.push({ table: 'user_marketplace_leads', step: 'decrement', error: decrementError2.message });
    } else {
      results.purchased_leads.decremented = decrementedPurchased?.length || 0;
      console.log(`✅ Decremented ${results.purchased_leads.decremented} purchased leads`);
    }

    // Find leads where countdown reached 0 and reset them
    const { data: zeroCountdownPurchased, error: findError2 } = await supabaseAdmin
      .from('user_marketplace_leads')
      .select('id, user_id, status')
      .eq('countdown_days', 0);

    if (findError2) {
      console.error('Error finding zero countdown purchased leads:', findError2);
      results.errors.push({ table: 'user_marketplace_leads', step: 'find_zero', error: findError2.message });
    } else if (zeroCountdownPurchased && zeroCountdownPurchased.length > 0) {
      console.log(`Found ${zeroCountdownPurchased.length} purchased leads with countdown = 0`);

      // Reset status to 'new', action to 'call_now', countdown to NULL
      const { data: resetPurchased, error: resetError2 } = await supabaseAdmin
        .from('user_marketplace_leads')
        .update({
          status: 'new',
          action: 'call_now',
          countdown_days: null,
          updated_at: new Date().toISOString()
        })
        .eq('countdown_days', 0)
        .select('id, user_id');

      if (resetError2) {
        console.error('Error resetting purchased leads:', resetError2);
        results.errors.push({ table: 'user_marketplace_leads', step: 'reset', error: resetError2.message });
      } else {
        results.purchased_leads.reset = resetPurchased?.length || 0;
        console.log(`✅ Reset ${results.purchased_leads.reset} purchased leads to "call now"`);
        
        // Log each reset lead
        resetPurchased?.forEach(lead => {
          console.log(`  - Lead ${lead.id} (User: ${lead.user_id}) → status: new, action: call_now`);
        });
      }
    } else {
      console.log('No purchased leads with countdown = 0');
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
