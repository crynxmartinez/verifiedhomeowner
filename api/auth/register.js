import prisma from '../../lib/prisma.js';
import { generateToken, hashPassword } from '../../lib/auth-prisma.js';
import { distributeLeadsToUser } from '../../lib/distributeLeads-prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine role based on email
    const isAdmin = email.toLowerCase() === 'el@admin.com';

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: isAdmin ? 'admin' : 'wholesaler',
        planType: isAdmin ? 'elite' : 'free',
        subscriptionStatus: 'active',
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Distribute initial leads to new user
    try {
      await distributeLeadsToUser(user.id);
    } catch (distError) {
      console.error('Failed to distribute initial leads:', distError);
      // Don't fail registration if lead distribution fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}
