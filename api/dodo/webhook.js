import prisma from '../../lib/prisma.js';
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
    // Get raw body
    const rawBody = await getRawBody(req);
    
    // Log webhook headers for debugging
    console.log('Webhook headers:', {
      'webhook-id': req.headers['webhook-id'],
      'webhook-signature': req.headers['webhook-signature'],
      'webhook-timestamp': req.headers['webhook-timestamp'],
    });

    // Parse the payload
    const event = JSON.parse(rawBody);
    const eventType = event.type;
    const data = event.data;
    
    console.log('📋 Webhook event received:', eventType);
    console.log('📋 Event data:', JSON.stringify(data, null, 2));

    console.log(`📋 Processing webhook: ${eventType}`);

    // Handle subscription events
    switch (eventType) {
      case 'subscription.active':
        await handleSubscriptionActive(data);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(data);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data);
        break;

      case 'subscription.expired':
      case 'subscription.failed':
        await handleSubscriptionEnded(data);
        break;

      case 'subscription.on_hold':
        await handleSubscriptionOnHold(data);
        break;

      case 'subscription.plan_changed':
        await handlePlanChanged(data);
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
async function handleSubscriptionActive(data) {
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
    const user = await prisma.user.findUnique({
      where: { email: customer.email },
      select: { id: true }
    });
    
    if (user) {
      userId = user.id;
    }
  }

  if (!userId) {
    console.error('Could not find user for subscription:', subscription_id);
    return;
  }

  // Update user's plan
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: plan,
        dodoSubscriptionId: subscription_id,
        dodoCustomerId: customer?.customer_id,
        subscriptionStatus: 'active',
        subscriptionEndDate: next_billing_date ? new Date(next_billing_date) : null,
      }
    });
    console.log(`✅ User ${userId} upgraded to ${plan} plan`);
  } catch (error) {
    console.error('Failed to update user plan:', error);
  }
}

// Handle subscription renewal
async function handleSubscriptionRenewed(data) {
  const { subscription_id, next_billing_date } = data;
  
  console.log('🔄 Subscription renewed:', subscription_id);

  try {
    await prisma.user.updateMany({
      where: { dodoSubscriptionId: subscription_id },
      data: {
        subscriptionStatus: 'active',
        subscriptionEndDate: next_billing_date ? new Date(next_billing_date) : null,
      }
    });
    console.log('✅ Subscription renewal recorded');
  } catch (error) {
    console.error('Failed to update renewal:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(data) {
  const { subscription_id, cancelled_at } = data;
  
  console.log('❌ Subscription cancelled:', subscription_id);

  // Keep the current plan until end of billing period
  try {
    await prisma.user.updateMany({
      where: { dodoSubscriptionId: subscription_id },
      data: { subscriptionStatus: 'cancelled' }
    });
    console.log('✅ Subscription marked as cancelled');
  } catch (error) {
    console.error('Failed to update cancellation:', error);
  }
}

// Handle subscription ended (expired or failed)
async function handleSubscriptionEnded(data) {
  const { subscription_id } = data;
  
  console.log('⏹️ Subscription ended:', subscription_id);

  // Downgrade to free plan
  try {
    await prisma.user.updateMany({
      where: { dodoSubscriptionId: subscription_id },
      data: {
        planType: 'free',
        subscriptionStatus: 'expired',
        dodoSubscriptionId: null,
      }
    });
    console.log('✅ User downgraded to free plan');
  } catch (error) {
    console.error('Failed to downgrade user:', error);
  }
}

// Handle subscription on hold (payment failed but not yet expired)
async function handleSubscriptionOnHold(data) {
  const { subscription_id } = data;
  
  console.log('⏸️ Subscription on hold:', subscription_id);

  try {
    await prisma.user.updateMany({
      where: { dodoSubscriptionId: subscription_id },
      data: { subscriptionStatus: 'on_hold' }
    });
    console.log('✅ Subscription marked as on_hold');
  } catch (error) {
    console.error('Failed to update on_hold status:', error);
  }
}

// Handle plan change (upgrade/downgrade)
async function handlePlanChanged(data) {
  const { subscription_id, product_id, next_billing_date } = data;
  
  console.log('🔄 Plan changed:', subscription_id);

  const plan = getPlanFromProductId(product_id);
  if (!plan) {
    console.error('Unknown product ID:', product_id);
    return;
  }

  try {
    await prisma.user.updateMany({
      where: { dodoSubscriptionId: subscription_id },
      data: {
        planType: plan,
        subscriptionStatus: 'active',
        subscriptionEndDate: next_billing_date ? new Date(next_billing_date) : null,
      }
    });
    console.log(`✅ Plan changed to ${plan}`);
  } catch (error) {
    console.error('Failed to update plan change:', error);
  }
}
