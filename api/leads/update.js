import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, source } = req.query;
    const { status, action, notes, follow_up_date, countdown_days, tags } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Lead ID is required' });
    }

    const updateData = {};

    if (status) updateData.status = status;
    if (action) updateData.action = action;
    if (notes !== undefined) updateData.notes = notes;
    if (follow_up_date) updateData.followUpDate = new Date(follow_up_date);
    if (countdown_days !== undefined) {
      updateData.countdownDays = parseInt(countdown_days) || null;
    }
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : [];
    }

    let data;

    if (source === 'purchased') {
      // Update marketplace lead
      data = await prisma.userMarketplaceLead.update({
        where: {
          id: id,
          userId: req.user.id
        },
        data: updateData
      });
    } else {
      // Update subscription lead
      data = await prisma.userLead.update({
        where: {
          id: id,
          userId: req.user.id
        },
        data: updateData
      });
    }

    res.status(200).json({ lead: data });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ 
      error: 'Failed to update lead',
      details: error.message 
    });
  }
}

export default requireAuth(handler);
