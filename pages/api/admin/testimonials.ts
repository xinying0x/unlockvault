import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { verifyJwt } from '../../../lib/jwt';
import { serialize } from 'cookie';

const TESTIMONIALS_FILE = path.resolve(process.cwd(), 'data', 'testimonials.json');

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  createdAt: string;
  status: 'active' | 'pending' | 'rejected';
}

async function readTestimonials(): Promise<Testimonial[]> {
  try {
    const content = await fs.readFile(TESTIMONIALS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading testimonials file:', error);
    throw error;
  }
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
    // Clear invalid token cookie on verification failure
    res.setHeader('Set-Cookie', serialize('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 0,
      path: '/',
    }));
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (req.method === 'GET') {
    try {
      const testimonials = await readTestimonials();
      return res.status(200).json(testimonials); // Return all testimonials for admin
    } catch (error) {
      console.error('API Error (GET /api/admin/testimonials):', error);
      return res.status(500).json({ message: 'Failed to fetch testimonials' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 