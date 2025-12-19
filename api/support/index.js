import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Category labels for email
const CATEGORY_LABELS = {
  general: 'General Inquiry',
  technical: 'Technical Issue',
  billing: 'Billing Question',
  lead_quality: 'Lead Quality',
  feature_request: 'Feature Request',
  other: 'Other'
};

async function handler(req, res) {
  // POST - Create a support ticket (wholesaler)
  if (req.method === 'POST') {
    try {
      const { name, email, category, message } = req.body;
      const userId = req.user.id;

      if (!name || !email || !category || !message) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const ticket = await prisma.supportTicket.create({
        data: {
          userId,
          name,
          email,
          category,
          message,
          status: 'open'
        }
      });

      // Send notification email to admin if configured
      try {
        const settings = await prisma.adminSettings.findUnique({
          where: { id: 'default' }
        });

        if (settings?.supportNotificationEmail) {
          const categoryLabel = CATEGORY_LABELS[category] || category;
          
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Verified Homeowner <noreply@verifiedhomeowner.com>',
            to: settings.supportNotificationEmail,
            subject: `🎫 New Support Ticket: ${categoryLabel}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🎫 New Support Ticket</h1>
                </div>
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 16px 0;"><strong>From:</strong> ${name} (${email})</p>
                  <p style="margin: 0 0 16px 0;"><strong>Category:</strong> <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px;">${categoryLabel}</span></p>
                  <p style="margin: 0 0 8px 0;"><strong>Message:</strong></p>
                  <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                  </div>
                  <div style="margin-top: 20px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/admin/support" 
                       style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                      View in Dashboard
                    </a>
                  </div>
                </div>
              </div>
            `,
            text: `New Support Ticket\n\nFrom: ${name} (${email})\nCategory: ${categoryLabel}\n\nMessage:\n${message}\n\nView in dashboard: ${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/admin/support`
          });
          console.log(`📧 Support notification sent to ${settings.supportNotificationEmail}`);
        }
      } catch (emailError) {
        console.error('Failed to send support notification email:', emailError);
        // Don't fail the ticket creation if email fails
      }

      return res.status(201).json({ message: 'Support ticket created successfully', ticket });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // GET - Get all support tickets (admin only)
  if (req.method === 'GET') {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const tickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(tickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
