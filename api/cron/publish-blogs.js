/**
 * Blog Publishing Cron Job
 * 
 * Runs hourly to publish scheduled blog posts
 * Checks for posts with status='scheduled' and scheduledAt <= now
 */

import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();

    // Find all scheduled posts that should be published
    const postsToPublish = await prisma.blogPost.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
    });

    if (postsToPublish.length === 0) {
      return res.status(200).json({
        message: 'No posts to publish',
        published: 0,
      });
    }

    // Publish each post
    const publishedIds = [];
    for (const post of postsToPublish) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          status: 'published',
          publishedAt: now,
          scheduledAt: null,
        },
      });
      publishedIds.push(post.id);
      console.log(`Published blog post: ${post.title} (${post.id})`);
    }

    return res.status(200).json({
      message: `Published ${publishedIds.length} blog post(s)`,
      published: publishedIds.length,
      postIds: publishedIds,
    });
  } catch (error) {
    console.error('Blog publishing cron error:', error);
    return res.status(500).json({ error: 'Failed to publish scheduled posts' });
  }
}
