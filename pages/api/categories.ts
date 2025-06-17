import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('categories');

    switch (req.method) {
      case 'GET':
        const categories = await collection.find({}).toArray();
        // Remove MongoDB _id from response
        const cleanCategories = categories.map(({ _id, ...category }) => category);
        res.status(200).json(cleanCategories);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 