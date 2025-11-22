import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';
import Papa from 'papaparse';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all leads
    try {
      const { data: leads, error } = await supabaseAdmin
        .from('leads')
        .select('*')
        .order('sequence_number', { ascending: true });

      if (error) throw error;

      res.status(200).json({ leads: leads || [] });
    } catch (error) {
      console.error('Fetch leads error:', error);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  } else if (req.method === 'POST') {
    // Create single lead or upload CSV
    try {
      const { csvData, singleLead } = req.body;

      if (singleLead) {
        // Create single lead
        const { data: maxLead } = await supabaseAdmin
          .from('leads')
          .select('sequence_number')
          .order('sequence_number', { ascending: false })
          .limit(1)
          .single();

        const nextSequence = (maxLead?.sequence_number || 0) + 1;

        const { data, error } = await supabaseAdmin
          .from('leads')
          .insert({
            ...singleLead,
            sequence_number: nextSequence,
          })
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

        // Get next sequence number
        const { data: maxLead } = await supabaseAdmin
          .from('leads')
          .select('sequence_number')
          .order('sequence_number', { ascending: false })
          .limit(1)
          .single();

        let nextSequence = (maxLead?.sequence_number || 0) + 1;

        // Map CSV data to lead objects
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
            sequence_number: nextSequence++,
          }));

        if (leads.length === 0) {
          return res.status(400).json({ error: 'No valid leads found in CSV' });
        }

        const { data, error } = await supabaseAdmin
          .from('leads')
          .insert(leads)
          .select();

        if (error) throw error;

        return res.status(201).json({ 
          message: `${data.length} leads uploaded successfully`,
          leads: data 
        });
      }

      res.status(400).json({ error: 'Either singleLead or csvData required' });
    } catch (error) {
      console.error('Create leads error:', error);
      res.status(500).json({ error: 'Failed to create leads' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
