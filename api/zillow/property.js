/**
 * Zillow Property Data API
 * Fetches property details, price history, and zestimate history from RapidAPI
 * 
 * POST /api/zillow/property
 * Body: { address: "123 Main St, City, TX 75001" }
 * 
 * Returns: {
 *   zpid, zestimate, bedrooms, bathrooms, livingArea, lotSize, yearBuilt,
 *   homeType, lastSalePrice, lastSaleDate, propertyPhoto, priceHistory, zestimateHistory
 * }
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'private-zillow.p.rapidapi.com';

/**
 * Fetch property details by address
 */
async function fetchPropertyDetails(address) {
  const url = `https://${RAPIDAPI_HOST}/pro/byaddress?propertyaddress=${encodeURIComponent(address)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`Property details API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch price history by zpid and/or address
 */
async function fetchPriceHistory(zpid, address) {
  let url = `https://${RAPIDAPI_HOST}/pricehistory?`;
  
  if (zpid) {
    url += `byzpid=${zpid}`;
  }
  if (address) {
    url += `${zpid ? '&' : ''}byaddress=${encodeURIComponent(address)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    console.warn(`Price history API error: ${response.status}`);
    return null;
  }

  return response.json();
}

/**
 * Fetch zestimate history (chart data) by zpid and/or address
 */
async function fetchZestimateHistory(zpid, address) {
  let url = `https://${RAPIDAPI_HOST}/graph_charts?recent_first=True&which=zestimate_history`;
  
  if (zpid) {
    url += `&byzpid=${zpid}`;
  }
  if (address) {
    url += `&byaddress=${encodeURIComponent(address)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    console.warn(`Zestimate history API error: ${response.status}`);
    return null;
  }

  return response.json();
}

/**
 * Extract and normalize property data from API responses
 */
function normalizePropertyData(detailsResponse, historyResponse, zestimateResponse) {
  const details = detailsResponse?.propertyDetails || detailsResponse || {};
  
  // Extract price history array
  let priceHistory = null;
  if (historyResponse?.priceHistory) {
    priceHistory = historyResponse.priceHistory;
  } else if (Array.isArray(historyResponse)) {
    priceHistory = historyResponse;
  }

  // Extract zestimate history points
  let zestimateHistory = null;
  if (zestimateResponse?.DataPoints?.homeValueChartData?.[0]?.points) {
    zestimateHistory = zestimateResponse.DataPoints.homeValueChartData[0].points;
  }

  // Find last sale from price history
  // Strategy: Find ANY usable price in the history
  // 1. First try "Sold" events with a price
  // 2. Then try any non-rental event with a price
  // 3. Finally use any event with a price > $10k (skip low rental prices)
  let lastSalePrice = null;
  let lastSaleDate = null;
  if (priceHistory && priceHistory.length > 0) {
    // 1. Try sold events with price
    const soldWithPrice = priceHistory.find(h => 
      h.event?.toLowerCase().includes('sold') && h.price && h.price > 0
    );
    
    if (soldWithPrice) {
      lastSalePrice = soldWithPrice.price;
      lastSaleDate = soldWithPrice.date;
    } else {
      // 2. Try any non-rental event with price
      const nonRentalWithPrice = priceHistory.find(h => 
        !h.postingIsRental && h.price && h.price > 0
      );
      
      if (nonRentalWithPrice) {
        lastSalePrice = nonRentalWithPrice.price;
        lastSaleDate = nonRentalWithPrice.date;
      } else {
        // 3. Use any price > $10k (skip low rental prices)
        const anyHighPrice = priceHistory.find(h => h.price && h.price > 10000);
        if (anyHighPrice) {
          lastSalePrice = anyHighPrice.price;
          lastSaleDate = anyHighPrice.date;
        }
      }
    }
  }

  // Get main photo
  let propertyPhoto = null;
  if (details.originalPhotos && details.originalPhotos.length > 0) {
    propertyPhoto = details.originalPhotos[0]?.mixedSources?.jpeg?.[0]?.url || 
                    details.originalPhotos[0]?.url ||
                    details.imgSrc;
  } else if (details.imgSrc) {
    propertyPhoto = details.imgSrc;
  }

  return {
    zpid: details.zpid?.toString() || null,
    zestimate: details.zestimate || null,
    bedrooms: details.bedrooms || null,
    bathrooms: details.bathrooms || null,
    livingArea: details.livingArea || null,
    lotSize: details.lotAreaValue || details.lotSize || null,
    yearBuilt: details.yearBuilt || null,
    homeType: details.homeType || null,
    lastSalePrice: lastSalePrice,
    lastSaleDate: lastSaleDate ? new Date(lastSaleDate) : null,
    propertyPhoto: propertyPhoto,
    priceHistory: priceHistory,
    zestimateHistory: zestimateHistory,
    propertyDataFetchedAt: new Date(),
  };
}

/**
 * Main handler - fetch all property data for an address
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ error: 'RAPIDAPI_KEY not configured' });
  }

  try {
    // Step 1: Fetch property details
    console.log(`[Zillow API] Fetching property details for: ${address}`);
    const detailsResponse = await fetchPropertyDetails(address);
    
    if (!detailsResponse || detailsResponse.message?.includes('404')) {
      return res.status(404).json({ 
        error: 'Property not found',
        address: address 
      });
    }

    const zpid = detailsResponse?.propertyDetails?.zpid || detailsResponse?.zpid;

    // Step 2: Fetch price history (don't fail if this errors)
    let historyResponse = null;
    try {
      historyResponse = await fetchPriceHistory(zpid, address);
    } catch (err) {
      console.warn(`[Zillow API] Price history fetch failed: ${err.message}`);
    }

    // Step 3: Fetch zestimate history (don't fail if this errors)
    let zestimateResponse = null;
    try {
      zestimateResponse = await fetchZestimateHistory(zpid, address);
    } catch (err) {
      console.warn(`[Zillow API] Zestimate history fetch failed: ${err.message}`);
    }

    // Normalize and return data
    const propertyData = normalizePropertyData(detailsResponse, historyResponse, zestimateResponse);

    console.log(`[Zillow API] Successfully fetched data for zpid: ${propertyData.zpid}`);

    return res.status(200).json({
      success: true,
      data: propertyData,
    });

  } catch (error) {
    console.error(`[Zillow API] Error fetching property data:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch property data',
      message: error.message 
    });
  }
}

/**
 * Exported function for internal use (CSV upload enrichment)
 */
export async function fetchPropertyDataForAddress(address) {
  if (!address || !RAPIDAPI_KEY) {
    return null;
  }

  try {
    const detailsResponse = await fetchPropertyDetails(address);
    
    if (!detailsResponse || detailsResponse.message?.includes('404')) {
      return null;
    }

    const zpid = detailsResponse?.propertyDetails?.zpid || detailsResponse?.zpid;

    let historyResponse = null;
    try {
      historyResponse = await fetchPriceHistory(zpid, address);
    } catch (err) {
      console.warn(`Price history fetch failed: ${err.message}`);
    }

    let zestimateResponse = null;
    try {
      zestimateResponse = await fetchZestimateHistory(zpid, address);
    } catch (err) {
      console.warn(`Zestimate history fetch failed: ${err.message}`);
    }

    return normalizePropertyData(detailsResponse, historyResponse, zestimateResponse);

  } catch (error) {
    console.error(`Error fetching property data for ${address}:`, error.message);
    return null;
  }
}
