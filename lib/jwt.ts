import jwt from 'jsonwebtoken';

// استخدام نفس المفتاح المستخدم في lib/auth.ts
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '7d';

console.log('Loaded JWT_SECRET:', JWT_SECRET ? '********' : 'UNDEFINED');

export interface JwtPayload {
  email: string;
  role: string;
}

export function signJwt(payload: JwtPayload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): JwtPayload | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('Decoded JWT payload:', payload);
    return payload as JwtPayload;
  } catch (e) {
    console.error('JWT verify error:', e);
    return null;
  }
} 