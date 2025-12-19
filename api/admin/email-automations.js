import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all email automations with template info
    try {
      const automations = await prisma.emailAutomation.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: {
              name: true,
              displayName: true,
              subject: true,
            }
          },
          _count: {
            select: { emailLogs: true }
          }
        }
      });

      const formattedAutomations = automations.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        template_id: a.templateId,
        template_name: a.template.name,
        template_display_name: a.template.displayName,
        template_subject: a.template.subject,
        trigger: a.trigger,
        delay_hours: a.delayHours,
        repeat_interval_hours: a.repeatIntervalHours,
        max_sends: a.maxSends,
        is_active: a.isActive,
        total_sent: a.totalSent,
        emails_logged: a._count.emailLogs,
        last_run_at: a.lastRunAt,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
      }));

      // Get stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [sentToday, sentThisWeek, activeAutomations] = await Promise.all([
        prisma.emailLog.count({
          where: { sentAt: { gte: todayStart } }
        }),
        prisma.emailLog.count({
          where: { sentAt: { gte: weekStart } }
        }),
        prisma.emailAutomation.count({
          where: { isActive: true }
        })
      ]);

      res.status(200).json({ 
        automations: formattedAutomations,
        stats: {
          sent_today: sentToday,
          sent_this_week: sentThisWeek,
          active_automations: activeAutomations,
          total_templates: await prisma.emailTemplate.count(),
        }
      });
    } catch (error) {
      console.error('Fetch email automations error:', error);
      res.status(500).json({ error: 'Failed to fetch email automations' });
    }
  } else if (req.method === 'POST') {
    // Create new email automation
    try {
      const { 
        name, 
        description, 
        template_id, 
        trigger, 
        delay_hours, 
        repeat_interval_hours, 
        max_sends,
        is_active 
      } = req.body;

      if (!name || !template_id || !trigger) {
        return res.status(400).json({ error: 'Name, template ID, and trigger are required' });
      }

      // Verify template exists
      const template = await prisma.emailTemplate.findUnique({
        where: { id: template_id }
      });

      if (!template) {
        return res.status(400).json({ error: 'Template not found' });
      }

      const automation = await prisma.emailAutomation.create({
        data: {
          name,
          description: description || null,
          templateId: template_id,
          trigger,
          delayHours: delay_hours || 0,
          repeatIntervalHours: repeat_interval_hours || 0,
          maxSends: max_sends || 1,
          isActive: is_active !== false,
        },
        include: {
          template: {
            select: {
              name: true,
              displayName: true,
            }
          }
        }
      });

      res.status(201).json({
        automation: {
          id: automation.id,
          name: automation.name,
          description: automation.description,
          template_id: automation.templateId,
          template_name: automation.template.name,
          template_display_name: automation.template.displayName,
          trigger: automation.trigger,
          delay_hours: automation.delayHours,
          repeat_interval_hours: automation.repeatIntervalHours,
          max_sends: automation.maxSends,
          is_active: automation.isActive,
          created_at: automation.createdAt,
        }
      });
    } catch (error) {
      console.error('Create email automation error:', error);
      res.status(500).json({ error: 'Failed to create email automation' });
    }
  } else if (req.method === 'PATCH') {
    // Update email automation
    try {
      const { 
        id, 
        name, 
        description, 
        template_id, 
        trigger, 
        delay_hours, 
        repeat_interval_hours, 
        max_sends,
        is_active 
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Automation ID is required' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (template_id !== undefined) updateData.templateId = template_id;
      if (trigger !== undefined) updateData.trigger = trigger;
      if (delay_hours !== undefined) updateData.delayHours = delay_hours;
      if (repeat_interval_hours !== undefined) updateData.repeatIntervalHours = repeat_interval_hours;
      if (max_sends !== undefined) updateData.maxSends = max_sends;
      if (is_active !== undefined) updateData.isActive = is_active;

      const automation = await prisma.emailAutomation.update({
        where: { id },
        data: updateData,
        include: {
          template: {
            select: {
              name: true,
              displayName: true,
            }
          }
        }
      });

      res.status(200).json({
        automation: {
          id: automation.id,
          name: automation.name,
          description: automation.description,
          template_id: automation.templateId,
          template_name: automation.template.name,
          template_display_name: automation.template.displayName,
          trigger: automation.trigger,
          delay_hours: automation.delayHours,
          repeat_interval_hours: automation.repeatIntervalHours,
          max_sends: automation.maxSends,
          is_active: automation.isActive,
          total_sent: automation.totalSent,
          updated_at: automation.updatedAt,
        }
      });
    } catch (error) {
      console.error('Update email automation error:', error);
      res.status(500).json({ error: 'Failed to update email automation' });
    }
  } else if (req.method === 'DELETE') {
    // Delete email automation
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Automation ID is required' });
      }

      await prisma.emailAutomation.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Automation deleted successfully' });
    } catch (error) {
      console.error('Delete email automation error:', error);
      res.status(500).json({ error: 'Failed to delete email automation' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
