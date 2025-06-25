import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, safeDbOperation } from '../../../lib/mongodb';
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
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');

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
        
        // Build MongoDB filter
        let filter: any = {};
        
        // Handle published filter - support 'all' for admin access
        if (published === 'true') {
          filter.published = true;
        } else if (published === 'false') {
          filter.published = false;
        }
        // If published === 'all', show all articles (no filter)
        
        if (category && category !== 'all') {
          filter.category = { $regex: category as string, $options: 'i' };
        }
        
        if (tag) {
          filter.tags = { $regex: tag as string, $options: 'i' };
        }
        
        if (search) {
          const searchTerm = search as string;
          filter.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { summary: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } },
            { tags: { $regex: searchTerm, $options: 'i' } }
          ];
        }

        console.log('MongoDB filter:', JSON.stringify(filter));

        try {
          // Handle pagination
          const pageNum = parseInt(page as string) || 1;
          const limitNum = parseInt(limit as string) || 0;
          
          if (limitNum > 0) {
            const skip = (pageNum - 1) * limitNum;
            
            const [articles, total] = await Promise.all([
              collection
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .toArray(),
              collection.countDocuments(filter)
            ]);
            
            console.log(`Found ${articles.length} articles with pagination (total: ${total})`);
            
            const response = {
              articles: articles.map(article => ({
                ...article,
                _id: article._id.toString()
              })),
              pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
              }
            };
            
            res.status(200).json(response);
          } else {
            // Get articles without pagination
            const query = collection.find(filter).sort({ createdAt: -1 });
            
            if (limit && !isNaN(Number(limit))) {
              query.limit(Number(limit));
            }
            
            const articles = await query.toArray();
            console.log(`Found ${articles.length} articles without pagination`);
            
            res.status(200).json(articles.map(article => ({
              ...article,
              _id: article._id.toString()
            })));
          }
        } catch (error) {
          console.error('Error fetching articles from MongoDB:', error);
          // Return empty array on error
          res.status(200).json([]);
        }
        break;

      case 'POST':
        const newArticle = req.body;
        
        // Validate required fields
        if (!newArticle.title || !newArticle.content) {
          return res.status(400).json({ 
            message: 'Title and content are required' 
          });
        }
        
        // Generate unique ID and slug if not provided
        const articleId = newArticle.id || Date.now().toString();
        const baseSlug = newArticle.slug || newArticle.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Ensure slug is unique
        let finalSlug = baseSlug;
        let counter = 1;
        while (await collection.findOne({ slug: finalSlug })) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Basic XSS prevention
        const sanitizeString = (str: string) => {
          return str ? str.replace(/[<>]/g, '').trim() : str;
        };

        // Create the new article object
        const articleToAdd: Article = {
          id: articleId,
          slug: finalSlug,
          title: sanitizeString(newArticle.title),
          summary: sanitizeString(newArticle.summary || ''),
          content: newArticle.content, // Don't sanitize content as it may contain HTML
          image: newArticle.image || '',
          author: sanitizeString(newArticle.author || 'Anonymous'),
          category: sanitizeString(newArticle.category || 'General'),
          tags: Array.isArray(newArticle.tags) 
            ? newArticle.tags.map(sanitizeString) 
            : [],
          published: newArticle.published !== undefined ? newArticle.published : false,
          views: newArticle.views || 0,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Insert into MongoDB
        const result = await collection.insertOne(articleToAdd);
        
        res.status(201).json({ 
          message: 'Article created successfully', 
          id: articleId,
          slug: finalSlug,
          article: {
            ...articleToAdd,
            _id: result.insertedId.toString()
          }
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Articles API error:', error);
    
    if (req.method === 'GET') {
      // Return empty array for GET requests on error
      res.status(200).json([]);
    } else {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : undefined
      });
    }
  }
} 