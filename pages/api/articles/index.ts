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
  const filePath = path.join(process.cwd(), 'data', 'articles.json');
  
  try {
    // Read existing articles from JSON file
    let articles: Article[] = [];
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      articles = JSON.parse(fileContents);
    }

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
        
        // Filter articles based on query parameters
        let filteredArticles = [...articles];
        
        // Handle published filter - support 'all' for admin access
        if (published === 'true') {
          filteredArticles = filteredArticles.filter(article => article.published);
        } else if (published === 'false') {
          filteredArticles = filteredArticles.filter(article => !article.published);
        }
        // If published === 'all', show all articles (no filter)
        
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

        // Handle pagination
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 0;
        
        if (limitNum > 0) {
          const startIndex = (pageNum - 1) * limitNum;
          const endIndex = startIndex + limitNum;
          const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
          
          const response = {
            articles: paginatedArticles,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: filteredArticles.length,
              pages: Math.ceil(filteredArticles.length / limitNum)
            }
          };
          
          res.status(200).json(response);
        } else {
          // Apply limit if specified without pagination
          if (limit && !isNaN(Number(limit))) {
            filteredArticles = filteredArticles.slice(0, Number(limit));
          }
          
          res.status(200).json(filteredArticles);
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
        while (articles.some(a => a.slug === finalSlug)) {
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

        // Add to articles array
        articles.push(articleToAdd);
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        
        res.status(201).json({ 
          message: 'Article created successfully', 
          id: articleId,
          slug: finalSlug,
          article: articleToAdd
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 