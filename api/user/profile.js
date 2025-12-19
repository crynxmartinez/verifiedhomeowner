import prisma from '../../lib/prisma.js';
import { requireAuth, hashPassword } from '../../lib/auth-prisma.js';
import { validatePassword, validateEmail, validateName } from '../../lib/validation.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get current user profile
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          planType: true,
          subscriptionStatus: true,
          emailVerified: true,
          createdAt: true,
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  } else if (req.method === 'PATCH') {
    // Update user profile
    try {
      const { name, email, currentPassword, newPassword, preferredStates, marketplaceEmails } = req.body;
      const updateData = {};
      const errors = [];

      // Validate and update name
      if (name !== undefined) {
        const nameValidation = validateName(name);
        if (!nameValidation.valid) {
          errors.push(...nameValidation.errors);
        } else {
          updateData.name = name.trim();
        }
      }

      // Validate and update email
      if (email !== undefined && email.toLowerCase() !== req.user.email) {
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          errors.push(...emailValidation.errors);
        } else {
          // Check if email is already in use
          const existingUser = await prisma.user.findFirst({
            where: {
              email: email.toLowerCase(),
              NOT: { id: req.user.id }
            }
          });

          if (existingUser) {
            errors.push('Email is already in use');
          } else {
            updateData.email = email.toLowerCase();
            // Reset email verification when email changes
            updateData.emailVerified = false;
          }
        }
      }

      // Validate and update marketplace preferences
      if (preferredStates !== undefined) {
        if (!Array.isArray(preferredStates)) {
          errors.push('Preferred states must be an array');
        } else if (preferredStates.length > 3) {
          errors.push('Maximum 3 preferred states allowed');
        } else {
          updateData.preferredStates = preferredStates;
        }
      }

      if (marketplaceEmails !== undefined) {
        updateData.marketplaceEmails = Boolean(marketplaceEmails);
      }

      // Validate and update password
      if (newPassword) {
        if (!currentPassword) {
          errors.push('Current password is required to set a new password');
        } else {
          // Verify current password
          const bcrypt = await import('bcryptjs');
          const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { password: true }
          });

          const isValidPassword = await bcrypt.compare(currentPassword, user.password);
          if (!isValidPassword) {
            errors.push('Current password is incorrect');
          } else {
            const passwordValidation = validatePassword(newPassword);
            if (!passwordValidation.valid) {
              errors.push(...passwordValidation.errors);
            } else {
              updateData.password = await hashPassword(newPassword);
            }
          }
        }
      }

      // Return errors if any
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }

      // Check if there's anything to update (allow marketplace preferences even if nothing else changed)
      if (Object.keys(updateData).length === 0 && preferredStates === undefined && marketplaceEmails === undefined) {
        return res.status(400).json({ error: 'No changes to update' });
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          planType: true,
          subscriptionStatus: true,
          emailVerified: true,
          preferredStates: true,
          marketplaceEmails: true,
          createdAt: true,
        }
      });

      res.status(200).json({ 
        user: updatedUser,
        message: 'Profile updated successfully',
        emailChanged: updateData.email !== undefined
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
