/**
 * Single Blog Post API
 * 
 * GET - Get a single published blog post by slug (public access)
 * Also increments view count
 */

import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Blog API request - query:', JSON.stringify(req.query));
    const { slug } = req.query;
    console.log('Blog API - extracted slug:', slug);

    if (!slug) {
      console.log('Blog API - slug is empty/undefined');
      return res.status(400).json({ error: 'Slug is required' });
    }

    // Find the post by slug
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Only show published posts to public
    if (post.status !== 'published') {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count (fire and forget)
    prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(err => console.error('Failed to increment view count:', err));

    // Get related posts (same category, excluding current)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        category: post.category,
        id: { not: post.id },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        bannerImage: true,
        category: true,
        publishedAt: true,
      },
    });

    return res.status(200).json({
      post,
      relatedPosts,
    });
  } catch (error) {
    console.error('Blog post error:', error);
    return res.status(500).json({ error: 'Failed to fetch blog post' });
  }
}
