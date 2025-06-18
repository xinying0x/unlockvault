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
    
    // Fallback to dummy categories when MongoDB is not available
    const dummyCategories = [
      { name: 'Design', description: 'Design and creative tools' },
      { name: 'Productivity', description: 'Office and productivity software' },
      { name: 'Games', description: 'Gaming software and tools' },
      { name: 'Developer Tools', description: 'Programming and development tools' },
      { name: 'Security', description: 'Security and privacy tools' }
    ];

    res.status(200).json(dummyCategories);
  }
} 