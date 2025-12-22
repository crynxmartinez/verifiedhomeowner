import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  const userId = req.user.id;

  // GET - List comments for a feature request
  if (req.method === 'GET') {
    try {
      const { featureRequestId } = req.query;

      if (!featureRequestId) {
        return res.status(400).json({ error: 'Feature request ID is required' });
      }

      // Get all top-level comments (no parent) with their replies
      const comments = await prisma.featureComment.findMany({
        where: {
          featureRequestId,
          parentId: null,
        },
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Get total comment count (including replies)
      const totalCount = await prisma.featureComment.count({
        where: { featureRequestId },
      });

      return res.status(200).json({
        comments,
        totalCount,
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // POST - Create a new comment or reply
  if (req.method === 'POST') {
    try {
      const { featureRequestId, content, parentId } = req.body;

      if (!featureRequestId || !content) {
        return res.status(400).json({ error: 'Feature request ID and content are required' });
      }

      if (content.trim().length < 2) {
        return res.status(400).json({ error: 'Comment must be at least 2 characters' });
      }

      if (content.trim().length > 1000) {
        return res.status(400).json({ error: 'Comment must be less than 1000 characters' });
      }

      // Verify feature request exists
      const featureRequest = await prisma.featureRequest.findUnique({
        where: { id: featureRequestId },
      });

      if (!featureRequest) {
        return res.status(404).json({ error: 'Feature request not found' });
      }

      // If parentId provided, verify parent comment exists
      if (parentId) {
        const parentComment = await prisma.featureComment.findUnique({
          where: { id: parentId },
        });

        if (!parentComment) {
          return res.status(404).json({ error: 'Parent comment not found' });
        }

        // Prevent nested replies (only allow 1 level deep)
        if (parentComment.parentId) {
          return res.status(400).json({ error: 'Cannot reply to a reply' });
        }
      }

      const comment = await prisma.featureComment.create({
        data: {
          content: content.trim(),
          userId,
          featureRequestId,
          parentId: parentId || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        message: 'Comment created successfully',
        comment,
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  // DELETE - Delete a comment (owner or admin only)
  if (req.method === 'DELETE') {
    try {
      const { commentId } = req.body;

      if (!commentId) {
        return res.status(400).json({ error: 'Comment ID is required' });
      }

      const comment = await prisma.featureComment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Only owner or admin can delete
      const isAdmin = req.user.role === 'admin';
      if (comment.userId !== userId && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }

      await prisma.featureComment.delete({
        where: { id: commentId },
      });

      return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
