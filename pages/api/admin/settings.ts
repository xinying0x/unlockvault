import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { verifyJwt } from '../../../lib/jwt';
import { serialize } from 'cookie';

const SETTINGS_FILE = path.resolve(process.cwd(), 'data', 'settings.json');

interface Settings {
  useDummyStats: boolean;
}

async function readSettings(): Promise<Settings> {
  try {
    const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, create it with default settings
      const defaultSettings: Settings = { useDummyStats: false };
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
      return defaultSettings;
    }
    console.error('Error reading settings file:', error);
    throw error;
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] || req.cookies['auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = verifyJwt(token);
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
        const newSettings: Settings = req.body;
        await writeSettings(newSettings);
        return res.status(200).json(newSettings);
      } catch (error) {
        console.error('API Error (PUT /api/admin/settings):', error);
        return res.status(500).json({ message: 'Failed to update settings' });
      }
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
