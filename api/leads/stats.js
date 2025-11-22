import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: leads, error } = await supabaseAdmin
      .from('user_leads')
      .select('status, action')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const stats = {
      total: leads?.length || 0,
      new: leads?.filter(l => l.status === 'new').length || 0,
      called: leads?.filter(l => l.status === 'called').length || 0,
      followUp: leads?.filter(l => l.status === 'follow_up').length || 0,
      notInterested: leads?.filter(l => l.status === 'not_interested').length || 0,
      callNow: leads?.filter(l => l.action === 'call_now').length || 0,
      pending: leads?.filter(l => l.action === 'pending').length || 0,
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export default requireAuth(handler);
