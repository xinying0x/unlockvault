import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface Article {
  _id?: ObjectId;
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
  lastModified?: string;
  updatedAt?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Article slug is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');

    switch (req.method) {
      case 'GET':
        // Find article by slug - don't filter by published status
        const article = await collection.findOne({ slug: slug });

        if (!article) {
          return res.status(404).json({ message: 'Article not found' });
        }

        // Return article without incrementing views
        const returnedArticle = {
          ...article,
          _id: article._id.toString()
        };

        res.status(200).json(returnedArticle);
        break;

      case 'PUT':
        const updatedArticleData = req.body;

        // Handle view increment
        if (updatedArticleData.action === 'incrementViews') {
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

          const updatedArticle = await collection.findOne({ slug: slug });
          return res.status(200).json({ 
            message: 'View count incremented successfully',
            views: updatedArticle?.views || 0
          });
        }

        // Handle general updates
        const existingArticle = await collection.findOne({ slug: slug });
        
        if (!existingArticle) {
          return res.status(404).json({ message: 'Article not found' });
        }

        // Sanitize input data
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        const updateData = {
          ...updatedArticleData,
          lastModified: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title: sanitizeString(updatedArticleData.title || existingArticle.title),
          summary: sanitizeString(updatedArticleData.summary || existingArticle.summary),
          author: sanitizeString(updatedArticleData.author || existingArticle.author),
          category: sanitizeString(updatedArticleData.category || existingArticle.category),
          tags: Array.isArray(updatedArticleData.tags) 
            ? updatedArticleData.tags.map(sanitizeString)
            : existingArticle.tags
        };

        // Remove _id from update data
        delete updateData._id;

        await collection.updateOne(
          { slug: slug },
          { $set: updateData }
        );

        res.status(200).json({ message: 'Article updated successfully' });
        break;

      case 'DELETE':
        const deleteResult = await collection.deleteOne({ slug: slug });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'Article not found' });
        }

        res.status(200).json({ message: 'Article deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Article API error:', error);
    
    // If it's a GET request and we can't find the article, return 404
    if (req.method === 'GET') {
      res.status(404).json({ message: 'Article not found' });
    } else {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : undefined
      });
    }
  }
} 