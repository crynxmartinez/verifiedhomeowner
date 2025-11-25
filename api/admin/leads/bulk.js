import { supabaseAdmin } from '../../../lib/supabase.js';
import { requireAdmin } from '../../../lib/auth.js';

async function handler(req, res) {
  if (req.method === 'DELETE') {
    // Bulk delete leads
    try {
      const { leadIds } = req.body;

      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ error: 'Lead IDs array required' });
      }

      const { error } = await supabaseAdmin
        .from('leads')
        .delete()
        .in('id', leadIds);

      if (error) throw error;

      res.status(200).json({ 
        message: `${leadIds.length} lead(s) deleted successfully`,
        count: leadIds.length
      });
    } catch (error) {
      console.error('Bulk delete leads error:', error);
      res.status(500).json({ error: 'Failed to delete leads' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
