import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';
import { distributeLeadsToUser } from '../../lib/distributeLeads.js';

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
            follow_up: 0,
            not_interested: 0,
            pending: 0,
          };
        }
        statsByUser[lead.user_id].total++;
        if (statsByUser[lead.user_id][lead.status] !== undefined) {
          statsByUser[lead.user_id][lead.status]++;
        }
      });

      // Combine users with their stats
      const usersWithStats = users.map(user => ({
        ...user,
        lead_count: statsByUser[user.id]?.total || 0,
        stats: {
          new: statsByUser[user.id]?.new || 0,
          follow_up: statsByUser[user.id]?.follow_up || 0,
          not_interested: statsByUser[user.id]?.not_interested || 0,
          pending: statsByUser[user.id]?.pending || 0,
        },
      }));

      res.status(200).json({ users: usersWithStats });
    } catch (error) {
      console.error('Fetch users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'PATCH') {
    // Update user details (plan, name, email, password)
    try {
      const { userId, plan_type, name, email, password } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Build update object
      const updateData = {
        updated_at: new Date().toISOString()
      };

      // Add fields that are being updated
      if (plan_type) updateData.plan_type = plan_type;
      if (name) updateData.name = name;
      if (email) {
        // Check if email is already in use by another user
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .neq('id', userId)
          .single();

        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        updateData.email = email;
      }

      // Update user in database
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update password in Supabase Auth if provided
      if (password) {
        try {
          const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password }
          );
          if (authError) {
            console.error('Failed to update password:', authError);
            // Don't fail the entire update if only password update fails
          }
        } catch (pwdError) {
          console.error('Password update error:', pwdError);
        }
      }

      // Distribute leads immediately when plan is upgraded
      if (plan_type) {
        try {
          await distributeLeadsToUser(userId);
        } catch (distError) {
          console.error('Failed to distribute leads on plan upgrade:', distError);
          // Don't fail the plan update if lead distribution fails
        }
      }

      res.status(200).json({ user: data });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message || 'Failed to update user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
