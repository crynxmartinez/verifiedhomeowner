import prisma from '../../lib/prisma.js';
import { requireAdmin } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all email templates
    try {
      const templates = await prisma.emailTemplate.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { automations: true }
          }
        }
      });

      const formattedTemplates = templates.map(t => ({
        id: t.id,
        name: t.name,
        display_name: t.displayName,
        subject: t.subject,
        html_content: t.htmlContent,
        text_content: t.textContent,
        variables: t.variables,
        is_active: t.isActive,
        automations_count: t._count.automations,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      }));

      res.status(200).json({ templates: formattedTemplates });
    } catch (error) {
      console.error('Fetch email templates error:', error);
      res.status(500).json({ error: 'Failed to fetch email templates' });
    }
  } else if (req.method === 'POST') {
    // Create new email template
    try {
      const { name, display_name, subject, html_content, text_content, variables } = req.body;

      if (!name || !display_name || !subject || !html_content) {
        return res.status(400).json({ error: 'Name, display name, subject, and HTML content are required' });
      }

      // Check if name already exists
      const existing = await prisma.emailTemplate.findUnique({
        where: { name }
      });

      if (existing) {
        return res.status(400).json({ error: 'Template with this name already exists' });
      }

      const template = await prisma.emailTemplate.create({
        data: {
          name,
          displayName: display_name,
          subject,
          htmlContent: html_content,
          textContent: text_content || '',
          variables: variables || [],
        }
      });

      res.status(201).json({
        template: {
          id: template.id,
          name: template.name,
          display_name: template.displayName,
          subject: template.subject,
          html_content: template.htmlContent,
          text_content: template.textContent,
          variables: template.variables,
          is_active: template.isActive,
          created_at: template.createdAt,
        }
      });
    } catch (error) {
      console.error('Create email template error:', error);
      res.status(500).json({ error: 'Failed to create email template' });
    }
  } else if (req.method === 'PATCH') {
    // Update email template
    try {
      const { id, name, display_name, subject, html_content, text_content, variables, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (display_name !== undefined) updateData.displayName = display_name;
      if (subject !== undefined) updateData.subject = subject;
      if (html_content !== undefined) updateData.htmlContent = html_content;
      if (text_content !== undefined) updateData.textContent = text_content;
      if (variables !== undefined) updateData.variables = variables;
      if (is_active !== undefined) updateData.isActive = is_active;

      const template = await prisma.emailTemplate.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        template: {
          id: template.id,
          name: template.name,
          display_name: template.displayName,
          subject: template.subject,
          html_content: template.htmlContent,
          text_content: template.textContent,
          variables: template.variables,
          is_active: template.isActive,
          updated_at: template.updatedAt,
        }
      });
    } catch (error) {
      console.error('Update email template error:', error);
      res.status(500).json({ error: 'Failed to update email template' });
    }
  } else if (req.method === 'DELETE') {
    // Delete email template
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      // Check if template is used by any automation
      const automationsUsingTemplate = await prisma.emailAutomation.count({
        where: { templateId: id }
      });

      if (automationsUsingTemplate > 0) {
        return res.status(400).json({ 
          error: `Cannot delete template. It is used by ${automationsUsingTemplate} automation(s).` 
        });
      }

      await prisma.emailTemplate.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Delete email template error:', error);
      res.status(500).json({ error: 'Failed to delete email template' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
