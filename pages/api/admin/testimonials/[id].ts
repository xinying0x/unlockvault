import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Testimonial ID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('testimonials');

    switch (req.method) {
      case 'PUT':
        const updateData = req.body;
        const result = await collection.updateOne(
          { id: id },
          { $set: { ...updateData, updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Testimonial not found' });
        }

        res.status(200).json({ message: 'Testimonial updated successfully' });
        break;

      case 'DELETE':
        const deleteResult = await collection.deleteOne({ id: id });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'Testimonial not found' });
        }

        res.status(200).json({ message: 'Testimonial deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 