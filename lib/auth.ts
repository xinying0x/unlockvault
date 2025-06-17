import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@unlockvault.xyz';
// New password: 'admin123456'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$xEnJHMRhk0jdYW3WnGcc0eWK.uz8p4nZjgJtE95i9wxC48LFpNLs2';

export interface AdminUser {
  email: string;
  role: string;
  loginTime: string;
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AdminUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminUser;
  } catch (error) {
    return null;
  }
}

export async function validateCredentials(email: string, password: string): Promise<boolean> {
  console.log('Validating credentials:', { 
    email, 
    passwordLength: password.length,
    providedEmail: email,
    expectedEmail: ADMIN_EMAIL,
    emailMatch: email === ADMIN_EMAIL
  });
  
  if (email !== ADMIN_EMAIL) {
    console.log('Email mismatch:', { provided: email, expected: ADMIN_EMAIL });
    return false;
  }
  
  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  console.log('Password validation result:', { 
    isValid,
    passwordLength: password.length,
    expectedPassword: 'admin123456'
  });
  
  return isValid;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Rate limiting store (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset after 15 minutes
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Max 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    return false;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

export function logFailedAttempt(ip: string, email: string): void {
  console.warn(`Failed login attempt from IP: ${ip}, Email: ${email}, Time: ${new Date().toISOString()}`);
} 