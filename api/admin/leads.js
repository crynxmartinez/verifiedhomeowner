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
        
        const processedLead = {
          ...singleLead,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          owner_name: ownerName,
        };
        
        // Check for duplicate by property_address
        const { data: existing } = await supabaseAdmin
          .from('leads')
          .select('*')
          .eq('property_address', processedLead.property_address)
          .single();

        if (existing) {
          // Update existing lead
          const { data, error } = await supabaseAdmin
            .from('leads')
            .update({
              ...processedLead,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw error;

          return res.status(200).json({ lead: data, updated: true });
        }

        // Create new lead
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
            ...processedLead,
            sequence_number: nextSequence,
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json({ lead: data, updated: false });
      }

      if (mappedData) {
        // Handle mapped CSV data from frontend
        // Get existing leads for duplicate check
        const { data: existingLeads } = await supabaseAdmin
          .from('leads')
          .select('id, property_address, sequence_number');

        const existingAddresses = new Map(
          existingLeads?.map(l => [l.property_address?.toLowerCase(), l]) || []
        );

        // Get next sequence number
        const { data: maxLead } = await supabaseAdmin
          .from('leads')
          .select('sequence_number')
          .order('sequence_number', { ascending: false })
          .limit(1)
          .single();

        let nextSequence = (maxLead?.sequence_number || 0) + 1;

        const leadsToInsert = [];
        const leadsToUpdate = [];
        let updatedCount = 0;

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

          const leadData = {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            owner_name: ownerName, // Backward compatibility
            phone: row.phone || '',
            property_address: row.property_address || '',
            city: row.city || '',
            state: row.state || '',
            zip_code: row.zip_code || '',
            mailing_address: row.mailing_address || '',
            mailing_city: row.mailing_city || '',
            mailing_state: row.mailing_state || '',
            mailing_zip: row.mailing_zip || '',
          };

          // Check for duplicates by property address
          const existing = existingAddresses.get(leadData.property_address?.toLowerCase());
          if (existing && leadData.property_address) {
            // Update existing
            leadsToUpdate.push({
              ...leadData,
              id: existing.id,
            });
          } else {
            // Insert new
            leadsToInsert.push({
              ...leadData,
              sequence_number: nextSequence++,
            });
          }
        });

        // Insert new leads
        if (leadsToInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('leads')
            .insert(leadsToInsert);

          if (insertError) throw insertError;
        }

        // Update existing leads
        for (const lead of leadsToUpdate) {
          const { id, ...updateData } = lead;
          const { error: updateError } = await supabaseAdmin
            .from('leads')
            .update(updateData)
            .eq('id', id);

          if (!updateError) updatedCount++;
        }

        return res.status(201).json({ 
          message: `${leadsToInsert.length} new leads uploaded, ${updatedCount} existing leads updated`,
          newCount: leadsToInsert.length,
          updatedCount: updatedCount,
          totalProcessed: leadsToInsert.length + updatedCount
        });
      }

      if (csvData) {
        // Parse CSV
        const parsed = Papa.parse(csvData, { header: true });
        
        if (parsed.errors.length > 0) {
          return res.status(400).json({ error: 'Invalid CSV format' });
        }

        // Get existing leads for duplicate check
        const { data: existingLeads } = await supabaseAdmin
          .from('leads')
          .select('id, property_address, sequence_number');

        const existingAddresses = new Map(
          existingLeads?.map(l => [l.property_address, l]) || []
        );

        // Get next sequence number
        const { data: maxLead } = await supabaseAdmin
          .from('leads')
          .select('sequence_number')
          .order('sequence_number', { ascending: false })
          .limit(1)
          .single();

        let nextSequence = (maxLead?.sequence_number || 0) + 1;

        const leadsToInsert = [];
        const leadsToUpdate = [];
        let updatedCount = 0;

        // Process each row
        parsed.data
          .filter(row => row.full_name || row.owner_name) // Skip empty rows
          .forEach(row => {
            const leadData = {
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
            };

            const existing = existingAddresses.get(leadData.property_address);
            if (existing) {
              // Update existing
              leadsToUpdate.push({
                ...leadData,
                id: existing.id,
              });
            } else {
              // Insert new
              leadsToInsert.push({
                ...leadData,
                sequence_number: nextSequence++,
              });
            }
          });

        // Insert new leads
        if (leadsToInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin
            .from('leads')
            .insert(leadsToInsert);

          if (insertError) throw insertError;
        }

        // Update existing leads
        for (const lead of leadsToUpdate) {
          const { id, ...updateData } = lead;
          const { error: updateError } = await supabaseAdmin
            .from('leads')
            .update(updateData)
            .eq('id', id);

          if (!updateError) updatedCount++;
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
  } else if (req.method === 'DELETE') {
    // Delete single lead
    try {
      const { leadId } = req.body;

      if (!leadId) {
        return res.status(400).json({ error: 'Lead ID required' });
      }

      const { error } = await supabaseAdmin
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

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
