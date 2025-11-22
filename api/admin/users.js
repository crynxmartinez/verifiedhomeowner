import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all wholesalers with their lead counts and status breakdown
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          user_leads(
            id,
            status,
            action
          )
        `)
        .eq('role', 'wholesaler')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats for each user
      const usersWithStats = users.map(user => {
        const leads = user.user_leads || [];
        return {
          ...user,
          lead_count: leads.length,
          stats: {
            new: leads.filter(l => l.status === 'new').length,
            called: leads.filter(l => l.status === 'called').length,
            follow_up: leads.filter(l => l.status === 'follow_up').length,
            not_interested: leads.filter(l => l.status === 'not_interested').length,
          },
          user_leads: undefined, // Remove the raw data
        };
      });

      res.status(200).json({ users: usersWithStats });
    } catch (error) {
      console.error('Fetch users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'PATCH') {
    // Update user plan
    try {
      const { userId, plan_type } = req.body;

      if (!userId || !plan_type) {
        return res.status(400).json({ error: 'User ID and plan type required' });
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ plan_type, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ user: data });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
