import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  // GET - Get admin settings
  if (req.method === 'GET') {
    try {
      let settings = await prisma.adminSettings.findUnique({
        where: { id: 'default' }
      });

      // Create default settings if not exists
      if (!settings) {
        settings = await prisma.adminSettings.create({
          data: { id: 'default' }
        });
      }

      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching admin settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  // PATCH - Update admin settings
  if (req.method === 'PATCH') {
    try {
      const { supportNotificationEmail } = req.body;

      // Validate email if provided
      if (supportNotificationEmail && supportNotificationEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(supportNotificationEmail)) {
          return res.status(400).json({ error: 'Invalid email address' });
        }
      }

      const settings = await prisma.adminSettings.upsert({
        where: { id: 'default' },
        update: {
          supportNotificationEmail: supportNotificationEmail?.trim() || null,
        },
        create: {
          id: 'default',
          supportNotificationEmail: supportNotificationEmail?.trim() || null,
        }
      });

      return res.status(200).json({ 
        message: 'Settings updated successfully',
        settings 
      });
    } catch (error) {
      console.error('Error updating admin settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);
