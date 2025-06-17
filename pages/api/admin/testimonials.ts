import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('testimonials');

    switch (req.method) {
      case 'GET':
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const testimonials = await collection
          .find(filter)
          .sort({ createdAt: -1 })
          .toArray();

        // Remove MongoDB _id from response
        const cleanTestimonials = testimonials.map(({ _id, ...testimonial }) => testimonial);
        res.status(200).json(cleanTestimonials);
        break;

      case 'POST':
        const newTestimonial = {
          ...req.body,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: req.body.status || 'pending'
        };

        await collection.insertOne(newTestimonial);
        res.status(201).json({ message: 'Testimonial created successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 