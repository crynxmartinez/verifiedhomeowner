import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.id;
  const { leadId } = req.body;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID required' });
  }

  try {
    // Get the marketplace lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('marketplace_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check if user already purchased this lead
    const { data: existing } = await supabaseAdmin
      .from('user_marketplace_leads')
      .select('id')
      .eq('user_id', userId)
      .eq('marketplace_lead_id', leadId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'You already purchased this lead' });
    }

    // Check if max_buyers reached
    if (lead.max_buyers > 0 && lead.times_sold >= lead.max_buyers) {
      return res.status(400).json({ error: 'This lead is no longer available' });
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('user_marketplace_leads')
      .insert({
        user_id: userId,
        marketplace_lead_id: leadId,
        price_paid: lead.price,
        status: 'new',
        action: 'call_now',
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Increment times_sold
    await supabaseAdmin
      .from('marketplace_leads')
      .update({ times_sold: lead.times_sold + 1 })
      .eq('id', leadId);

    res.status(201).json({ 
      message: 'Lead purchased successfully',
      purchase 
    });
  } catch (error) {
    console.error('Purchase lead error:', error);
    res.status(500).json({ error: 'Failed to purchase lead' });
  }
}

export default requireAuth(handler);
