import { NextApiRequest } from 'next';

// Input sanitization
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential XSS chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleanEmail = email.toLowerCase().trim();
  
  return emailRegex.test(cleanEmail) ? cleanEmail : '';
}

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ip: string, 
  maxRequests: number = 100, 
  windowMs: number = 60 * 60 * 1000 // 1 hour
): boolean {
  const now = Date.now();
  const key = `rate_limit:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// IP extraction
export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) 
    ? forwarded[0] 
    : forwarded || req.socket.remoteAddress || 'unknown';
  
  return ip.split(',')[0].trim();
}

// Bot detection
export function isBot(userAgent: string): boolean {
  if (!userAgent) return true;
  
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /slurp/i, /fetch/i,
    /monitor/i, /scan/i, /ping/i, /curl/i, /wget/i,
    /python-requests/i, /axios/i, /postman/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

// SQL injection detection (basic)
export function hasSQLInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\bunion\b.*\bselect\b)/i,
    /(\bselect\b.*\bfrom\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bdelete\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\bupdate\b.*\bset\b)/i,
    /('.*--)/i,
    /(;.*--)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// XSS detection (basic)
export function hasXSS(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

// Validate request body
export function validateRequestBody(body: any, requiredFields: string[]): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body is required';
  }

  for (const field of requiredFields) {
    if (!body[field]) {
      return `Field '${field}' is required`;
    }
  }

  // Check for malicious content
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      if (hasSQLInjection(value)) {
        return `Potential SQL injection detected in field '${key}'`;
      }
      if (hasXSS(value)) {
        return `Potential XSS detected in field '${key}'`;
      }
    }
  }

  return null;
}

// Generate secure random string
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
} 