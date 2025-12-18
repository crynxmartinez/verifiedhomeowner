import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';
import { distributeLeadsToUser } from '../../lib/distributeLeads-prisma.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all wholesalers
      const users = await prisma.user.findMany({
        where: { role: 'wholesaler' },
        orderBy: { createdAt: 'desc' }
      });

      // Get aggregated stats for all users in one query
      const leadStats = await prisma.userLead.findMany({
        select: { userId: true, status: true }
      });

      // Group stats by user
      const statsByUser = {};
      leadStats?.forEach(lead => {
        if (!statsByUser[lead.userId]) {
          statsByUser[lead.userId] = {
            total: 0,
            new: 0,
            follow_up: 0,
            not_interested: 0,
            pending: 0,
          };
        }
        statsByUser[lead.userId].total++;
        if (statsByUser[lead.userId][lead.status] !== undefined) {
          statsByUser[lead.userId][lead.status]++;
        }
      });

      // Combine users with their stats (remove password)
      const usersWithStats = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          lead_count: statsByUser[user.id]?.total || 0,
          stats: {
            new: statsByUser[user.id]?.new || 0,
            follow_up: statsByUser[user.id]?.follow_up || 0,
            not_interested: statsByUser[user.id]?.not_interested || 0,
            pending: statsByUser[user.id]?.pending || 0,
          },
        };
      });

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
      const updateData = {};

      // Add fields that are being updated
      if (plan_type) updateData.planType = plan_type;
      if (name) updateData.name = name;
      if (email) {
        // Check if email is already in use by another user
        const existingUser = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase(),
            NOT: { id: userId }
          }
        });

        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        updateData.email = email.toLowerCase();
      }

      // Update password if provided
      if (password) {
        const { hashPassword } = await import('../../lib/auth-prisma.js');
        updateData.password = await hashPassword(password);
      }

      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Distribute leads immediately when plan is upgraded
      if (plan_type) {
        try {
          await distributeLeadsToUser(userId);
        } catch (distError) {
          console.error('Failed to distribute leads on plan upgrade:', distError);
        }
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message || 'Failed to update user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
