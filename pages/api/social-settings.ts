import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('settings');

    // Get social settings
    const settings = await collection.findOne({ type: 'social' });
    
    if (settings) {
      const { _id, type, ...socialSettings } = settings;
      res.status(200).json(socialSettings);
    } else {
      // Return default empty settings
      const defaultSettings = {
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
        whatsapp: '',
        telegram: '',
        email: '',
        website: ''
      };
      res.status(200).json(defaultSettings);
    }
  } catch (error) {
    console.error('Social settings API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 