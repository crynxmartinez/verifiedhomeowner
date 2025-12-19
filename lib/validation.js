/**
 * Password Validation
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */

export function validatePassword(password) {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Email Validation
 * Basic email format check
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (email.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true, error: null };
}

/**
 * Name Validation
 * - Not empty
 * - 2-100 characters
 * - No special characters except spaces, hyphens, apostrophes
 */
export function validateName(name) {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true, error: null };
}

/**
 * Validate all registration fields
 */
export function validateRegistration(email, password, name) {
  const errors = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors);
  }

  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    errors.push(nameValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}
