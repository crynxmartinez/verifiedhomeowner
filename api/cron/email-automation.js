import prisma from '../../lib/prisma.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Replace template variables with user data
function replaceVariables(content, userData) {
  let result = content;
  for (const [key, value] of Object.entries(userData)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  return result;
}

// Get users eligible for a specific trigger
async function getEligibleUsers(trigger, automation) {
  const now = new Date();
  const delayMs = automation.delayHours * 60 * 60 * 1000;
  const repeatMs = automation.repeatIntervalHours * 60 * 60 * 1000;

  let users = [];

  switch (trigger) {
    case 'after_register': {
      // Users who registered X hours ago and haven't received this email
      const targetTime = new Date(now.getTime() - delayMs);
      const windowStart = new Date(targetTime.getTime() - 60 * 60 * 1000); // 1 hour window
      
      users = await prisma.user.findMany({
        where: {
          role: 'wholesaler',
          createdAt: {
            gte: windowStart,
            lte: targetTime,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          createdAt: true,
        }
      });
      break;
    }

    case 'not_verified': {
      // Users who haven't verified email, registered at least X hours ago
      const minRegisterTime = new Date(now.getTime() - delayMs);
      
      users = await prisma.user.findMany({
        where: {
          role: 'wholesaler',
          emailVerified: false,
          createdAt: { lte: minRegisterTime },
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          createdAt: true,
        }
      });
      break;
    }

    case 'on_free_plan': {
      // Users on free plan, registered at least X hours ago
      const minRegisterTime = new Date(now.getTime() - delayMs);
      
      users = await prisma.user.findMany({
        where: {
          role: 'wholesaler',
          planType: 'free',
          emailVerified: true,
          createdAt: { lte: minRegisterTime },
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          createdAt: true,
        }
      });
      break;
    }

    case 'inactive_7d': {
      // Users who haven't logged in for 7+ days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      users = await prisma.user.findMany({
        where: {
          role: 'wholesaler',
          emailVerified: true,
          OR: [
            { lastLoginAt: { lte: sevenDaysAgo } },
            { lastLoginAt: null, createdAt: { lte: sevenDaysAgo } },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          lastLoginAt: true,
          createdAt: true,
        }
      });
      break;
    }

    case 'inactive_30d': {
      // Users who haven't logged in for 30+ days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      users = await prisma.user.findMany({
        where: {
          role: 'wholesaler',
          emailVerified: true,
          OR: [
            { lastLoginAt: { lte: thirtyDaysAgo } },
            { lastLoginAt: null, createdAt: { lte: thirtyDaysAgo } },
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          lastLoginAt: true,
          createdAt: true,
        }
      });
      break;
    }

    case 'monthly': {
      // All verified users (for monthly digest)
      // Only run on 1st of month
      if (now.getDate() !== 1) {
        return [];
      }
      
      users = await prisma.user.findMany({
        where: {
          role: 'wholesaler',
          emailVerified: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          createdAt: true,
        }
      });
      break;
    }

    case 'before_expiry': {
      // Users whose subscription expires within X hours (delay_hours)
      const expiryWindow = new Date(now.getTime() + delayMs);
      const windowStart = new Date(now.getTime());
      
      users = await prisma.user.findMany({
        where: {
          role: 'wholesaler',
          emailVerified: true,
          planType: { not: 'free' },
          subscriptionEndDate: {
            gte: windowStart,
            lte: expiryWindow,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          subscriptionEndDate: true,
          createdAt: true,
        }
      });
      break;
    }

    default:
      console.log(`Unknown trigger: ${trigger}`);
      return [];
  }

  return users;
}

// Check if user should receive email based on automation rules
async function shouldSendToUser(userId, automation) {
  // Check how many times this user has received this automation's emails
  const sentCount = await prisma.emailLog.count({
    where: {
      userId,
      automationId: automation.id,
    }
  });

  // Check max sends (0 = unlimited)
  if (automation.maxSends > 0 && sentCount >= automation.maxSends) {
    return false;
  }

  // Check repeat interval
  if (automation.repeatIntervalHours > 0 && sentCount > 0) {
    const lastSent = await prisma.emailLog.findFirst({
      where: {
        userId,
        automationId: automation.id,
      },
      orderBy: { sentAt: 'desc' },
    });

    if (lastSent) {
      const repeatMs = automation.repeatIntervalHours * 60 * 60 * 1000;
      const nextSendTime = new Date(lastSent.sentAt.getTime() + repeatMs);
      
      if (new Date() < nextSendTime) {
        return false;
      }
    }
  }

  return true;
}

// Send email to user
async function sendAutomationEmail(user, automation, template) {
  const now = new Date();
  const daysSinceRegister = Math.floor((now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));

  // Get user's lead count
  const leadsCount = await prisma.userLead.count({
    where: { userId: user.id }
  });

  // Get leads this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const leadsThisMonth = await prisma.userLead.count({
    where: {
      userId: user.id,
      assignedAt: { gte: startOfMonth }
    }
  });

  // Prepare user data for variable replacement
  const userData = {
    name: user.name?.split(' ')[0] || 'there',
    full_name: user.name || 'Valued Customer',
    email: user.email,
    plan: user.planType || 'free',
    days_since_register: daysSinceRegister.toString(),
    leads_count: leadsCount.toString(),
    leads_this_month: leadsThisMonth.toString(),
    login_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/login`,
    upgrade_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/upgrade`,
    marketplace_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/marketplace`,
    unsubscribe_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/profile`,
    month: now.toLocaleString('default', { month: 'long' }),
    year: now.getFullYear().toString(),
  };

  // Replace variables
  const htmlContent = replaceVariables(template.htmlContent, userData);
  const textContent = replaceVariables(template.textContent, userData);
  const subject = replaceVariables(template.subject, userData);

  try {
    // Send email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Verified Homeowner <noreply@verifiedhomeowner.com>',
      to: user.email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Log the email
    await prisma.emailLog.create({
      data: {
        userId: user.id,
        automationId: automation.id,
        templateName: template.name,
        subject,
        recipientEmail: user.email,
        status: 'sent',
      }
    });

    // Update user's last email tracking
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastEmailSentAt: now,
        lastEmailType: template.name,
      }
    });

    // Increment automation counter
    await prisma.emailAutomation.update({
      where: { id: automation.id },
      data: {
        totalSent: { increment: 1 },
      }
    });

    return true;
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error.message);
    
    // Log failed attempt
    await prisma.emailLog.create({
      data: {
        userId: user.id,
        automationId: automation.id,
        templateName: template.name,
        subject,
        recipientEmail: user.email,
        status: 'failed',
      }
    });

    return false;
  }
}

