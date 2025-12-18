import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

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
