import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, safeDbOperation } from '../../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Article slug is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');

    // First check if the article exists
    const article = await collection.findOne({ slug: slug });
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment views count
    const result = await collection.updateOne(
      { slug: slug },
      { 
        $inc: { views: 1 },
        $set: { lastModified: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Get the updated view count
    const updatedArticle = await collection.findOne({ slug: slug });
    
    res.status(200).json({ 
      message: 'View tracked successfully',
      views: updatedArticle?.views || 0,
      slug: slug
    });
  } catch (error) {
    console.error('View tracking error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 