import { createClient } from '@supabase/supabase-js';
import DodoPayments from 'dodopayments';

// Disable body parsing to access raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Product IDs from Dodo Dashboard
const DODO_PRODUCTS = {
  basic: process.env.DODO_PRODUCT_BASIC,
  elite: process.env.DODO_PRODUCT_ELITE,
  pro: process.env.DODO_PRODUCT_PRO,
};

// Map Dodo product IDs back to plan types
function getPlanFromProductId(productId) {
  for (const [plan, id] of Object.entries(DODO_PRODUCTS)) {
    if (id === productId) return plan;
  }
  return null;
}

// Create Supabase client
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, webhook-id, webhook-signature, webhook-timestamp');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Dodo client
    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode',
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    });

    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    
    // Get webhook headers
    const webhookHeaders = {
      'webhook-id': req.headers['webhook-id'] || '',
      'webhook-signature': req.headers['webhook-signature'] || '',
      'webhook-timestamp': req.headers['webhook-timestamp'] || '',
    };

    // Verify webhook signature
    try {
      dodo.webhooks.unwrap(rawBody, { headers: webhookHeaders });
      console.log('✅ Webhook signature verified');
    } catch (verifyError) {
      console.error('❌ Webhook verification failed:', verifyError);
      return res.status(401).json({ error: 'Webhook verification failed' });
    }

    // Parse the payload
    const event = JSON.parse(rawBody);
    const eventType = event.type;
    const data = event.data;

    console.log(`📋 Processing webhook: ${eventType}`);

    const supabase = getSupabase();

    // Handle subscription events
    switch (eventType) {
      case 'subscription.active':
        await handleSubscriptionActive(supabase, data);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(supabase, data);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, data);
        break;

      case 'subscription.expired':
      case 'subscription.failed':
        await handleSubscriptionEnded(supabase, data);
        break;

      case 'subscription.on_hold':
        await handleSubscriptionOnHold(supabase, data);
        break;

      case 'subscription.plan_changed':
        await handlePlanChanged(supabase, data);
        break;

      case 'subscription.updated':
        console.log('ℹ️ Subscription updated:', data.subscription_id);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Handle new subscription activation
async function handleSubscriptionActive(supabase, data) {
  const { subscription_id, product_id, customer, metadata, next_billing_date } = data;
  
  console.log('🎉 Subscription activated:', subscription_id);

  // Get plan type from product ID
  const plan = getPlanFromProductId(product_id);
  if (!plan) {
    console.error('Unknown product ID:', product_id);
    return;
  }

  // Try to find user by metadata first, then by email
  let userId = metadata?.user_id;
  
  if (!userId && customer?.email) {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', customer.email)
      .single();
    
    if (user) {
      userId = user.id;
    }
  }

  if (!userId) {
    console.error('Could not find user for subscription:', subscription_id);
    return;
  }

  // Update user's plan
  const { error } = await supabase
    .from('users')
    .update({
      plan_type: plan,
      dodo_subscription_id: subscription_id,
      dodo_customer_id: customer?.customer_id,
      subscription_status: 'active',
      subscription_end_date: next_billing_date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user plan:', error);
  } else {
    console.log(`✅ User ${userId} upgraded to ${plan} plan`);
  }
}

// Handle subscription renewal
async function handleSubscriptionRenewed(supabase, data) {
  const { subscription_id, next_billing_date } = data;
  
  console.log('🔄 Subscription renewed:', subscription_id);

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      subscription_end_date: next_billing_date,
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription_id);

  if (error) {
    console.error('Failed to update renewal:', error);
  } else {
    console.log('✅ Subscription renewal recorded');
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(supabase, data) {
  const { subscription_id, cancelled_at } = data;
  
  console.log('❌ Subscription cancelled:', subscription_id);

  // Keep the current plan until end of billing period
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription_id);

  if (error) {
    console.error('Failed to update cancellation:', error);
  } else {
    console.log('✅ Subscription marked as cancelled');
  }
}

// Handle subscription ended (expired or failed)
async function handleSubscriptionEnded(supabase, data) {
  const { subscription_id } = data;
  
  console.log('⏹️ Subscription ended:', subscription_id);

  // Downgrade to free plan
  const { error } = await supabase
    .from('users')
    .update({
      plan_type: 'free',
      subscription_status: 'expired',
      dodo_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription_id);

  if (error) {
    console.error('Failed to downgrade user:', error);
  } else {
    console.log('✅ User downgraded to free plan');
  }
}

// Handle subscription on hold (payment failed but not yet expired)
async function handleSubscriptionOnHold(supabase, data) {
  const { subscription_id } = data;
  
  console.log('⏸️ Subscription on hold:', subscription_id);

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'on_hold',
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription_id);

  if (error) {
    console.error('Failed to update on_hold status:', error);
  } else {
    console.log('✅ Subscription marked as on_hold');
  }
}

// Handle plan change (upgrade/downgrade)
async function handlePlanChanged(supabase, data) {
  const { subscription_id, product_id, next_billing_date } = data;
  
  console.log('🔄 Plan changed:', subscription_id);

  const plan = getPlanFromProductId(product_id);
  if (!plan) {
    console.error('Unknown product ID:', product_id);
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({
      plan_type: plan,
      subscription_status: 'active',
      subscription_end_date: next_billing_date,
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription_id);

  if (error) {
    console.error('Failed to update plan change:', error);
  } else {
    console.log(`✅ Plan changed to ${plan}`);
  }
}
