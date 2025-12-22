import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  const userId = req.user.id;

  // GET - List all feature requests
  if (req.method === 'GET') {
    try {
      const { sort = 'top', status, page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where = {};
      if (status) {
        where.status = status;
      }

      // Determine sort order
      const orderBy = sort === 'new' 
        ? { createdAt: 'desc' } 
        : { voteCount: 'desc' };

      // Get total count
      const total = await prisma.featureRequest.count({ where });

      // Get feature requests
      const requests = await prisma.featureRequest.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Get user's votes to determine which ones they've voted for
      const userVotes = await prisma.featureVote.findMany({
        where: {
          userId,
          featureRequestId: {
            in: requests.map(r => r.id),
          },
        },
        select: {
          featureRequestId: true,
        },
      });

      const votedIds = new Set(userVotes.map(v => v.featureRequestId));

      // Add hasVoted flag to each request
      const requestsWithVoteStatus = requests.map(request => ({
        ...request,
        hasVoted: votedIds.has(request.id),
      }));

      return res.status(200).json({
        requests: requestsWithVoteStatus,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      return res.status(500).json({ error: 'Failed to fetch feature requests' });
    }
  }

  // POST - Create a new feature request
  if (req.method === 'POST') {
    try {
      const { title, description } = req.body;

      // Validation
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      if (title.length < 5 || title.length > 200) {
        return res.status(400).json({ error: 'Title must be between 5 and 200 characters' });
      }

      if (description.length < 20 || description.length > 2000) {
        return res.status(400).json({ error: 'Description must be between 20 and 2000 characters' });
      }

      // Create the feature request
      const featureRequest = await prisma.featureRequest.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          userId,
          status: 'open',
          voteCount: 1, // Creator automatically votes for their own request
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create the creator's vote
      await prisma.featureVote.create({
        data: {
          userId,
          featureRequestId: featureRequest.id,
        },
      });

      return res.status(201).json({
        message: 'Feature request created successfully',
        request: {
          ...featureRequest,
          hasVoted: true,
        },
      });
    } catch (error) {
      console.error('Error creating feature request:', error);
      return res.status(500).json({ error: 'Failed to create feature request' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
