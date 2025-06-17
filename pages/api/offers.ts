import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'data', 'offers.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      let { gallery, ...offerData } = req.body;
      // Parse gallery if sent as string
      if (typeof gallery === 'string') {
        try {
          gallery = JSON.parse(gallery);
        } catch (e) {
          gallery = [];
        }
      }
      const newOffer = {
        id: Date.now().toString(),
        slug: offerData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        addedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        views: 0,
        unlocks: 0,
        status: 'active',
        ...offerData,
        gallery: Array.isArray(gallery) ? gallery : [],
      };
      let offers = [];
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        offers = JSON.parse(data);
      }
      offers.push(newOffer);
      fs.writeFileSync(DATA_FILE, JSON.stringify(offers, null, 2), 'utf-8');
      res.status(201).json({ message: 'Offer created successfully', offer: newOffer });
    } catch (error) {
      console.error('Failed to create offer:', error);
      res.status(500).json({ message: 'Failed to create offer', error: (error as Error).message });
    }
  } else if (req.method === 'GET') {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return res.status(200).json([]);
      }
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const offers = JSON.parse(data);
      res.status(200).json(offers);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      res.status(500).json({ message: 'Failed to fetch offers', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 