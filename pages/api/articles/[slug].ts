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
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Article slug is required' });
  }

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
      // Find article by slug
      const article = articles.find(a => a.slug === slug);

      if (!article || !article.published) {
        return res.status(404).json({ message: 'Article not found' });
      }

      // Increment views count
      article.views = (article.views || 0) + 1;
      article.lastModified = new Date().toISOString();

      // Write back to file (only in development)
      try {
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
      } catch (writeError) {
        console.log('Could not update view count (read-only environment)');
      }

      res.status(200).json(article);
      break;

    case 'PUT':
      const updatedArticleData = req.body;

      // Handle view increment
      if (updatedArticleData.action === 'incrementViews') {
        const articleIndex = articles.findIndex(a => a.slug === slug);
        
        if (articleIndex === -1) {
          return res.status(404).json({ message: 'Article not found' });
        }

        articles[articleIndex].views = (articles[articleIndex].views || 0) + 1;
        articles[articleIndex].lastModified = new Date().toISOString();

        try {
          fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        } catch (writeError) {
          console.error('Could not update view count:', writeError);
          return res.status(500).json({ message: 'Could not update view count' });
        }

        return res.status(200).json({ 
          message: 'View count incremented successfully',
          views: articles[articleIndex].views
        });
      }

      // Handle general updates
      const existingArticleIndex = articles.findIndex(a => a.slug === slug);
      
      if (existingArticleIndex === -1) {
        return res.status(404).json({ message: 'Article not found' });
      }

      // Sanitize input data
      const sanitizeString = (str: string) => {
        return str ? str.replace(/[<>]/g, '').trim() : str;
      };

      const updateData = {
        ...articles[existingArticleIndex],
        ...updatedArticleData,
        lastModified: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: sanitizeString(updatedArticleData.title || articles[existingArticleIndex].title),
        summary: sanitizeString(updatedArticleData.summary || articles[existingArticleIndex].summary),
        author: sanitizeString(updatedArticleData.author || articles[existingArticleIndex].author),
        category: sanitizeString(updatedArticleData.category || articles[existingArticleIndex].category),
        tags: Array.isArray(updatedArticleData.tags) 
          ? updatedArticleData.tags.map(sanitizeString)
          : articles[existingArticleIndex].tags
      };

      // Remove _id from update data
      delete updateData._id;

      articles[existingArticleIndex] = updateData;

      try {
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        res.status(200).json({ message: 'Article updated successfully' });
      } catch (writeError) {
        console.error('Could not update article:', writeError);
        res.status(500).json({ message: 'Could not update article - file system may be read-only' });
      }
      break;

    case 'DELETE':
      const articleToDeleteIndex = articles.findIndex(a => a.slug === slug);

      if (articleToDeleteIndex === -1) {
        return res.status(404).json({ message: 'Article not found' });
      }

      articles.splice(articleToDeleteIndex, 1);

      try {
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        res.status(200).json({ message: 'Article deleted successfully' });
      } catch (writeError) {
        console.error('Could not delete article:', writeError);
        res.status(500).json({ message: 'Could not delete article - file system may be read-only' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 