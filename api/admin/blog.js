/**
 * Admin Blog Management API
 * 
 * GET - List all blog posts (including drafts and scheduled)
 * POST - Create new blog post
 * PATCH - Update blog post
 * DELETE - Delete blog post
 */

import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  const { method } = req;

  // GET - List all blog posts
  if (method === 'GET') {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get posts and total count
      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.blogPost.count({ where }),
      ]);

      // Get stats
      const stats = await prisma.blogPost.groupBy({
        by: ['status'],
        _count: { status: true },
      });

      const statusCounts = {
        all: total,
        draft: 0,
        scheduled: 0,
        published: 0,
      };

      stats.forEach(s => {
        statusCounts[s.status] = s._count.status;
      });

      return res.status(200).json({
        posts,
        stats: statusCounts,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    } catch (error) {
      console.error('Admin blog list error:', error);
      return res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  }

  // POST - Create new blog post
  if (method === 'POST') {
    try {
      const { title, excerpt, content, bannerImage, category, tags, status, scheduledAt } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      // Generate slug from title
      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if slug exists, append number if needed
      const existingSlug = await prisma.blogPost.findUnique({ where: { slug } });
      if (existingSlug) {
        const count = await prisma.blogPost.count({
          where: { slug: { startsWith: slug } },
        });
        slug = `${slug}-${count + 1}`;
      }

      // Determine status and dates
      let finalStatus = status || 'draft';
      let publishedAt = null;
      let finalScheduledAt = null;

      if (finalStatus === 'published') {
        publishedAt = new Date();
      } else if (finalStatus === 'scheduled' && scheduledAt) {
        finalScheduledAt = new Date(scheduledAt);
        // Validate scheduled date is in the future
        if (finalScheduledAt <= new Date()) {
          return res.status(400).json({ error: 'Scheduled date must be in the future' });
        }
      }

      const post = await prisma.blogPost.create({
        data: {
          slug,
          title,
          excerpt: excerpt || null,
          content,
          bannerImage: bannerImage || null,
          category: category || null,
          tags: tags || [],
          status: finalStatus,
          authorId: req.user.id,
          scheduledAt: finalScheduledAt,
          publishedAt,
        },
      });

      return res.status(201).json({ post, message: 'Blog post created successfully' });
    } catch (error) {
      console.error('Create blog post error:', error);
      return res.status(500).json({ error: 'Failed to create blog post' });
    }
  }

  // PATCH - Update blog post
  if (method === 'PATCH') {
    try {
      const { id, title, excerpt, content, bannerImage, category, tags, status, scheduledAt } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Post ID is required' });
      }

      // Find existing post
      const existingPost = await prisma.blogPost.findUnique({ where: { id } });
      if (!existingPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // Build update data
      const updateData = {};

      if (title !== undefined) {
        updateData.title = title;
        // Update slug if title changed
        if (title !== existingPost.title) {
          let newSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          
          const existingSlug = await prisma.blogPost.findFirst({
            where: { slug: newSlug, id: { not: id } },
          });
          if (existingSlug) {
            const count = await prisma.blogPost.count({
              where: { slug: { startsWith: newSlug }, id: { not: id } },
            });
            newSlug = `${newSlug}-${count + 1}`;
          }
          updateData.slug = newSlug;
        }
      }

      if (excerpt !== undefined) updateData.excerpt = excerpt || null;
      if (content !== undefined) updateData.content = content;
      if (bannerImage !== undefined) updateData.bannerImage = bannerImage || null;
      if (category !== undefined) updateData.category = category || null;
      if (tags !== undefined) updateData.tags = tags;

      // Handle status changes
      if (status !== undefined && status !== existingPost.status) {
        updateData.status = status;

        if (status === 'published') {
          // Publishing now
          updateData.publishedAt = existingPost.publishedAt || new Date();
          updateData.scheduledAt = null;
        } else if (status === 'scheduled') {
          // Scheduling
          if (!scheduledAt) {
            return res.status(400).json({ error: 'Scheduled date is required' });
          }
          const scheduleDate = new Date(scheduledAt);
          if (scheduleDate <= new Date()) {
            return res.status(400).json({ error: 'Scheduled date must be in the future' });
          }
          updateData.scheduledAt = scheduleDate;
          updateData.publishedAt = null;
        } else if (status === 'draft') {
          // Back to draft
          updateData.scheduledAt = null;
          // Keep publishedAt if it was previously published (for reference)
        }
      } else if (scheduledAt !== undefined && existingPost.status === 'scheduled') {
        // Update scheduled time
        const scheduleDate = new Date(scheduledAt);
        if (scheduleDate <= new Date()) {
          return res.status(400).json({ error: 'Scheduled date must be in the future' });
        }
        updateData.scheduledAt = scheduleDate;
      }

      const post = await prisma.blogPost.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({ post, message: 'Blog post updated successfully' });
    } catch (error) {
      console.error('Update blog post error:', error);
      return res.status(500).json({ error: 'Failed to update blog post' });
    }
  }

  // DELETE - Delete blog post
  if (method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Post ID is required' });
      }

      await prisma.blogPost.delete({ where: { id } });

      return res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Delete blog post error:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      return res.status(500).json({ error: 'Failed to delete blog post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);
