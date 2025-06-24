import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Article slug is required' });
  }

  try {
    // Try MongoDB first
    const { db } = await connectToDatabase();
    const collection = db.collection<Article>('articles');

    switch (req.method) {
      case 'GET':
        // Find article by slug
        const article = await collection.findOne({ slug: slug });

        if (!article) {
          return res.status(404).json({ message: 'Article not found' });
        }

        // Check if article is published (unless it's an admin request)
        if (!article.published) {
          return res.status(404).json({ message: 'Article not found' });
        }

        // Increment views count
        await collection.updateOne(
          { _id: article._id },
          { 
            $inc: { views: 1 },
            $set: { lastModified: new Date().toISOString() }
          }
        );

        // Return article without MongoDB _id
        const { _id, ...articleData } = article;
        res.status(200).json({ ...articleData, views: article.views + 1 });
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

          return res.status(200).json({ message: 'View count incremented successfully' });
        }

        // Handle general updates
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        const updateData = {
          ...updatedArticleData,
          lastModified: new Date().toISOString(),
          title: sanitizeString(updatedArticleData.title || ''),
          summary: sanitizeString(updatedArticleData.summary || ''),
          author: sanitizeString(updatedArticleData.author || ''),
          category: sanitizeString(updatedArticleData.category || ''),
          tags: Array.isArray(updatedArticleData.tags) 
            ? updatedArticleData.tags.map(sanitizeString)
            : updatedArticleData.tags
        };

        const updateResult = await collection.updateOne(
          { slug: slug },
          { $set: updateData }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ message: 'Article not found' });
        }

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
    console.error('MongoDB error, falling back to JSON:', error);
    
    // Fallback to JSON file if MongoDB is not available
    try {
      const filePath = path.join(process.cwd(), 'data', 'articles.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const articles: Article[] = JSON.parse(fileContents);

      switch (req.method) {
        case 'GET':
          // Find article by slug
          const article = articles.find(a => a.slug === slug);

          if (!article || !article.published) {
            return res.status(404).json({ message: 'Article not found' });
          }

          res.status(200).json(article);
          break;

        case 'PUT':
          const updatedArticleData = req.body;

          if (updatedArticleData.action === 'incrementViews') {
            const articleIndex = articles.findIndex(a => a.slug === slug);
            
            if (articleIndex === -1) {
              return res.status(404).json({ message: 'Article not found' });
            }

            return res.status(200).json({ 
              message: 'View count incremented successfully (fallback mode)',
              views: articles[articleIndex].views + 1
            });
          }

          res.status(200).json({ message: 'Article updated successfully (fallback mode)' });
          break;

        case 'DELETE':
          const articleToDelete = articles.find(a => a.slug === slug);
          
          if (!articleToDelete) {
            return res.status(404).json({ message: 'Article not found' });
          }

          res.status(200).json({ message: 'Article deleted successfully (fallback mode)' });
          break;

        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      
      if (req.method === 'GET') {
        res.status(404).json({ message: 'Article not found' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
} 