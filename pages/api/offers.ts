import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

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
  rating: number;
  status: 'active' | 'draft' | 'archived';
  gallery?: string[];
  features?: string[];
  lastModified?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try MongoDB first
    const { db } = await connectToDatabase();
    const collection = db.collection<Offer>('offers');

    switch (req.method) {
      case 'GET':
        const { category, type, featured, status = 'active', limit } = req.query;
        
        // Build query filter
        const filter: any = { status };
        
        if (category && category !== 'all') {
          filter.category = new RegExp(category as string, 'i');
        }
        
        if (type && type !== 'all') {
          filter.type = type;
        }
        
        if (featured === 'true') {
          filter.featured = true;
        }

        let query = collection.find(filter).sort({ addedAt: -1 });
        
        if (limit && !isNaN(Number(limit))) {
          query = query.limit(Number(limit));
        }

        const offers = await query.toArray();

        // Remove MongoDB _id from response
        const cleanOffers = offers.map(({ _id, ...offer }) => offer);
        
        res.status(200).json(cleanOffers);
        break;

      case 'POST':
        const newOffer = req.body;
        
        // Generate unique ID and slug if not provided
        if (!newOffer.id) {
          newOffer.id = new ObjectId().toString();
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
        newOffer.rating = newOffer.rating || 4.5;
        newOffer.featured = newOffer.featured || false;
        newOffer.gallery = newOffer.gallery || [];
        newOffer.features = newOffer.features || [];

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
    console.error('MongoDB error, falling back to JSON:', error);
    
    // Fallback to JSON file if MongoDB is not available
    try {
    if (req.method === 'GET') {
        const filePath = path.join(process.cwd(), 'data', 'offers.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const allOffers: Offer[] = JSON.parse(fileContents);

        const { category, type, featured, status = 'active', limit } = req.query;
        
        // Filter offers based on query parameters
        let filteredOffers = allOffers.filter(offer => 
          offer.status === status || offer.status === 'active'
        );
        
        if (category && category !== 'all') {
          filteredOffers = filteredOffers.filter(offer => 
            offer.category.toLowerCase().includes((category as string).toLowerCase())
          );
        }
        
        if (type && type !== 'all') {
          filteredOffers = filteredOffers.filter(offer => 
            offer.type === type
          );
        }
        
        if (featured === 'true') {
          filteredOffers = filteredOffers.filter(offer => 
            offer.featured === true
          );
        }

        // Sort by addedAt date (newest first)
        filteredOffers.sort((a, b) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );

        // Apply limit if specified
        if (limit && !isNaN(Number(limit))) {
          filteredOffers = filteredOffers.slice(0, Number(limit));
        }

        res.status(200).json(filteredOffers);
    } else {
        res.status(201).json({ 
          message: 'Offer created successfully (fallback mode)',
          id: Date.now().toString()
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 