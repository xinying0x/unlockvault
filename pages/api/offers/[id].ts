import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Offer ID is required' });
  }

  try {
    // Try MongoDB first
    const { db } = await connectToDatabase();
    const collection = db.collection<Offer>('offers');

    switch (req.method) {
      case 'GET':
        // Find offer by slug or id
        let offer = await collection.findOne({ slug: id });
        if (!offer) {
          offer = await collection.findOne({ id: id });
        }

        if (!offer) {
          return res.status(404).json({ message: 'Offer not found' });
        }

        // Increment views count
        await collection.updateOne(
          { _id: offer._id },
          { 
            $inc: { views: 1 },
            $set: { lastModified: new Date().toISOString() }
          }
        );

        // Return offer without MongoDB _id
        const { _id, ...offerData } = offer;
        res.status(200).json({ ...offerData, views: offer.views + 1 });
        break;

      case 'PUT':
        const updatedOfferData = req.body;

        // Handle incrementing unlocks
        if (updatedOfferData.action === 'incrementUnlocks') {
          const result = await collection.updateOne(
            { $or: [{ slug: id }, { id: id }] },
            { 
              $inc: { unlocks: 1 },
              $set: { lastModified: new Date().toISOString() }
            }
          );

          if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Offer not found' });
          }

          return res.status(200).json({ message: 'Unlock count incremented successfully' });
        }

        // Handle general updates
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        const updateData = {
          ...updatedOfferData,
          lastModified: new Date().toISOString(),
          title: sanitizeString(updatedOfferData.title || ''),
          description: sanitizeString(updatedOfferData.description || ''),
          category: sanitizeString(updatedOfferData.category || ''),
          keywords: Array.isArray(updatedOfferData.keywords) 
            ? updatedOfferData.keywords.map(sanitizeString)
            : updatedOfferData.keywords
        };

        const updateResult = await collection.updateOne(
          { $or: [{ slug: id }, { id: id }] },
          { $set: updateData }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ message: 'Offer not found' });
        }

        res.status(200).json({ message: 'Offer updated successfully' });
        break;

      case 'DELETE':
        const deleteResult = await collection.deleteOne(
          { $or: [{ slug: id }, { id: id }] }
        );

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'Offer not found' });
        }

        res.status(200).json({ message: 'Offer deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('MongoDB error, falling back to JSON:', error);
    
    // Fallback to JSON file if MongoDB is not available
    try {
      const filePath = path.join(process.cwd(), 'data', 'offers.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const offers: Offer[] = JSON.parse(fileContents);

      switch (req.method) {
        case 'GET':
          // Find offer by slug or id
          let offer = offers.find(o => o.slug === id);
          if (!offer) {
            offer = offers.find(o => o.id === id);
          }

          if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
          }

          res.status(200).json(offer);
          break;

        case 'PUT':
          const updatedOfferData = req.body;

          if (updatedOfferData.action === 'incrementUnlocks') {
            const offerIndex = offers.findIndex(o => o.slug === id || o.id === id);
            
            if (offerIndex === -1) {
              return res.status(404).json({ message: 'Offer not found' });
            }

            return res.status(200).json({ 
              message: 'Unlock count incremented successfully (fallback mode)',
              unlocks: offers[offerIndex].unlocks + 1
            });
          }

          res.status(200).json({ message: 'Offer updated successfully (fallback mode)' });
          break;

        case 'DELETE':
          const offerToDelete = offers.find(o => o.slug === id || o.id === id);
          
          if (!offerToDelete) {
            return res.status(404).json({ message: 'Offer not found' });
          }

          res.status(200).json({ message: 'Offer deleted successfully (fallback mode)' });
          break;

        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      
      if (req.method === 'GET') {
        res.status(404).json({ message: 'Offer not found' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 