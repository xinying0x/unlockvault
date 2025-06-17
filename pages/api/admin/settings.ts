import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { verifyJwt } from '../../../lib/jwt';
import { serialize } from 'cookie';
import { updateUserCredentials } from '../../../lib/auth';

interface Settings {
  useDummyStats: boolean;
  adminEmail?: string;
  lastModified?: string;
}

async function readSettings(): Promise<Settings> {
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('settings');
    
    let settings = await collection.findOne({ type: 'general' });
    
    if (!settings) {
      // Create default settings
      const defaultSettings: Settings = { 
        useDummyStats: false,
        lastModified: new Date().toISOString()
      };
      
      await collection.insertOne({ 
        type: 'general', 
        ...defaultSettings 
      });
      
      return defaultSettings;
    }
    
    const { _id, type, ...cleanSettings } = settings;
    return cleanSettings as Settings;
  } catch (error) {
    console.error('Error reading settings:', error);
    throw error;
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('settings');
    
    await collection.updateOne(
      { type: 'general' },
      { 
        $set: { 
          ...settings, 
          lastModified: new Date().toISOString() 
        } 
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error writing settings:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] || req.cookies['auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let decoded;
  try {
    decoded = verifyJwt(token);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
  } catch (error) {
    console.error('JWT verification error:', error);
    res.setHeader('Set-Cookie', serialize('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 0,
      path: '/',
    }));
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const settings = await readSettings();
        return res.status(200).json(settings);
      } catch (error) {
        console.error('API Error (GET /api/admin/settings):', error);
        return res.status(500).json({ message: 'Failed to fetch settings' });
      }

    case 'PUT':
      try {
        const { newEmail, newPassword, ...otherSettings } = req.body;
        
        // Update user credentials if provided
        if (newEmail || newPassword) {
          const success = await updateUserCredentials(
            decoded.email, 
            newEmail, 
            newPassword
          );
          
          if (!success) {
            return res.status(400).json({ message: 'Failed to update credentials' });
          }
          
          // If email changed, update token
          if (newEmail) {
            const newToken = require('../../../lib/jwt').signJwt({ 
              email: newEmail, 
              role: decoded.role 
            });
            
            res.setHeader('Set-Cookie', [
              `auth-token=${newToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
            ]);
          }
        }
        
        // Update general settings
        const newSettings: Settings = {
          ...otherSettings,
          adminEmail: newEmail || decoded.email
        };
        
        await writeSettings(newSettings);
        return res.status(200).json({ 
          message: 'Settings updated successfully',
          settings: newSettings 
        });
      } catch (error) {
        console.error('API Error (PUT /api/admin/settings):', error);
        return res.status(500).json({ message: 'Failed to update settings' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
