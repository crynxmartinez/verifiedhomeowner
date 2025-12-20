/**
 * Public Blog API
 * 
 * GET - List published blog posts (public access)
 * Query params: page, limit, category
 */

import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = 1, limit = 10, category } = req.query;
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
