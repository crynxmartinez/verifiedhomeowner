import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let subscriptionLeads = [];
    let marketplaceLeads = [];

    // Get user's subscription leads
    try {
      subscriptionLeads = await prisma.userLead.findMany({
        where: { userId: req.user.id },
        include: { lead: true },
        orderBy: { assignedAt: 'desc' }
      });
    } catch (subErr) {
      console.error('Failed to fetch subscription leads:', subErr);
      subscriptionLeads = [];
    }

    // Get user's purchased marketplace leads
    try {
      marketplaceLeads = await prisma.userMarketplaceLead.findMany({
        where: { userId: req.user.id },
        include: { marketplaceLead: true },
        orderBy: { purchasedAt: 'desc' }
      });
    } catch (mktErr) {
      console.error('Failed to fetch marketplace leads:', mktErr);
      marketplaceLeads = [];
    }

    // Format subscription leads
    const formattedSubLeads = (subscriptionLeads || []).map(ul => {
      if (!ul.lead) {
        console.warn(`Lead data missing for user_lead ${ul.id}`);
        return null;
      }
      
      return {
        id: ul.id,
        user_id: ul.userId,
        lead_id: ul.leadId,
        status: ul.status,
        action: ul.action,
        assigned_at: ul.assignedAt,
        last_called_at: ul.lastCalledAt,
        follow_up_date: ul.followUpDate,
        countdown_days: ul.countdownDays,
        notes: ul.notes,
        tags: ul.tags,
        created_at: ul.createdAt,
        updated_at: ul.updatedAt,
        source: 'subscription',
        lead: {
          id: ul.lead.id,
          full_name: ul.lead.fullName || '',
          first_name: ul.lead.firstName || '',
          last_name: ul.lead.lastName || '',
          is_business: ul.lead.isBusiness || false,
          phone: ul.lead.phone,
          property_address: ul.lead.propertyAddress,
          city: ul.lead.city,
          state: ul.lead.state,
          zip_code: ul.lead.zipCode,
          mailing_address: ul.lead.mailingAddress,
          mailing_city: ul.lead.mailingCity,
          mailing_state: ul.lead.mailingState,
          mailing_zip: ul.lead.mailingZip,
          motivation: ul.motivation || null,
        }
      };
    }).filter(Boolean);

    // Format marketplace leads
    const formattedMktLeads = (marketplaceLeads || []).map(uml => ({
      id: uml.id,
      user_id: uml.userId,
      lead_id: uml.marketplaceLeadId,
      status: uml.status,
      action: uml.action,
      assigned_at: uml.purchasedAt,
      last_called_at: uml.lastCalledAt,
      follow_up_date: uml.followUpDate,
      countdown_days: uml.countdownDays,
      notes: uml.notes,
      tags: uml.tags,
      created_at: uml.createdAt,
      updated_at: uml.updatedAt,
      source: 'purchased',
      price_paid: uml.pricePaid,
      lead: {
        id: uml.marketplaceLeadId,
        owner_name: uml.marketplaceLead?.ownerName,
        phone: uml.marketplaceLead?.phone,
        property_address: uml.marketplaceLead?.propertyAddress,
        city: uml.marketplaceLead?.city,
        state: uml.marketplaceLead?.state,
        zip_code: uml.marketplaceLead?.zipCode,
        motivation: uml.marketplaceLead?.motivation,
        timeline: uml.marketplaceLead?.timeline,
      }
    }));

    // Combine both types
    const allLeads = [...formattedSubLeads, ...formattedMktLeads]
      .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));

    res.status(200).json({ leads: allLeads });
  } catch (error) {
    console.error('Leads fetch error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    res.status(500).json({ 
      error: 'Failed to fetch leads',
      details: error.message 
    });
  }
}

export default requireAuth(handler);