export default async function handler(req, res) {
  // Verify cron secret (optional but recommended)
  const cronSecret = req.headers['authorization'];
  if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development or if no secret is set
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🚀 Starting email automation cron job...');

  try {
    // Get all active automations
    const automations = await prisma.emailAutomation.findMany({
      where: { isActive: true },
      include: {
        template: true,
      }
    });

    console.log(`📧 Found ${automations.length} active automations`);

    let totalSent = 0;
    let totalFailed = 0;

    for (const automation of automations) {
      console.log(`\n📬 Processing: ${automation.name} (trigger: ${automation.trigger})`);

      // Get eligible users for this trigger
      const eligibleUsers = await getEligibleUsers(automation.trigger, automation);
      console.log(`   Found ${eligibleUsers.length} potentially eligible users`);

      for (const user of eligibleUsers) {
        // Check if we should send to this user
        const shouldSend = await shouldSendToUser(user.id, automation);
        
        if (shouldSend) {
          const success = await sendAutomationEmail(user, automation, automation.template);
          if (success) {
            totalSent++;
            console.log(`   ✅ Sent to ${user.email}`);
          } else {
            totalFailed++;
            console.log(`   ❌ Failed for ${user.email}`);
          }
        }
      }

      // Update last run time
      await prisma.emailAutomation.update({
        where: { id: automation.id },
        data: { lastRunAt: new Date() }
      });
    }

    console.log(`\n✨ Cron job complete: ${totalSent} sent, ${totalFailed} failed`);

    res.status(200).json({
      success: true,
      message: `Email automation complete`,
      stats: {
        automations_processed: automations.length,
        emails_sent: totalSent,
        emails_failed: totalFailed,
      }
    });
  } catch (error) {
    console.error('Email automation cron error:', error);
    res.status(500).json({ error: 'Email automation failed', details: error.message });
  }
}
