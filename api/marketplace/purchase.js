import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

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

    // Create purchase record and increment times_sold in a transaction
    const [purchase] = await prisma.$transaction([
      prisma.userMarketplaceLead.create({
        data: {
          userId,
          marketplaceLeadId: leadId,
          pricePaid: lead.price,
          status: 'new',
          action: 'call_now',
        }
      }),
      prisma.marketplaceLead.update({
        where: { id: leadId },
        data: { timesSold: { increment: 1 } }
      })
    ]);

    res.status(201).json({ 
      message: 'Lead purchased successfully',
      purchase 
    });
  } catch (error) {
    console.error('Purchase lead error:', error);
    res.status(500).json({ error: 'Failed to purchase lead' });
  }
}

export default requireAuth(handler);
