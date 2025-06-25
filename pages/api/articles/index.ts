import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Article {
  _id?: any;
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
  let articles: Article[] = [];
  
  // Read existing articles
  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      articles = JSON.parse(fileContents);
    }
  } catch (error) {
    console.error('Error reading articles file:', error);
    return res.status(500).json({ message: 'Failed to read articles data' });
  }

  switch (req.method) {
    case 'GET':
      const { search, category, page = '1', limit = '10' } = req.query;
      
      let filteredArticles = articles.filter(article => article.published);
      
      // Apply search filter
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.summary.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply category filter
      if (category && typeof category === 'string' && category !== 'all') {
        filteredArticles = filteredArticles.filter(article => 
          article.category === category
        );
      }
      
      // Sort by creation date (newest first)
      filteredArticles.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Apply pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      const paginatedArticles = filteredArticles.slice(skip, skip + limitNum);
      
      res.status(200).json({
        articles: paginatedArticles,
        pagination: {
          current: pageNum,
          total: Math.ceil(filteredArticles.length / limitNum),
          totalArticles: filteredArticles.length
        }
      });
      break;

    case 'POST':
      const articleData = req.body;
      
      // Validate required fields
      if (!articleData.title || !articleData.slug || !articleData.content) {
        return res.status(400).json({ 
          message: 'Title, slug, and content are required' 
        });
      }

      // Check if slug already exists
      const existingArticle = articles.find(a => a.slug === articleData.slug);
      if (existingArticle) {
        return res.status(400).json({ 
          message: 'Article with this slug already exists' 
        });
      }

      // Sanitize input data
      const sanitizeString = (str: string) => {
        return str ? str.replace(/[<>]/g, '').trim() : str;
      };

      const newArticle = {
        id: Date.now().toString(),
        slug: articleData.slug,
        title: sanitizeString(articleData.title),
        summary: sanitizeString(articleData.summary || ''),
        content: articleData.content, // Keep HTML content as is
        image: articleData.image || '',
        author: sanitizeString(articleData.author || 'Admin'),
        category: sanitizeString(articleData.category || 'General'),
        tags: Array.isArray(articleData.tags) 
          ? articleData.tags.map(sanitizeString)
          : [],
        published: Boolean(articleData.published),
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      articles.push(newArticle);

      try {
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        res.status(201).json({ 
          message: 'Article created successfully',
          article: newArticle
        });
      } catch (writeError) {
        console.error('Could not create article:', writeError);
        res.status(500).json({ message: 'Could not create article - file system may be read-only' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 