import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';
import Papa from 'papaparse';

// Detect if a name is a business/company rather than a person
function isBusinessName(name) {
  if (!name || typeof name !== 'string') return false;
  
  const nameLower = name.toLowerCase().trim();
  const nameUpper = name.toUpperCase();
  
  // Strong business indicators - legal entity suffixes
  const businessSuffixes = [
    'llc', 'inc', 'corp', 'corporation', 'ltd', 'limited',
    'llp', 'lp', 'pc', 'pa', 'pllc', 'co', 'company',
    'l.l.c', 'l.l.c.', 'inc.', 'corp.', 'ltd.',
  ];
  
  // Check for business suffixes
  for (const suffix of businessSuffixes) {
    if (nameLower.endsWith(suffix) || nameLower.endsWith(suffix + '.')) {
      return true;
    }
    // Check with word boundaries
    const regex = new RegExp(`\\b${suffix}\\b`, 'i');
    if (regex.test(nameLower)) {
      return true;
    }
  }
  
  // Business keywords that appear in company names
  const businessKeywords = [
    'enterprises', 'holdings', 'group', 'partners', 'associates',
    'trust', 'estate', 'properties', 'investments', 'ventures',
    'solutions', 'services', 'consulting', 'management', 'realty',
    'construction', 'development', 'builders', 'contractors',
  ];
  
  for (const keyword of businessKeywords) {
    if (nameLower.includes(keyword)) {
      return true;
    }
  }
  
  // Check for ampersand (common in business names like "Smith & Sons")
  if (name.includes('&') || name.includes(' and ')) {
    return true;
  }
  
  // Check if name is mostly uppercase (common for businesses)
  const uppercaseRatio = (name.match(/[A-Z]/g) || []).length / name.replace(/[^a-zA-Z]/g, '').length;
  if (uppercaseRatio > 0.7 && name.length > 5) {
    return true;
  }
  
  // Check for numbers at the beginning (like "123 Properties")
  if (/^\d/.test(name)) {
    return true;
  }
  
  return false;
}

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get leads with pagination
    try {
      // Pagination parameters
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const skip = (page - 1) * limit;
      const search = req.query.search?.toLowerCase();
      const stateFilter = req.query.state;

      // Build where clause
      const where = {};
      if (stateFilter) where.state = stateFilter;
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { propertyAddress: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get paginated leads with count
      const [leads, totalLeads] = await Promise.all([
        prisma.lead.findMany({
          where,
          orderBy: { sequenceNumber: 'asc' },
          skip,
          take: limit,
        }),
        prisma.lead.count({ where })
      ]);

      // Format for frontend
      const formattedLeads = leads.map(lead => ({
        id: lead.id,
        first_name: lead.firstName,
        last_name: lead.lastName,
        full_name: lead.fullName,
        is_business: lead.isBusiness,
        phone: lead.phone,
        property_address: lead.propertyAddress,
        city: lead.city,
        state: lead.state,
        zip_code: lead.zipCode,
        mailing_address: lead.mailingAddress,
        mailing_city: lead.mailingCity,
        mailing_state: lead.mailingState,
        mailing_zip: lead.mailingZip,
        sequence_number: lead.sequenceNumber,
        created_at: lead.createdAt,
      }));

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalLeads / limit);

      res.status(200).json({ 
        leads: formattedLeads,
        pagination: {
          page,
          limit,
          total: totalLeads,
          totalPages,
          hasMore: page < totalPages,
        }
      });
    } catch (error) {
      console.error('Fetch leads error:', error);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  } else if (req.method === 'POST') {
    // Create single lead or upload CSV
    try {
      const { csvData, singleLead, mappedData } = req.body;

      if (singleLead) {
        // Process name fields
        const firstName = singleLead.first_name || '';
        const lastName = singleLead.last_name || '';
        let fullName = singleLead.full_name || '';
        
        // If full_name is empty but we have first_name and/or last_name, combine them
        if (!fullName && (firstName || lastName)) {
          fullName = `${firstName} ${lastName}`.trim();
        }
        
        // For backward compatibility
        const ownerName = fullName || singleLead.owner_name || '';
        
        // REJECT BUSINESSES - Only accept actual people/names
        if (isBusinessName(fullName || ownerName)) {
          return res.status(400).json({ 
            error: 'Business/Company names are not allowed. Please enter individual person names only.',
            isBusiness: true
          });
        }
        
        const processedLead = {
          ...singleLead,
          owner_name: ownerName,
        };
        
        // Add new name fields only if they have values (for new schema)
        if (firstName) processedLead.first_name = firstName;
        if (lastName) processedLead.last_name = lastName;
        if (fullName) processedLead.full_name = fullName;
        
        // Mark as NOT a business (we already rejected businesses above)
        processedLead.is_business = false;
        
        // Check for duplicate by property_address
        const existing = await prisma.lead.findFirst({
          where: { propertyAddress: processedLead.property_address }
        });

        if (existing) {
          // Update existing lead
          const data = await prisma.lead.update({
            where: { id: existing.id },
            data: {
              firstName: processedLead.first_name,
              lastName: processedLead.last_name,
              fullName: processedLead.full_name,
              isBusiness: processedLead.is_business,
              phone: processedLead.phone,
              propertyAddress: processedLead.property_address,
              city: processedLead.city,
              state: processedLead.state,
              zipCode: processedLead.zip_code,
              mailingAddress: processedLead.mailing_address,
              mailingCity: processedLead.mailing_city,
              mailingState: processedLead.mailing_state,
              mailingZip: processedLead.mailing_zip,
            }
          });

          return res.status(200).json({ lead: data, updated: true });
        }

        // Create new lead
        const maxLead = await prisma.lead.findFirst({
          orderBy: { sequenceNumber: 'desc' },
          select: { sequenceNumber: true }
        });

        const nextSequence = (maxLead?.sequenceNumber || 0) + 1;

        const data = await prisma.lead.create({
          data: {
            firstName: processedLead.first_name,
            lastName: processedLead.last_name,
            fullName: processedLead.full_name,
            isBusiness: processedLead.is_business,
            phone: processedLead.phone,
            propertyAddress: processedLead.property_address,
            city: processedLead.city,
            state: processedLead.state,
            zipCode: processedLead.zip_code,
            mailingAddress: processedLead.mailing_address,
            mailingCity: processedLead.mailing_city,
            mailingState: processedLead.mailing_state,
            mailingZip: processedLead.mailing_zip,
            sequenceNumber: nextSequence,
          }
        });

        return res.status(201).json({ lead: data, updated: false });
      }

      if (mappedData) {
        // Handle mapped CSV data from frontend
        // Get existing leads for duplicate check
        const existingLeads = await prisma.lead.findMany({
          select: { id: true, propertyAddress: true, sequenceNumber: true }
        });

        const existingAddresses = new Map(
          existingLeads?.map(l => [l.propertyAddress?.toLowerCase(), l]) || []
        );

        // Get next sequence number
        const maxLead = await prisma.lead.findFirst({
          orderBy: { sequenceNumber: 'desc' },
          select: { sequenceNumber: true }
        });

        let nextSequence = (maxLead?.sequenceNumber || 0) + 1;

        const leadsToInsert = [];
        const leadsToUpdate = [];
        let updatedCount = 0;
        let skippedBusinessCount = 0; // Track businesses that were skipped

        // Process each mapped row
        mappedData.forEach(row => {
          // Extract name fields
          const firstName = row.first_name || '';
          const lastName = row.last_name || '';
          let fullName = row.full_name || '';
          
          // If full_name is empty but we have first_name and/or last_name, combine them
          if (!fullName && (firstName || lastName)) {
            fullName = `${firstName} ${lastName}`.trim();
          }
          
          // For backward compatibility, also set owner_name
          const ownerName = fullName || row.owner_name || '';
          
          // Skip rows without minimum required data
          if (!fullName && !ownerName && !row.property_address) {
            return;
          }
          
          // SKIP BUSINESSES - Only upload actual people/names
          if (isBusinessName(fullName || ownerName)) {
            skippedBusinessCount++; // Count skipped businesses
            return; // Skip this row entirely
          }

          const leadData = {
            phone: row.phone || '',
            propertyAddress: row.property_address || '',
            city: row.city || '',
            state: row.state || '',
            zipCode: row.zip_code || '',
            mailingAddress: row.mailing_address || '',
            mailingCity: row.mailing_city || '',
            mailingState: row.mailing_state || '',
            mailingZip: row.mailing_zip || '',
            isBusiness: false,
          };
          
          if (firstName) leadData.firstName = firstName;
          if (lastName) leadData.lastName = lastName;
          if (fullName) leadData.fullName = fullName;

          // Check for duplicates by property address
          const existing = existingAddresses.get(leadData.propertyAddress?.toLowerCase());
          if (existing && leadData.propertyAddress) {
            leadsToUpdate.push({ ...leadData, id: existing.id });
          } else {
            leadsToInsert.push({ ...leadData, sequenceNumber: nextSequence++ });
          }
        });

        // Insert new leads
        if (leadsToInsert.length > 0) {
          await prisma.lead.createMany({ data: leadsToInsert });
        }

        // Update existing leads
        for (const lead of leadsToUpdate) {
          const { id, ...updateData } = lead;
          try {
            await prisma.lead.update({ where: { id }, data: updateData });
            updatedCount++;
          } catch (e) {
            console.error('Update error:', e);
          }
        }

        return res.status(201).json({ 
          message: `${leadsToInsert.length} new leads uploaded, ${updatedCount} existing leads updated${skippedBusinessCount > 0 ? `, ${skippedBusinessCount} businesses skipped` : ''}`,
          newCount: leadsToInsert.length,
          updatedCount: updatedCount,
          skippedBusinessCount: skippedBusinessCount,
          totalProcessed: leadsToInsert.length + updatedCount,
          totalRows: mappedData.length
        });
      }

      if (csvData) {
        // Parse CSV
        const parsed = Papa.parse(csvData, { header: true });
        
        if (parsed.errors.length > 0) {
          return res.status(400).json({ error: 'Invalid CSV format' });
        }

        // Get existing leads for duplicate check
        const existingLeads = await prisma.lead.findMany({
          select: { id: true, propertyAddress: true, sequenceNumber: true }
        });

        const existingAddresses = new Map(
          existingLeads?.map(l => [l.propertyAddress, l]) || []
        );

        // Get next sequence number
        const maxLead = await prisma.lead.findFirst({
          orderBy: { sequenceNumber: 'desc' },
          select: { sequenceNumber: true }
        });

        let nextSequence = (maxLead?.sequenceNumber || 0) + 1;

        const leadsToInsert = [];
        const leadsToUpdate = [];
        let updatedCount = 0;

        // Process each row
        parsed.data
          .filter(row => row.full_name || row.owner_name)
          .forEach(row => {
            const leadData = {
              fullName: row.full_name || row.owner_name || '',
              phone: row.phone || row.number || '',
              propertyAddress: row.address || '',
              city: row.city || '',
              state: row.state || '',
              zipCode: row.zip || row.zip_code || '',
              mailingAddress: row.mailing_address || '',
              mailingCity: row.mailing_city || '',
              mailingState: row.mailing_state || '',
              mailingZip: row.mailing_zip || '',
            };

            const existing = existingAddresses.get(leadData.propertyAddress);
            if (existing) {
              leadsToUpdate.push({ ...leadData, id: existing.id });
            } else {
              leadsToInsert.push({ ...leadData, sequenceNumber: nextSequence++ });
            }
          });

        // Insert new leads
        if (leadsToInsert.length > 0) {
          await prisma.lead.createMany({ data: leadsToInsert });
        }

        // Update existing leads
        for (const lead of leadsToUpdate) {
          const { id, ...updateData } = lead;
          try {
            await prisma.lead.update({ where: { id }, data: updateData });
            updatedCount++;
          } catch (e) {
            console.error('Update error:', e);
          }
        }

        return res.status(201).json({ 
          message: `${leadsToInsert.length} new leads, ${updatedCount} updated`,
          newCount: leadsToInsert.length,
          updatedCount: updatedCount,
          totalProcessed: leadsToInsert.length + updatedCount
        });
      }

      res.status(400).json({ error: 'Either singleLead, csvData, or mappedData required' });
    } catch (error) {
      console.error('Create leads error:', error);
      res.status(500).json({ error: 'Failed to create leads' });
    }
  } else if (req.method === 'PUT') {
    // Update single lead
    try {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Lead ID required' });
      }

      // Map snake_case to camelCase for Prisma
      const prismaData = {};
      if (updateData.first_name !== undefined) prismaData.firstName = updateData.first_name;
      if (updateData.last_name !== undefined) prismaData.lastName = updateData.last_name;
      if (updateData.full_name !== undefined) prismaData.fullName = updateData.full_name;
      if (updateData.phone !== undefined) prismaData.phone = updateData.phone;
      if (updateData.property_address !== undefined) prismaData.propertyAddress = updateData.property_address;
      if (updateData.city !== undefined) prismaData.city = updateData.city;
      if (updateData.state !== undefined) prismaData.state = updateData.state;
      if (updateData.zip_code !== undefined) prismaData.zipCode = updateData.zip_code;
      if (updateData.mailing_address !== undefined) prismaData.mailingAddress = updateData.mailing_address;
      if (updateData.mailing_city !== undefined) prismaData.mailingCity = updateData.mailing_city;
      if (updateData.mailing_state !== undefined) prismaData.mailingState = updateData.mailing_state;
      if (updateData.mailing_zip !== undefined) prismaData.mailingZip = updateData.mailing_zip;

      const updated = await prisma.lead.update({
        where: { id },
        data: prismaData,
      });

      res.status(200).json({ lead: updated });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({ error: 'Failed to update lead' });
    }
  } else if (req.method === 'DELETE') {
    // Delete single lead
    try {
      const { leadId } = req.body;

      if (!leadId) {
        return res.status(400).json({ error: 'Lead ID required' });
      }

      await prisma.lead.delete({ where: { id: leadId } });

      res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
