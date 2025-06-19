import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import clientPromise from '../../lib/mongodb';

interface Offer {
  id: string;
  slug: string;
  title: string;
  image?: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  addedAt: string;
  featured?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('offers');

    // Get all active offers with minimal data for sitemap
    const offers = await collection
      .find(
        { status: 'active' },
        { 
          projection: { 
            _id: 1, 
            slug: 1, 
            title: 1, 
            addedAt: 1, 
            lastModified: 1 
          } 
        }
      )
      .sort({ addedAt: -1 })
      .toArray();

    const sitemapData = offers.map(offer => ({
      id: offer._id.toString(),
      slug: offer.slug || offer.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      lastmod: offer.lastModified || offer.addedAt || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }));

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(sitemapData);
  } catch (error) {
    console.error('Sitemap API error:', error);
    res.status(500).json({ error: 'Failed to fetch sitemap data' });
  }
} 