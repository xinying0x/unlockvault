import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const OFFERS_FILE = path.resolve(process.cwd(), 'data', 'offers.json');

interface Offer {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const fileContents = await fs.readFile(OFFERS_FILE, 'utf8');
    const offers: Offer[] = JSON.parse(fileContents);
    return res.status(200).json(offers);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, return an empty array of offers
      return res.status(200).json([]);
    }
    console.error('Error fetching offers from offers.json:', error);
    return res.status(500).json({ error: 'Failed to load offers' });
  }
} 