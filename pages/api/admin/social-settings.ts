import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';

interface SocialSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  whatsapp: string;
  telegram: string;
  email: string;
  website: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('settings');

    switch (req.method) {
      case 'GET':
        // Get social settings
        const settings = await collection.findOne({ type: 'social' });
        
        if (settings) {
          const { _id, type, ...socialSettings } = settings;
          res.status(200).json(socialSettings);
        } else {
          // Return default empty settings
          const defaultSettings: SocialSettings = {
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
        break;

      case 'POST':
        const socialSettings: SocialSettings = req.body;
        
        // Validate the input
        const validPlatforms = [
          'facebook', 'twitter', 'instagram', 'youtube', 'tiktok',
          'linkedin', 'whatsapp', 'telegram', 'email', 'website'
        ];
        
        const filteredSettings: any = { type: 'social' };
        
        validPlatforms.forEach(platform => {
          if (socialSettings[platform as keyof SocialSettings] !== undefined) {
            filteredSettings[platform] = socialSettings[platform as keyof SocialSettings] || '';
          }
        });

        // Update or insert settings
        await collection.updateOne(
          { type: 'social' },
          { $set: filteredSettings },
          { upsert: true }
        );

        res.status(200).json({ 
          message: 'Social settings saved successfully',
          settings: filteredSettings
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Social settings API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 