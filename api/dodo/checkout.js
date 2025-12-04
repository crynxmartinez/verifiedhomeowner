import { createClient } from '@supabase/supabase-js';
import DodoPayments from 'dodopayments';

export default async function handler(req, res) {
  // Initialize clients inside handler to ensure env vars are available
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode',
  });

  // Product IDs from Dodo Dashboard
  const DODO_PRODUCTS = {
    basic: process.env.DODO_PRODUCT_BASIC,
    elite: process.env.DODO_PRODUCT_ELITE,
    pro: process.env.DODO_PRODUCT_PRO,
  };

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan, userId } = req.body;

    // Validate plan
    if (!plan || !DODO_PRODUCTS[plan]) {
      return res.status(400).json({ 
        error: 'Invalid plan. Must be one of: basic, elite, pro' 
      });
    }

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user details from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User lookup error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Dodo subscription with payment link
    const subscription = await dodo.subscriptions.create({
      product_id: DODO_PRODUCTS[plan],
      quantity: 1,
      customer: {
        email: user.email,
        name: user.name || user.email,
      },
      payment_link: true,
      return_url: `${process.env.FRONTEND_URL || 'https://www.verifiedhomeowner.com'}/dashboard?checkout=success`,
      metadata: {
        user_id: userId,
        plan: plan,
      },
    });

    return res.status(200).json({ 
      url: subscription.payment_link,
      subscriptionId: subscription.subscription_id,
    });

  } catch (error) {
    console.error('Dodo checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
}
