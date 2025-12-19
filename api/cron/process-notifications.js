import prisma from '../../lib/prisma.js';
import { Resend } from 'resend';
import { getMarketplaceLeadEmailTemplate } from '../../lib/emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// This endpoint processes queued marketplace notifications
// Should be called by a cron job every 5-15 minutes
export default async function handler(req, res) {
  // Verify cron secret for security
  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    
    // Find all pending notifications that are due
    const pendingNotifications = await prisma.marketplaceNotificationQueue.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: now },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            marketplaceEmails: true,
          }
        },
        marketplaceLead: true,
      },
      take: 100, // Process in batches
    });

    console.log(`📬 Processing ${pendingNotifications.length} queued notifications`);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const notification of pendingNotifications) {
      const { user, marketplaceLead: lead } = notification;

      // Skip if lead is no longer available (sold out or hidden)
      if (lead.isHidden || (lead.maxBuyers > 0 && lead.timesSold >= lead.maxBuyers)) {
        await prisma.marketplaceNotificationQueue.update({
          where: { id: notification.id },
          data: { status: 'cancelled' },
        });
        skipped++;
        continue;
      }

      // Skip if user no longer wants emails or isn't verified
      if (!user.emailVerified || !user.marketplaceEmails) {
        await prisma.marketplaceNotificationQueue.update({
          where: { id: notification.id },
          data: { status: 'cancelled' },
        });
        skipped++;
        continue;
      }

      try {
        const temperature = lead.temperature || 'warm';
        const tempPrices = { hot: 100, warm: 80 };
        const tempEmojis = { hot: '🔥', warm: '🌡️' };
        const tempLabels = { hot: 'Hot', warm: 'Warm' };
        const price = tempPrices[temperature] || 80;
        const state = (lead.state || '').trim().toUpperCase();

        const { html, text } = getMarketplaceLeadEmailTemplate({
          lead: {
            city: lead.city || 'Unknown',
            state: state,
            motivation: lead.motivation,
            timeline: lead.timeline,
            price: price,
            temperature: temperature,
            temperatureLabel: tempLabels[temperature] || 'Warm',
          },
          recipientName: user.name?.split(' ')[0] || 'there',
          unsubscribeUrl: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/profile`,
        });

        const emoji = tempEmojis[temperature] || '🌡️';
        const label = tempLabels[temperature] || 'Warm';

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Verified Homeowner <noreply@verifiedhomeowner.com>',
          to: user.email,
          subject: `${emoji} New ${label} Lead in ${state} - ${lead.motivation}`,
          html,
          text,
        });

        // Mark as sent
        await prisma.marketplaceNotificationQueue.update({
          where: { id: notification.id },
          data: { 
            status: 'sent',
            sentAt: new Date(),
          },
        });

        // Track email sent on user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastEmailSentAt: new Date(),
            lastEmailType: 'marketplace_lead',
          }
        });

        sent++;
        console.log(`✅ Sent delayed notification to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send to ${user.email}:`, emailError.message);
        
        // Mark as failed but don't retry
        await prisma.marketplaceNotificationQueue.update({
          where: { id: notification.id },
          data: { status: 'failed' },
        });
        failed++;
      }
    }

    console.log(`📊 Notification processing complete: ${sent} sent, ${skipped} skipped, ${failed} failed`);

    return res.status(200).json({
      success: true,
      processed: pendingNotifications.length,
      sent,
      skipped,
      failed,
    });

  } catch (error) {
    console.error('❌ Notification processing error:', error);
    return res.status(500).json({ error: 'Failed to process notifications' });
  }
}
