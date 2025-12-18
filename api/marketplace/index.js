import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  const userId = req.user.id;

  if (req.method === 'GET') {
    // Get available marketplace leads (excluding already purchased by this user)
    try {
      const { motivation, timeline, state } = req.query;

      // Get leads already purchased by this user
      const purchased = await prisma.userMarketplaceLead.findMany({
        where: { userId },
        select: { marketplaceLeadId: true }
      });

      const purchasedIds = purchased?.map(p => p.marketplaceLeadId) || [];

      // Build where clause
      const where = {};
      
      if (purchasedIds.length > 0) {
        where.id = { notIn: purchasedIds };
      }
      if (motivation) {
        where.motivation = motivation;
      }
      if (timeline) {
        where.timeline = timeline;
      }
      if (state) {
        where.state = state;
      }

      const leads = await prisma.marketplaceLead.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      // Filter out leads that reached max_buyers
      const availableLeads = (leads || []).filter(lead => {
        if (lead.maxBuyers === 0) return true; // unlimited
        return lead.timesSold < lead.maxBuyers;
      });

      // Format response to match frontend expectations
      const formattedLeads = availableLeads.map(lead => ({
        id: lead.id,
        owner_name: lead.ownerName,
        phone: lead.phone,
        property_address: lead.propertyAddress,
        city: lead.city,
        state: lead.state,
        zip_code: lead.zipCode,
        mailing_address: lead.mailingAddress,
        mailing_city: lead.mailingCity,
        mailing_state: lead.mailingState,
        mailing_zip: lead.mailingZip,
        motivation: lead.motivation,
        timeline: lead.timeline,
        price: lead.price,
        max_buyers: lead.maxBuyers,
        times_sold: lead.timesSold,
        created_at: lead.createdAt,
      }));

      res.status(200).json({ leads: formattedLeads });
    } catch (error) {
      console.error('Fetch marketplace leads error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch marketplace leads',
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
