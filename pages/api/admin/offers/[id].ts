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
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid Offer ID' });
  }

  if (req.method === 'DELETE') {
    try {
      const fileContents = await fs.readFile(OFFERS_FILE, 'utf8');
      let offers: Offer[] = JSON.parse(fileContents);

      const initialLength = offers.length;
      offers = offers.filter(offer => offer.id !== id);

      if (offers.length === initialLength) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      await fs.writeFile(OFFERS_FILE, JSON.stringify(offers, null, 2));
      return res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (error) {
      console.error('Error deleting offer:', error);
      return res.status(500).json({ error: 'Failed to delete offer' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 