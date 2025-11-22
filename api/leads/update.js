import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status, action, notes, follow_up_date } = req.body;

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (action) updateData.action = action;
    if (notes !== undefined) updateData.notes = notes;
    if (follow_up_date) updateData.follow_up_date = follow_up_date;
    
    if (status === 'called') {
      updateData.last_called_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('user_leads')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ lead: data });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
}

export default requireAuth(handler);
