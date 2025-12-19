import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Calculate today's start (midnight UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Use parallel database queries for better performance
    const [
      total,
      statusCounts,
      actionCounts,
      newToday
    ] = await Promise.all([
      // Total count
      prisma.userLead.count({
        where: { userId: req.user.id }
      }),
      // Group by status
      prisma.userLead.groupBy({
        by: ['status'],
        where: { userId: req.user.id },
        _count: { status: true }
      }),
      // Group by action
      prisma.userLead.groupBy({
        by: ['action'],
        where: { userId: req.user.id },
        _count: { action: true }
      }),
      // New today count
      prisma.userLead.count({
        where: {
          userId: req.user.id,
          createdAt: { gte: todayStart }
        }
      })
    ]);

    // Convert groupBy results to object
    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s.status] = s._count.status; });
    
    const actionMap = {};
    actionCounts.forEach(a => { actionMap[a.action] = a._count.action; });

    const stats = {
      total,
      new: statusMap['new'] || 0,
      followUp: statusMap['follow_up'] || 0,
      notInterested: statusMap['not_interested'] || 0,
      callNow: actionMap['call_now'] || 0,
      pending: actionMap['pending'] || 0,
      newToday,
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export default requireAuth(handler);
