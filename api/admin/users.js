import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all wholesalers
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('role', 'wholesaler')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Get aggregated stats for all users in one query
      const { data: leadStats, error: statsError } = await supabaseAdmin
        .from('user_leads')
        .select('user_id, status');

      if (statsError) throw statsError;

      // Group stats by user
      const statsByUser = {};
      leadStats?.forEach(lead => {
        if (!statsByUser[lead.user_id]) {
          statsByUser[lead.user_id] = {
            total: 0,
            new: 0,
            called: 0,
            follow_up: 0,
            not_interested: 0,
          };
        }
        statsByUser[lead.user_id].total++;
        statsByUser[lead.user_id][lead.status]++;
      });

      // Combine users with their stats
      const usersWithStats = users.map(user => ({
        ...user,
        lead_count: statsByUser[user.id]?.total || 0,
        stats: {
          new: statsByUser[user.id]?.new || 0,
          called: statsByUser[user.id]?.called || 0,
          follow_up: statsByUser[user.id]?.follow_up || 0,
          not_interested: statsByUser[user.id]?.not_interested || 0,
        },
      }));

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
