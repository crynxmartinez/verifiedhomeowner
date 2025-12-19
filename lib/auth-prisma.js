import prisma from './prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// JWT Secret - MUST be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Set it in your .env file or Vercel environment variables.');
}

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Middleware to require authentication
export function requireAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const decoded = verifyToken(token);
      
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Get user profile from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

// Middleware to require admin role
export function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    return handler(req, res);
  });
}
