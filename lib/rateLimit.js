import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for login attempts
// 5 attempts per 15 minutes per IP
const loginLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 15 * 60, // per 15 minutes
  blockDuration: 15 * 60, // block for 15 minutes if exceeded
});

// Rate limiter for registration
// 3 attempts per hour per IP
const registerLimiter = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 60 * 60, // per 1 hour
  blockDuration: 60 * 60, // block for 1 hour if exceeded
});

// Rate limiter for general API requests
// 100 requests per minute per IP
const apiLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per 1 minute
});

// Get client IP from request
function getClientIP(req) {
  // Vercel/Cloudflare headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Real IP header
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  // Fallback to connection remote address
  return req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}

// Middleware wrapper for login rate limiting
export function rateLimitLogin(handler) {
  return async (req, res) => {
    const clientIP = getClientIP(req);
    
    try {
      await loginLimiter.consume(clientIP);
      return handler(req, res);
    } catch (rateLimiterRes) {
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
      console.warn(`[RATE LIMIT] Login blocked for IP: ${clientIP}, retry after: ${retryAfter}s`);
      
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many login attempts. Please try again later.',
        retryAfter: retryAfter,
      });
    }
  };
}

// Middleware wrapper for registration rate limiting
export function rateLimitRegister(handler) {
  return async (req, res) => {
    const clientIP = getClientIP(req);
    
    try {
      await registerLimiter.consume(clientIP);
      return handler(req, res);
    } catch (rateLimiterRes) {
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
      console.warn(`[RATE LIMIT] Registration blocked for IP: ${clientIP}, retry after: ${retryAfter}s`);
      
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many registration attempts. Please try again later.',
        retryAfter: retryAfter,
      });
    }
  };
}

// Middleware wrapper for general API rate limiting
export function rateLimitAPI(handler) {
  return async (req, res) => {
    const clientIP = getClientIP(req);
    
    try {
      await apiLimiter.consume(clientIP);
      return handler(req, res);
    } catch (rateLimiterRes) {
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
      console.warn(`[RATE LIMIT] API blocked for IP: ${clientIP}, retry after: ${retryAfter}s`);
      
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many requests. Please slow down.',
        retryAfter: retryAfter,
      });
    }
  };
}

// Reset rate limit for a specific IP (useful for testing or admin override)
export async function resetRateLimit(ip, type = 'login') {
  try {
    if (type === 'login') {
      await loginLimiter.delete(ip);
    } else if (type === 'register') {
      await registerLimiter.delete(ip);
    } else if (type === 'api') {
      await apiLimiter.delete(ip);
    }
    return true;
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
    return false;
  }
}
