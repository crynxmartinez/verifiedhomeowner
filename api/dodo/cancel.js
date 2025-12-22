import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';
import DodoPayments from 'dodopayments';

async function handler(req, res) {
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

  const userId = req.user.id;

  try {
    // Get user's subscription details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dodoSubscriptionId: true,
        subscriptionStatus: true,
        planType: true,
        subscriptionEndDate: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has an active subscription
    if (!user.dodoSubscriptionId) {
      return res.status(400).json({ 
        error: 'No active subscription',
        message: 'You do not have an active subscription to cancel.'
      });
    }

    // Check if already cancelled
    if (user.subscriptionStatus === 'cancelled') {
      return res.status(400).json({ 
        error: 'Already cancelled',
        message: 'Your subscription has already been cancelled.',
        subscriptionEndDate: user.subscriptionEndDate
      });
    }

    // Initialize Dodo Payments client
    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode',
    });

    // Cancel the subscription via Dodo API (cancel at period end)
    await dodo.subscriptions.update(user.dodoSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user's subscription status in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'cancelled',
      }
    });

    console.log(`✅ Subscription cancelled for user ${userId}: ${user.dodoSubscriptionId}`);

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      details: {
        plan: user.planType,
        status: 'cancelled',
        accessUntil: user.subscriptionEndDate,
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    
    // Handle specific Dodo API errors
    if (error.status === 404) {
      // Subscription not found in Dodo - clean up local state
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'cancelled',
          dodoSubscriptionId: null,
        }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Subscription cancelled',
      });
    }

    return res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: error.message 
    });
  }
}

export default requireAuth(handler);
