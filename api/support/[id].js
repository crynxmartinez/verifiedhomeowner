import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';

async function handler(req, res) {
  const { id } = req.query;

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // PATCH - Update ticket status
  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (!status || !['open', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const { data, error } = await supabaseAdmin
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating support ticket:', error);
        return res.status(500).json({ error: 'Failed to update support ticket' });
      }

      return res.status(200).json({ message: 'Ticket updated successfully', ticket: data });
    } catch (error) {
      console.error('Error updating support ticket:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // DELETE - Delete ticket
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('support_tickets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting support ticket:', error);
        return res.status(500).json({ error: 'Failed to delete support ticket' });
      }

      return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
