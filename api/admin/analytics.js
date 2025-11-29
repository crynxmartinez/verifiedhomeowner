import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get total counts
    const { count: totalWholesalers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'wholesaler');

    const { count: totalLeads } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true });

    const { count: totalAssignments } = await supabaseAdmin
      .from('user_leads')
      .select('*', { count: 'exact', head: true });

    // Get plan distribution
    const { data: planData } = await supabaseAdmin
      .from('users')
      .select('plan_type')
      .eq('role', 'wholesaler');

    const planDistribution = {
      free: planData?.filter(u => u.plan_type === 'free').length || 0,
      basic: planData?.filter(u => u.plan_type === 'basic').length || 0,
      elite: planData?.filter(u => u.plan_type === 'elite').length || 0,
      pro: planData?.filter(u => u.plan_type === 'pro').length || 0,
    };

    // Get status distribution across all assignments
    const { data: statusData } = await supabaseAdmin
      .from('user_leads')
      .select('status, action');

    const statusDistribution = {
      new: statusData?.filter(l => l.status === 'new').length || 0,
      follow_up: statusData?.filter(l => l.status === 'follow_up').length || 0,
      not_interested: statusData?.filter(l => l.status === 'not_interested').length || 0,
    };

    const actionDistribution = {
      call_now: statusData?.filter(l => l.action === 'call_now').length || 0,
      pending: statusData?.filter(l => l.action === 'pending').length || 0,
    };

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newWholesalersLast30Days } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'wholesaler')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: newLeadsLast30Days } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    res.status(200).json({
      analytics: {
        overview: {
          totalWholesalers: totalWholesalers || 0,
          totalLeads: totalLeads || 0,
          totalAssignments: totalAssignments || 0,
          averageLeadsPerWholesaler: totalWholesalers > 0 
            ? Math.round((totalAssignments || 0) / totalWholesalers) 
            : 0,
        },
        planDistribution,
        statusDistribution,
        actionDistribution,
        recentActivity: {
          newWholesalersLast30Days: newWholesalersLast30Days || 0,
          newLeadsLast30Days: newLeadsLast30Days || 0,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

export default requireAdmin(handler);
