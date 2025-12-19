import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';
import DodoPayments from 'dodopayments';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.id;
  const { leadId } = req.body;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID required' });
  }

  try {
    // Get the marketplace lead
    const lead = await prisma.marketplaceLead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check if user already purchased this lead
    const existing = await prisma.userMarketplaceLead.findUnique({
      where: {
        userId_marketplaceLeadId: {
          userId,
          marketplaceLeadId: leadId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You already purchased this lead' });
    }

    // Check if max_buyers reached
    if (lead.maxBuyers > 0 && lead.timesSold >= lead.maxBuyers) {
      return res.status(400).json({ error: 'This lead is no longer available' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize DodoPayments
    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode',
    });

    // Create checkout session for one-time payment
    const session = await dodo.checkoutSessions.create({
      billing: {
        city: 'N/A',
        country: 'US',
        state: 'N/A',
        street: 'N/A',
        zipcode: '00000',
      },
      customer: {
        email: user.email,
        name: user.name || user.email,
      },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_MARKETPLACE_LEAD,
          quantity: 1,
        }
      ],
      success_url: `${process.env.FRONTEND_URL || 'https://www.verifiedhomeowner.com'}/marketplace?purchase=success&leadId=${leadId}`,
      metadata: {
        user_id: userId,
        lead_id: leadId,
        type: 'marketplace_lead_purchase',
        price: lead.price.toString(),
      },
    });

    return res.status(200).json({ 
      url: session.url,
      sessionId: session.session_id,
    });

  } catch (error) {
    console.error('Marketplace checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
}

export default requireAuth(handler);
