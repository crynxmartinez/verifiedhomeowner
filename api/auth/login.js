import prisma from '../../lib/prisma.js';
import { generateToken, comparePassword } from '../../lib/auth-prisma.js';
import { rateLimitLogin } from '../../lib/rateLimit.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Format user for frontend (snake_case)
    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan_type: user.planType,
      subscription_status: user.subscriptionStatus,
      email_verified: user.emailVerified,
      created_at: user.createdAt,
    };

    res.status(200).json({
      token,
      user: formattedUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// Apply rate limiting: 5 attempts per 15 minutes per IP
export default rateLimitLogin(handler);
