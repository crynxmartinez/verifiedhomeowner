import prisma from '../../lib/prisma.js';
import { requireAuth } from '../../lib/auth-prisma.js';

async function handler(req, res) {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Ticket ID is required' });
  }

  // PATCH - Update ticket status
  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (!status || !['open', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const ticket = await prisma.supportTicket.update({
        where: { id },
        data: { status }
      });

      return res.status(200).json({ message: 'Ticket updated successfully', ticket });
    } catch (error) {
      console.error('Error updating support ticket:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // DELETE - Delete ticket
  if (req.method === 'DELETE') {
    try {
      await prisma.supportTicket.delete({
        where: { id }
      });

      return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
