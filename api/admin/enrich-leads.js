import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';
import { fetchPropertyDataForAddress } from '../zillow/property.js';

// Delay helper for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Build full address string from lead data
 */
function buildFullAddress(lead) {
  const parts = [];
  if (lead.propertyAddress) parts.push(lead.propertyAddress);
  if (lead.city) parts.push(lead.city);
  if (lead.state) {
    if (lead.zipCode) {
      parts.push(`${lead.state} ${lead.zipCode}`);
    } else {
      parts.push(lead.state);
    }
  } else if (lead.zipCode) {
    parts.push(lead.zipCode);
  }
  return parts.length >= 2 ? parts.join(', ') : null;
}

/**
 * POST /api/admin/enrich-leads
 * Enrich existing leads that don't have property data
 * Body: { leadIds?: string[], limit?: number }
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadIds, limit = 10 } = req.body;

  if (!process.env.RAPIDAPI_KEY) {
    return res.status(500).json({ error: 'RAPIDAPI_KEY not configured' });
  }

  try {
    // Find leads without property data
    const whereClause = {
      propertyDataFetchedAt: null,
      propertyAddress: { not: null },
    };

    if (leadIds && leadIds.length > 0) {
      whereClause.id = { in: leadIds };
    }

    const leadsToEnrich = await prisma.lead.findMany({
      where: whereClause,
      take: Math.min(limit, 50), // Max 50 at a time
      select: {
        id: true,
        propertyAddress: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });

    if (leadsToEnrich.length === 0) {
      return res.status(200).json({
        message: 'No leads to enrich',
        enrichedCount: 0,
        failedCount: 0,
      });
    }

    console.log(`[Lead Enrichment] Starting enrichment for ${leadsToEnrich.length} leads...`);

    let enrichedCount = 0;
    let failedCount = 0;

    for (const lead of leadsToEnrich) {
      const fullAddress = buildFullAddress(lead);
      
      if (!fullAddress) {
        failedCount++;
        continue;
      }

      try {
        console.log(`[Lead Enrichment] Fetching data for: ${fullAddress}`);
        const propertyData = await fetchPropertyDataForAddress(fullAddress);

        if (propertyData) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              zpid: propertyData.zpid,
              zestimate: propertyData.zestimate,
              bedrooms: propertyData.bedrooms,
              bathrooms: propertyData.bathrooms,
              livingArea: propertyData.livingArea,
              lotSize: propertyData.lotSize,
              yearBuilt: propertyData.yearBuilt,
              homeType: propertyData.homeType,
              lastSalePrice: propertyData.lastSalePrice,
              lastSaleDate: propertyData.lastSaleDate,
              propertyPhoto: propertyData.propertyPhoto,
              priceHistory: propertyData.priceHistory,
              zestimateHistory: propertyData.zestimateHistory,
              propertyDataFetchedAt: propertyData.propertyDataFetchedAt,
            },
          });
          enrichedCount++;
          console.log(`[Lead Enrichment] Success for lead ${lead.id}`);
        } else {
          // Mark as attempted even if no data found
          await prisma.lead.update({
            where: { id: lead.id },
            data: { propertyDataFetchedAt: new Date() },
          });
          failedCount++;
          console.log(`[Lead Enrichment] No data found for lead ${lead.id}`);
        }

        // Rate limiting: 200ms delay between API calls
        await delay(200);
      } catch (error) {
        console.error(`[Lead Enrichment] Error for lead ${lead.id}:`, error.message);
        failedCount++;
      }
    }

    console.log(`[Lead Enrichment] Completed: ${enrichedCount} enriched, ${failedCount} failed`);

    return res.status(200).json({
      message: `Enriched ${enrichedCount} leads, ${failedCount} failed or no data`,
      enrichedCount,
      failedCount,
      totalProcessed: leadsToEnrich.length,
    });
  } catch (error) {
    console.error('[Lead Enrichment] Error:', error);
    return res.status(500).json({ error: 'Failed to enrich leads' });
  }
}

export default requireAdmin(handler);
