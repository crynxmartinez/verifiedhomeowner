import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user's leads with full lead details
    const { data: userLeads, error } = await supabaseAdmin
      .from('user_leads')
      .select(`
        *,
        lead:leads(*)
      `)
      .eq('user_id', req.user.id)
      .order('assigned_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ leads: userLeads || [] });
  } catch (error) {
    console.error('Leads fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
}

export default requireAuth(handler);
