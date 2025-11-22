import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user's subscription leads
    const { data: subscriptionLeads, error: subError } = await supabaseAdmin
      .from('user_leads')
      .select(`
        *,
        lead:leads(*)
      `)
      .eq('user_id', req.user.id)
      .order('assigned_at', { ascending: false });

    if (subError) throw subError;

    // Get user's purchased marketplace leads
    const { data: marketplaceLeads, error: mktError } = await supabaseAdmin
      .from('user_marketplace_leads')
      .select(`
        *,
        lead:marketplace_leads(*)
      `)
      .eq('user_id', req.user.id)
      .order('purchased_at', { ascending: false });

    if (mktError) throw mktError;

    // Format subscription leads
    const formattedSubLeads = (subscriptionLeads || []).map(ul => ({
      ...ul,
      source: 'subscription',
      lead: {
        ...ul.lead,
        motivation: ul.motivation || null,
      }
    }));

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
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
}

export default requireAuth(handler);
