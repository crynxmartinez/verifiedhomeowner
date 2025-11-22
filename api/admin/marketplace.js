import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';
import Papa from 'papaparse';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all marketplace leads
    try {
      const { data: leads, error } = await supabaseAdmin
        .from('marketplace_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ leads: leads || [] });
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
        const { data, error } = await supabaseAdmin
          .from('marketplace_leads')
          .insert(singleLead)
          .select()
          .single();

        if (error) throw error;

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
          .filter(row => row.full_name || row.owner_name) // Skip empty rows
          .map(row => ({
            owner_name: row.full_name || row.owner_name || '',
            phone: row.phone || row.number || '',
            property_address: row.address || '',
            city: row.city || '',
            state: row.state || '',
            zip_code: row.zip || row.zip_code || '',
            mailing_address: row.mailing_address || '',
            mailing_city: row.mailing_city || '',
            mailing_state: row.mailing_state || '',
            mailing_zip: row.mailing_zip || '',
            motivation: row.motivation || '',
            timeline: row.timeline || '',
            price: parseFloat(row.price) || 0,
            max_buyers: parseInt(row.max_buyers) || 0,
          }));

        if (leads.length === 0) {
          return res.status(400).json({ error: 'No valid leads found in CSV' });
        }

        const { data, error } = await supabaseAdmin
          .from('marketplace_leads')
          .insert(leads)
          .select();

        if (error) throw error;

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

      const { error } = await supabaseAdmin
        .from('marketplace_leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

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
