import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.id;

  try {
    const { eventType, eventData, pagePath } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    // Valid event types
    const validEventTypes = [
      'login',
      'page_view',
      'lead_view',
      'lead_action',
      'marketplace_view',
      'marketplace_purchase',
      'wishlist_vote',
      'wishlist_comment',
      'wishlist_submit',
      'profile_update',
      'state_preference_update',
      'support_ticket',
      'plan_upgrade',
      'plan_downgrade',
    ];

    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Create activity record
    const activity = await prisma.userActivity.create({
      data: {
        userId,
        eventType,
        eventData: eventData || null,
        pagePath: pagePath || null,
      },
    });

    // Update lastLoginAt if this is a login event
    if (eventType === 'login') {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });
    }

    return res.status(201).json({ success: true, activityId: activity.id });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return res.status(500).json({ error: 'Failed to track activity' });
  }
}

export default requireAuth(handler);
