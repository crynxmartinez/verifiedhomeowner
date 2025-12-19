import prisma from '../../../lib/prisma.js';
import { requireAdmin } from '../../../lib/auth-prisma.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Replace template variables with sample data
function replaceVariables(content, sampleData) {
  let result = content;
  for (const [key, value] of Object.entries(sampleData)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { template_id, email } = req.body;

    if (!template_id || !email) {
      return res.status(400).json({ error: 'Template ID and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get template
    const template = await prisma.emailTemplate.findUnique({
      where: { id: template_id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Sample data for variable replacement
    const sampleData = {
      name: 'John',
      full_name: 'John Smith',
      email: email,
      plan: 'Elite',
      days_since_register: '7',
      leads_count: '15',
      leads_this_month: '5',
      login_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/login`,
      upgrade_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/upgrade`,
      marketplace_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/marketplace`,
      unsubscribe_url: `${process.env.FRONTEND_URL || 'https://verifiedhomeowner.com'}/profile`,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear().toString(),
    };

    // Replace variables in content
    const htmlContent = replaceVariables(template.htmlContent, sampleData);
    const textContent = replaceVariables(template.textContent, sampleData);
    const subject = replaceVariables(template.subject, sampleData) + ' [TEST]';

    // Send test email
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Verified Homeowner <noreply@verifiedhomeowner.com>',
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      console.error('Test email send error:', result.error);
      return res.status(500).json({ error: 'Failed to send test email: ' + result.error.message });
    }

    res.status(200).json({ 
      message: `Test email sent successfully to ${email}`,
      email_id: result.data?.id 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
}

export default requireAdmin(handler);
