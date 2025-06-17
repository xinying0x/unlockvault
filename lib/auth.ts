import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AdminUser {
  email: string;
  role: string;
  loginTime: string;
  passwordHash?: string;
  createdAt?: string;
  lastLogin?: string;
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
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const usersCollection = db.collection('users');
    
    // Find user by email
    const user = await usersCollection.findOne({ email, role: 'admin' });
    
    if (!user) {
      console.log('User not found:', email);
      return false;
    }
    
    // Compare password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (isValid) {
      // Update last login time
      await usersCollection.updateOne(
        { email },
        { $set: { lastLogin: new Date().toISOString() } }
      );
    }
    
    console.log('Password validation result:', { isValid, email });
    return isValid;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
}

export async function createDefaultAdmin(): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ 
      email: 'admin@unlockvault.xyz', 
      role: 'admin' 
    });
    
    if (!existingAdmin) {
      const defaultAdmin = {
        email: 'admin@unlockvault.xyz',
        role: 'admin',
        passwordHash: await bcrypt.hash('admin123456', 12),
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      
      await usersCollection.insertOne(defaultAdmin);
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

export async function updateUserCredentials(
  currentEmail: string, 
  newEmail?: string, 
  newPassword?: string
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const usersCollection = db.collection('users');
    
    const updateData: any = {};
    
    if (newEmail) {
      updateData.email = newEmail;
    }
    
    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }
    
    updateData.lastModified = new Date().toISOString();
    
    const result = await usersCollection.updateOne(
      { email: currentEmail, role: 'admin' },
      { $set: updateData }
    );
    
    return result.matchedCount > 0;
  } catch (error) {
    console.error('Error updating user credentials:', error);
    return false;
  }
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