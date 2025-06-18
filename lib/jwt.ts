import jwt from 'jsonwebtoken';
import { logger } from './logger';

// استخدام نفس المفتاح المستخدم في lib/auth.ts
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '7d';

console.log('Loaded JWT_SECRET:', JWT_SECRET ? '********' : 'UNDEFINED');

export interface JwtPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function signJwt(payload: { email: string; role: string }): string {
  if (!JWT_SECRET) {
    logger.error('JWT_SECRET is not defined');
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyJwt(token: string): JwtPayload | null {
  if (!JWT_SECRET) {
    logger.error('JWT_SECRET is not defined');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload as JwtPayload;
  } catch (e) {
    logger.warn('JWT verification failed', { error: e });
    return null;
  }
} 