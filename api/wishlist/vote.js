import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.id;

  try {
    const { featureRequestId } = req.body;

    if (!featureRequestId) {
      return res.status(400).json({ error: 'Feature request ID is required' });
    }

    // Check if the feature request exists
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id: featureRequestId },
    });

    if (!featureRequest) {
      return res.status(404).json({ error: 'Feature request not found' });
    }

    // Check if user already voted
    const existingVote = await prisma.featureVote.findUnique({
      where: {
        userId_featureRequestId: {
          userId,
          featureRequestId,
        },
      },
    });

    if (existingVote) {
      // Remove vote and decrement count
      await prisma.$transaction([
        prisma.featureVote.delete({
          where: { id: existingVote.id },
        }),
        prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);

      // Get updated vote count
      const updated = await prisma.featureRequest.findUnique({
        where: { id: featureRequestId },
        select: { voteCount: true },
      });

      return res.status(200).json({
        voted: false,
        voteCount: updated.voteCount,
        message: 'Vote removed',
      });
    } else {
      // Add vote and increment count
      await prisma.$transaction([
        prisma.featureVote.create({
          data: {
            userId,
            featureRequestId,
          },
        }),
        prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);

      // Get updated vote count
      const updated = await prisma.featureRequest.findUnique({
        where: { id: featureRequestId },
        select: { voteCount: true },
      });

      return res.status(200).json({
        voted: true,
        voteCount: updated.voteCount,
        message: 'Vote added',
      });
    }
  } catch (error) {
    console.error('Error toggling vote:', error);
    return res.status(500).json({ error: 'Failed to toggle vote' });
  }
}

export default requireAuth(handler);
