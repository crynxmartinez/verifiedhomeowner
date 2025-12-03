import { stripe, getPlanFromPriceId } from '../../lib/stripe.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { distributeLeadsToUser } from '../../lib/distributeLeads.js';

// Disable body parsing - Stripe needs raw body for signature verification
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
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`[Stripe Webhook] Event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;

        if (userId && planId) {
          console.log(`[Stripe] Checkout completed for user ${userId}, plan: ${planId}`);
          
          // Update user plan
          await supabaseAdmin
            .from('users')
            .update({
              plan_type: planId,
              subscription_status: 'active',
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // Distribute leads for the new plan
          try {
            await distributeLeadsToUser(userId);
            console.log(`[Stripe] Leads distributed to user ${userId}`);
          } catch (distError) {
            console.error('[Stripe] Lead distribution failed:', distError);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          const priceId = subscription.items.data[0]?.price?.id;
          const planId = getPlanFromPriceId(priceId);
          const status = subscription.status;

          console.log(`[Stripe] Subscription updated for user ${userId}: ${status}, plan: ${planId}`);

          const updateData = {
            subscription_status: status === 'active' ? 'active' : 'inactive',
            updated_at: new Date().toISOString(),
          };

          if (planId) {
            updateData.plan_type = planId;
          }

          await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          console.log(`[Stripe] Subscription canceled for user ${userId}`);
          
          // Downgrade to free plan
          await supabaseAdmin
            .from('users')
            .update({
              plan_type: 'free',
              subscription_status: 'inactive',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find user by customer ID
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          console.log(`[Stripe] Payment failed for user ${user.id} (${user.email})`);
          // You could send an email notification here
        }
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
