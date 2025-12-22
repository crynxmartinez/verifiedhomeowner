import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional filter by status
    const source = req.query.source; // Optional filter: 'subscription', 'purchased', or 'all'

    let subscriptionLeads = [];
    let marketplaceLeads = [];
    let totalSubscription = 0;
    let totalMarketplace = 0;

    // Build where clause for subscription leads
    const subWhere = { userId: req.user.id };
    if (status) subWhere.status = status;

    // Build where clause for marketplace leads
    const mktWhere = { userId: req.user.id };
    if (status) mktWhere.status = status;

    // Get user's subscription leads (if not filtering to purchased only)
    if (source !== 'purchased') {
      try {
        [subscriptionLeads, totalSubscription] = await Promise.all([
          prisma.userLead.findMany({
            where: subWhere,
            include: { lead: true },
            orderBy: { assignedAt: 'desc' },
            skip: source === 'subscription' ? skip : 0,
            take: source === 'subscription' ? limit : undefined,
          }),
          prisma.userLead.count({ where: subWhere })
        ]);
      } catch (subErr) {
        console.error('Failed to fetch subscription leads:', subErr);
        subscriptionLeads = [];
      }
    }

    // Get user's purchased marketplace leads (if not filtering to subscription only)
    if (source !== 'subscription') {
      try {
        [marketplaceLeads, totalMarketplace] = await Promise.all([
          prisma.userMarketplaceLead.findMany({
            where: mktWhere,
            include: { marketplaceLead: true },
            orderBy: { purchasedAt: 'desc' },
            skip: source === 'purchased' ? skip : 0,
            take: source === 'purchased' ? limit : undefined,
          }),
          prisma.userMarketplaceLead.count({ where: mktWhere })
        ]);
      } catch (mktErr) {
        console.error('Failed to fetch marketplace leads:', mktErr);
        marketplaceLeads = [];
      }
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
          // Property data from Zillow
          zpid: ul.lead.zpid,
          zestimate: ul.lead.zestimate ? parseFloat(ul.lead.zestimate) : null,
          bedrooms: ul.lead.bedrooms,
          bathrooms: ul.lead.bathrooms ? parseFloat(ul.lead.bathrooms) : null,
          living_area: ul.lead.livingArea,
          lot_size: ul.lead.lotSize,
          year_built: ul.lead.yearBuilt,
          home_type: ul.lead.homeType,
          last_sale_price: ul.lead.lastSalePrice ? parseFloat(ul.lead.lastSalePrice) : null,
          last_sale_date: ul.lead.lastSaleDate,
          property_photo: ul.lead.propertyPhoto,
          price_history: ul.lead.priceHistory,
          zestimate_history: ul.lead.zestimateHistory,
          property_data_fetched_at: ul.lead.propertyDataFetchedAt,
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
    let allLeads = [...formattedSubLeads, ...formattedMktLeads]
      .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));

    // Apply pagination for combined results (when no specific source filter)
    const totalLeads = totalSubscription + totalMarketplace;
    if (!source || source === 'all') {
      allLeads = allLeads.slice(skip, skip + limit);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalLeads / limit);

    res.status(200).json({ 
      leads: allLeads,
      pagination: {
        page,
        limit,
        total: totalLeads,
        totalPages,
        hasMore: page < totalPages,
      }
    });
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
