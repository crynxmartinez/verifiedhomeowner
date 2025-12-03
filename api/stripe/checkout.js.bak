import { stripe, STRIPE_PRICES } from '../../lib/stripe.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId } = req.body;
    const userId = req.user.id;

    // Validate plan
    if (!['basic', 'elite', 'pro'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const priceId = STRIPE_PRICES[planId];
    if (!priceId) {
      return res.status(400).json({ error: 'Price not configured for this plan' });
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, name, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          user_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.vercel.app'}/upgrade?success=true&plan=${planId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.vercel.app'}/upgrade?canceled=true`,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

export default requireAuth(handler);
