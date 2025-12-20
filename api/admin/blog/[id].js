/**
 * Admin Single Blog Post API
 * 
 * GET - Get a single blog post by ID (for editing)
 */

import prisma from '../../../lib/prisma.js';
import { requireAdmin } from '../../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error('Get blog post error:', error);
    return res.status(500).json({ error: 'Failed to fetch blog post' });
  }
}

export default requireAdmin(handler);
