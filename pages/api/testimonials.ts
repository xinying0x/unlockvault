import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

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

async function writeTestimonials(testimonials: Testimonial[]): Promise<void> {
  await fs.writeFile(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf-8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const testimonials = await readTestimonials();
      const activeTestimonials = testimonials.filter(t => t.status === 'active');
      return res.status(200).json(activeTestimonials);
    } catch (error) {
      console.error('API Error (GET /api/testimonials):', error);
      return res.status(500).json({ message: 'Failed to fetch testimonials' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 