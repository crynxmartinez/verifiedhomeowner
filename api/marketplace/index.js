import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  const userId = req.user.id;

  if (req.method === 'GET') {
    // Get available marketplace leads (excluding already purchased by this user)
    try {
      const { motivation, timeline, state } = req.query;

      // Get leads already purchased by this user
      const { data: purchased } = await supabaseAdmin
        .from('user_marketplace_leads')
        .select('marketplace_lead_id')
        .eq('user_id', userId);

      const purchasedIds = purchased?.map(p => p.marketplace_lead_id) || [];

      // Build query
      let query = supabaseAdmin
        .from('marketplace_leads')
        .select('*');

      // Filter out already purchased
      if (purchasedIds.length > 0) {
        query = query.not('id', 'in', `(${purchasedIds.join(',')})`);
      }

      // Apply filters
      if (motivation) {
        query = query.eq('motivation', motivation);
      }
      if (timeline) {
        query = query.eq('timeline', timeline);
      }
      if (state) {
        query = query.eq('state', state);
      }

      query = query.order('created_at', { ascending: false });

      const { data: leads, error } = await query;

      if (error) throw error;

      // Filter out leads that reached max_buyers (do it in JS to avoid complex query issues)
      const availableLeads = (leads || []).filter(lead => {
        if (lead.max_buyers === 0) return true; // unlimited
        return lead.times_sold < lead.max_buyers;
      });

      res.status(200).json({ leads: availableLeads });
    } catch (error) {
      console.error('Fetch marketplace leads error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      res.status(500).json({ 
        error: 'Failed to fetch marketplace leads',
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
