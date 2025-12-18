import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';
import Papa from 'papaparse';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all marketplace leads
    try {
      const leads = await prisma.marketplaceLead.findMany({
        orderBy: { createdAt: 'desc' }
      });

      // Format for frontend
      const formattedLeads = leads.map(lead => ({
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
      res.status(500).json({ error: 'Failed to fetch marketplace leads' });
    }
  } else if (req.method === 'POST') {
    // Create single marketplace lead or upload CSV
    try {
      const { csvData, singleLead } = req.body;

      if (singleLead) {
        // Create single marketplace lead
        const data = await prisma.marketplaceLead.create({
          data: {
            ownerName: singleLead.owner_name,
            phone: singleLead.phone,
            propertyAddress: singleLead.property_address,
            city: singleLead.city,
            state: singleLead.state,
            zipCode: singleLead.zip_code,
            mailingAddress: singleLead.mailing_address,
            mailingCity: singleLead.mailing_city,
            mailingState: singleLead.mailing_state,
            mailingZip: singleLead.mailing_zip,
            motivation: singleLead.motivation,
            timeline: singleLead.timeline,
            price: parseFloat(singleLead.price) || 0,
            maxBuyers: parseInt(singleLead.max_buyers) || 0,
          }
        });

        return res.status(201).json({ lead: data });
      }

      if (csvData) {
        // Parse CSV
        const parsed = Papa.parse(csvData, { header: true });
        
        if (parsed.errors.length > 0) {
          return res.status(400).json({ error: 'Invalid CSV format' });
        }

        // Map CSV data to marketplace lead objects
        const leads = parsed.data
          .filter(row => row.full_name || row.owner_name)
          .map(row => ({
            ownerName: row.full_name || row.owner_name || '',
            phone: row.phone || row.number || '',
            propertyAddress: row.address || '',
            city: row.city || '',
            state: row.state || '',
            zipCode: row.zip || row.zip_code || '',
            mailingAddress: row.mailing_address || '',
            mailingCity: row.mailing_city || '',
            mailingState: row.mailing_state || '',
            mailingZip: row.mailing_zip || '',
            motivation: row.motivation || '',
            timeline: row.timeline || '',
            price: parseFloat(row.price) || 0,
            maxBuyers: parseInt(row.max_buyers) || 0,
          }));

        if (leads.length === 0) {
          return res.status(400).json({ error: 'No valid leads found in CSV' });
        }

        await prisma.marketplaceLead.createMany({ data: leads });

        return res.status(201).json({ 
          message: `${leads.length} marketplace leads uploaded successfully`,
          count: leads.length 
        });
      }

      res.status(400).json({ error: 'Either singleLead or csvData required' });
    } catch (error) {
      console.error('Create marketplace leads error:', error);
      res.status(500).json({ error: 'Failed to create marketplace leads' });
    }
  } else if (req.method === 'DELETE') {
    // Delete marketplace lead
    try {
      const { leadId } = req.body;

      if (!leadId) {
        return res.status(400).json({ error: 'Lead ID required' });
      }

      await prisma.marketplaceLead.delete({ where: { id: leadId } });

      res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Delete marketplace lead error:', error);
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
