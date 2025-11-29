import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, source } = req.query;
    const { status, action, notes, follow_up_date, countdown_days } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Lead ID is required' });
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (action) updateData.action = action;
    if (notes !== undefined) updateData.notes = notes;
    if (follow_up_date) updateData.follow_up_date = follow_up_date;
    if (countdown_days !== undefined) {
      updateData.countdown_days = parseInt(countdown_days) || null;
    }

    // Determine which table to update
    const table = source === 'purchased' ? 'user_marketplace_leads' : 'user_leads';

    const { data, error } = await supabaseAdmin
      .from(table)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.status(200).json({ lead: data });
  } catch (error) {
    console.error('Update lead error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({ 
      error: 'Failed to update lead',
      details: error.message 
    });
  }
}

export default requireAuth(handler);
