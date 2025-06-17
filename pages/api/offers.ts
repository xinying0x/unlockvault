import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface Offer {
  _id?: ObjectId;
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  lockerLinks: { [key: string]: string };
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  useDummyStats: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection<Offer>('offers');

    switch (req.method) {
      case 'GET':
        const { category, type, featured, status = 'active' } = req.query;
        
        // Build query filter
        const filter: any = { status };
        
        if (category && category !== 'all') {
          filter.category = category;
        }
        
        if (type && type !== 'all') {
          filter.type = type;
        }
        
        if (featured === 'true') {
          filter.featured = true;
        }

        const offers = await collection
          .find(filter)
          .sort({ addedAt: -1 })
          .toArray();

        // Remove MongoDB _id from response
        const cleanOffers = offers.map(({ _id, ...offer }) => offer);
        
        res.status(200).json(cleanOffers);
        break;

      case 'POST':
        const newOffer = req.body;
        
        // Generate unique ID and slug if not provided
        if (!newOffer.id) {
          newOffer.id = Date.now().toString();
        }
        
        if (!newOffer.slug) {
          newOffer.slug = newOffer.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        // Set default values
        newOffer.addedAt = new Date().toISOString();
        newOffer.lastModified = new Date().toISOString();
        newOffer.views = newOffer.views || 0;
        newOffer.unlocks = newOffer.unlocks || 0;
        newOffer.status = newOffer.status || 'active';
        newOffer.useDummyStats = newOffer.useDummyStats || false;

        // Basic XSS prevention
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        newOffer.title = sanitizeString(newOffer.title);
        newOffer.description = sanitizeString(newOffer.description);
        newOffer.category = sanitizeString(newOffer.category);
        
        if (Array.isArray(newOffer.keywords)) {
          newOffer.keywords = newOffer.keywords.map(sanitizeString);
        }

        const result = await collection.insertOne(newOffer);
        
        res.status(201).json({ 
          message: 'Offer created successfully', 
          id: result.insertedId 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 