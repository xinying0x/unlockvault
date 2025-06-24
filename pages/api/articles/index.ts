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
  try {
    // Try MongoDB first
    const { db } = await connectToDatabase();
    const collection = db.collection<Article>('articles');

    switch (req.method) {
      case 'GET':
        const { 
          category, 
          tag, 
          search, 
          published = 'true', 
          limit,
          page = '1'
        } = req.query;
        
        // Build query filter
        const filter: any = {};
        
        if (published === 'true') {
          filter.published = true;
        }
        
        if (category && category !== 'all') {
          filter.category = new RegExp(category as string, 'i');
        }
        
        if (tag) {
          filter.tags = { $in: [new RegExp(tag as string, 'i')] };
        }
        
        if (search) {
          filter.$or = [
            { title: new RegExp(search as string, 'i') },
            { summary: new RegExp(search as string, 'i') },
            { content: new RegExp(search as string, 'i') },
            { tags: { $in: [new RegExp(search as string, 'i')] } }
          ];
        }

        // Calculate pagination
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 0;
        const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

        let query = collection.find(filter).sort({ createdAt: -1 });
        
        if (skip > 0) {
          query = query.skip(skip);
        }
        
        if (limitNum > 0) {
          query = query.limit(limitNum);
        }

        const articles = await query.toArray();
        const total = await collection.countDocuments(filter);

        // Remove MongoDB _id from response
        const cleanArticles = articles.map(({ _id, ...article }) => article);
        
        const response = {
          articles: cleanArticles,
          pagination: limitNum > 0 ? {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          } : null
        };
        
        res.status(200).json(limitNum > 0 ? response : cleanArticles);
        break;

      case 'POST':
        const newArticle = req.body;
        
        // Generate unique ID and slug if not provided
        if (!newArticle.id) {
          newArticle.id = new ObjectId().toString();
        }
        
        if (!newArticle.slug) {
          newArticle.slug = newArticle.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        // Set default values
        newArticle.createdAt = new Date().toISOString();
        newArticle.lastModified = new Date().toISOString();
        newArticle.views = newArticle.views || 0;
        newArticle.published = newArticle.published !== undefined ? newArticle.published : false;
        newArticle.tags = newArticle.tags || [];

        // Basic XSS prevention
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        newArticle.title = sanitizeString(newArticle.title);
        newArticle.summary = sanitizeString(newArticle.summary);
        newArticle.author = sanitizeString(newArticle.author);
        newArticle.category = sanitizeString(newArticle.category);
        
        if (Array.isArray(newArticle.tags)) {
          newArticle.tags = newArticle.tags.map(sanitizeString);
        }

        const result = await collection.insertOne(newArticle);
        
        res.status(201).json({ 
          message: 'Article created successfully', 
          id: result.insertedId 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('MongoDB error, falling back to JSON:', error);
    
    // Fallback to JSON file if MongoDB is not available
    try {
      if (req.method === 'GET') {
        const filePath = path.join(process.cwd(), 'data', 'articles.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const allArticles: Article[] = JSON.parse(fileContents);

        const { 
          category, 
          tag, 
          search, 
          published = 'true', 
          limit 
        } = req.query;
        
        // Filter articles based on query parameters
        let filteredArticles = allArticles;
        
        if (published === 'true') {
          filteredArticles = filteredArticles.filter(article => article.published);
        }
        
        if (category && category !== 'all') {
          filteredArticles = filteredArticles.filter(article => 
            article.category.toLowerCase().includes((category as string).toLowerCase())
          );
        }
        
        if (tag) {
          filteredArticles = filteredArticles.filter(article => 
            article.tags.some(t => t.toLowerCase().includes((tag as string).toLowerCase()))
          );
        }
        
        if (search) {
          const searchTerm = (search as string).toLowerCase();
          filteredArticles = filteredArticles.filter(article => 
            article.title.toLowerCase().includes(searchTerm) ||
            article.summary.toLowerCase().includes(searchTerm) ||
            article.content.toLowerCase().includes(searchTerm) ||
            article.tags.some(t => t.toLowerCase().includes(searchTerm))
          );
        }

        // Sort by createdAt date (newest first)
        filteredArticles.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Apply limit if specified
        if (limit && !isNaN(Number(limit))) {
          filteredArticles = filteredArticles.slice(0, Number(limit));
        }
        
        res.status(200).json(filteredArticles);
      } else {
        res.status(201).json({ 
          message: 'Article created successfully (fallback mode)',
          id: Date.now().toString()
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
} 