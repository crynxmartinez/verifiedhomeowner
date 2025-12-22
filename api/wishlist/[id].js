import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  const { id } = req.query;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!id) {
    return res.status(400).json({ error: 'Feature request ID is required' });
  }

  // GET - Get single feature request
  if (req.method === 'GET') {
    try {
      const featureRequest = await prisma.featureRequest.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!featureRequest) {
        return res.status(404).json({ error: 'Feature request not found' });
      }

      // Check if user has voted
      const vote = await prisma.featureVote.findUnique({
        where: {
          userId_featureRequestId: {
            userId,
            featureRequestId: id,
          },
        },
      });

      return res.status(200).json({
        request: {
          ...featureRequest,
          hasVoted: !!vote,
        },
      });
    } catch (error) {
      console.error('Error fetching feature request:', error);
      return res.status(500).json({ error: 'Failed to fetch feature request' });
    }
  }

  // PATCH - Update feature request status (admin only)
  if (req.method === 'PATCH') {
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      const { status } = req.body;

      const validStatuses = ['open', 'planned', 'in_progress', 'completed', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updated = await prisma.featureRequest.update({
        where: { id },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(200).json({
        message: 'Status updated successfully',
        request: updated,
      });
    } catch (error) {
      console.error('Error updating feature request:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Feature request not found' });
      }
      return res.status(500).json({ error: 'Failed to update feature request' });
    }
  }

  // DELETE - Delete feature request (admin only or owner)
  if (req.method === 'DELETE') {
    try {
      const featureRequest = await prisma.featureRequest.findUnique({
        where: { id },
      });

      if (!featureRequest) {
        return res.status(404).json({ error: 'Feature request not found' });
      }

      // Only admin or the owner can delete
      if (!isAdmin && featureRequest.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this request' });
      }

      await prisma.featureRequest.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Feature request deleted successfully' });
    } catch (error) {
      console.error('Error deleting feature request:', error);
      return res.status(500).json({ error: 'Failed to delete feature request' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
