import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { autoSyncOffers } from '../../../lib/syncOffers';

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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Offer ID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
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
          { $inc: { views: 1 } }
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
            { $inc: { unlocks: 1 } }
          );

          if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Offer not found' });
          }

          return res.status(200).json({ message: 'Unlock count incremented successfully' });
        }

        // Handle lockerLinks which might be stringified from frontend
        let parsedLockerLinks = updatedOfferData.lockerLinks;
        if (typeof updatedOfferData.lockerLinks === 'string') {
          try {
            parsedLockerLinks = JSON.parse(updatedOfferData.lockerLinks);
          } catch (e) {
            console.error('Error parsing lockerLinks in PUT:', e);
            return res.status(400).json({ message: 'Invalid lockerLinks format' });
          }
        }

        // Basic XSS prevention - sanitize strings
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        const updateData = {
          ...updatedOfferData,
          lockerLinks: parsedLockerLinks,
          lastModified: new Date().toISOString(),
          title: sanitizeString(updatedOfferData.title),
          description: sanitizeString(updatedOfferData.description),
          category: sanitizeString(updatedOfferData.category),
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

        // Auto-sync to JSON file for search
        await autoSyncOffers();

        res.status(200).json({ message: 'Offer updated successfully' });
        break;

      case 'DELETE':
        const deleteResult = await collection.deleteOne(
          { $or: [{ slug: id }, { id: id }] }
        );

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'Offer not found' });
        }

        // Auto-sync to JSON file for search
        await autoSyncOffers();

        res.status(200).json({ message: 'Offer deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 