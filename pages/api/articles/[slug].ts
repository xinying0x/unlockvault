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
  updatedAt?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Article slug is required' });
  }

  // Always try JSON fallback first since MongoDB might not be available
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles.json');
    let articles: Article[] = [];
    
    // Read existing articles
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      articles = JSON.parse(fileContents);
    }

    switch (req.method) {
      case 'GET':
        // Find article by slug
        const article = articles.find(a => a.slug === slug);

        if (!article || !article.published) {
          return res.status(404).json({ message: 'Article not found' });
        }

        // Increment views count in JSON file
        let articleIndex = articles.findIndex(a => a.slug === slug);
        if (articleIndex !== -1) {
          articles[articleIndex].views = (articles[articleIndex].views || 0) + 1;
          articles[articleIndex].lastModified = new Date().toISOString();
          
          // Write back to file
          fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        }

        res.status(200).json({ ...article, views: (article.views || 0) + 1 });
        break;

      case 'PUT':
        const updatedArticleData = req.body;

        // Handle view increment
        if (updatedArticleData.action === 'incrementViews') {
          articleIndex = articles.findIndex(a => a.slug === slug);
          
          if (articleIndex === -1) {
            return res.status(404).json({ message: 'Article not found' });
          }

          articles[articleIndex].views = (articles[articleIndex].views || 0) + 1;
          articles[articleIndex].lastModified = new Date().toISOString();
          
          // Write back to file
          fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));

          return res.status(200).json({ 
            message: 'View count incremented successfully',
            views: articles[articleIndex].views
          });
        }

        // Handle general updates
        articleIndex = articles.findIndex(a => a.slug === slug);
        
        if (articleIndex === -1) {
          return res.status(404).json({ message: 'Article not found' });
        }

        // Sanitize input data
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        const updateData = {
          ...articles[articleIndex],
          ...updatedArticleData,
          lastModified: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title: sanitizeString(updatedArticleData.title || articles[articleIndex].title),
          summary: sanitizeString(updatedArticleData.summary || articles[articleIndex].summary),
          author: sanitizeString(updatedArticleData.author || articles[articleIndex].author),
          category: sanitizeString(updatedArticleData.category || articles[articleIndex].category),
          tags: Array.isArray(updatedArticleData.tags) 
            ? updatedArticleData.tags.map(sanitizeString)
            : articles[articleIndex].tags
        };

        articles[articleIndex] = updateData;
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));

        res.status(200).json({ message: 'Article updated successfully' });
        break;

      case 'DELETE':
        const deleteIndex = articles.findIndex(a => a.slug === slug);

        if (deleteIndex === -1) {
          return res.status(404).json({ message: 'Article not found' });
        }

        // Remove article from array
        articles.splice(deleteIndex, 1);
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));

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
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 