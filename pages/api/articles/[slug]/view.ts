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
    console.log(`Tracking view for article with slug: ${slug}`);
    
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');

    // First check if the article exists
    const article = await collection.findOne({ slug: slug });
    
    if (!article) {
      console.log(`Article with slug ${slug} not found for view tracking`);
      return res.status(404).json({ message: 'Article not found' });
    }

    console.log(`Incrementing view count for article: ${article.title}`);
    
    // Increment views count
    const result = await collection.updateOne(
      { slug: slug },
      { 
        $inc: { views: 1 },
        $set: { lastModified: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      console.log(`Failed to increment view count for article: ${slug}`);
      return res.status(404).json({ message: 'Article not found' });
    }

    // Get the updated view count
    const updatedArticle = await collection.findOne({ slug: slug });
    const viewCount = updatedArticle?.views || article.views + 1;
    
    console.log(`View count for article ${slug} updated to ${viewCount}`);
    
    res.status(200).json({ 
      message: 'View tracked successfully',
      views: viewCount,
      slug: slug
    });
  } catch (error) {
    console.error('View tracking error:', error);
    
    // Don't fail the request if view tracking fails
    res.status(200).json({ 
      message: 'View tracking attempted',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
} 