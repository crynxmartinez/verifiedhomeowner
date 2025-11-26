import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let subscriptionLeads = [];
    let marketplaceLeads = [];

    // Get user's subscription leads
    try {
      const { data, error: subError } = await supabaseAdmin
        .from('user_leads')
        .select(`
          *,
          lead:leads(*)
        `)
        .eq('user_id', req.user.id)
        .order('assigned_at', { ascending: false });

      if (subError) {
        console.error('Subscription leads query error:', subError);
        throw subError;
      }
      subscriptionLeads = data || [];
    } catch (subErr) {
      console.error('Failed to fetch subscription leads:', subErr);
      // Continue with empty subscription leads instead of failing completely
      subscriptionLeads = [];
    }

    // Get user's purchased marketplace leads
    try {
      const { data, error: mktError } = await supabaseAdmin
        .from('user_marketplace_leads')
        .select(`
          *,
          lead:marketplace_leads(*)
        `)
        .eq('user_id', req.user.id)
        .order('purchased_at', { ascending: false });

      if (mktError) {
        console.error('Marketplace leads query error:', mktError);
        throw mktError;
      }
      marketplaceLeads = data || [];
    } catch (mktErr) {
      console.error('Failed to fetch marketplace leads:', mktErr);
      // Continue with empty marketplace leads instead of failing completely
      marketplaceLeads = [];
    }

    // Format subscription leads
    const formattedSubLeads = (subscriptionLeads || []).map(ul => {
      // Handle case where lead might be null or missing
      if (!ul.lead) {
        console.warn(`Lead data missing for user_lead ${ul.id}`);
        return null;
      }
      
      return {
        ...ul,
        source: 'subscription',
        lead: {
          ...ul.lead,
          motivation: ul.motivation || null,
          // Ensure backward compatibility with old schema
          full_name: ul.lead.full_name || ul.lead.owner_name || '',
          first_name: ul.lead.first_name || '',
          last_name: ul.lead.last_name || '',
          is_business: ul.lead.is_business || false,
        }
      };
    }).filter(Boolean); // Remove null entries

    // Format marketplace leads
    const formattedMktLeads = (marketplaceLeads || []).map(uml => ({
      id: uml.id,
      user_id: uml.user_id,
      lead_id: uml.marketplace_lead_id,
      status: uml.status,
      action: uml.action,
      assigned_at: uml.purchased_at,
      last_called_at: uml.last_called_at,
      follow_up_date: uml.follow_up_date,
      countdown_days: uml.countdown_days,
      notes: uml.notes,
      created_at: uml.created_at,
      updated_at: uml.updated_at,
      source: 'purchased',
      price_paid: uml.price_paid,
      lead: {
        ...uml.lead,
        id: uml.marketplace_lead_id,
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
