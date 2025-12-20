/**
 * Public Blog API
 * 
 * GET - List published blog posts (public access)
 * Query params: page, limit, category, slug (for single post)
 */

import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = 1, limit = 10, category, slug } = req.query;

    // If slug is provided, return single post
    if (slug) {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      if (post.status !== 'published') {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // Increment view count (fire and forget)
      prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      }).catch(err => console.error('Failed to increment view count:', err));

      // Get related posts
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

      return res.status(200).json({ post, relatedPosts });
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause - only published posts
    const where = {
      status: 'published',
    };

    if (category) {
      where.category = category;
    }

    // Get posts and total count
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          bannerImage: true,
          category: true,
          tags: true,
          publishedAt: true,
          viewCount: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    // Get unique categories for filtering
    const categories = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { category: true },
      distinct: ['category'],
    });

    const uniqueCategories = categories
      .map(c => c.category)
      .filter(Boolean);

    return res.status(200).json({
      posts,
      categories: uniqueCategories,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Blog list error:', error);
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
}
