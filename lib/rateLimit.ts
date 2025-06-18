import { NextApiRequest } from 'next';
import { logger } from './logger';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextApiRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return (req: NextApiRequest): { success: boolean; limit: number; remaining: number; resetTime: number } => {
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req);
    const now = Date.now();
    const resetTime = now + windowMs;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment existing entry
      entry.count++;
    }

    const remaining = Math.max(0, maxRequests - entry.count);
    const success = entry.count <= maxRequests;

    if (!success) {
      logger.warn('Rate limit exceeded', {
        key,
        count: entry.count,
        limit: maxRequests,
        endpoint: req.url
      });
    }

    return {
      success,
      limit: maxRequests,
      remaining,
      resetTime: entry.resetTime
    };
  };
}

function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.socket.remoteAddress;
  return ip || 'unknown';
}

// Pre-configured rate limiters
export const searchRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
});

export const generalRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
}); 