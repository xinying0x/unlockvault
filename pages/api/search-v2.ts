import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

interface Offer {
  _id?: ObjectId;
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  lockerLinks: { [key: string]: string };
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  rating: number;
  status: 'active' | 'draft' | 'archived';
  gallery?: string[];
  features?: string[];
}

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
}

interface SearchResult {
  type: 'offer' | 'article';
  data: Offer | Article;
  relevance: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { 
    q: query, 
    type, 
    category, 
    limit = '20',
    page = '1' 
  } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Try MongoDB first
    const { db } = await connectToDatabase();
    const offersCollection = db.collection<Offer>('offers');
    const articlesCollection = db.collection<Article>('articles');

    const searchResults: SearchResult[] = [];
    const searchTerm = query.toLowerCase().trim();
    const limitNum = parseInt(limit as string) || 20;
    const pageNum = parseInt(page as string) || 1;
    const skip = (pageNum - 1) * limitNum;

    // Search offers if type is not specified or is 'offer'
    if (!type || type === 'offer' || type === 'all') {
      const offerFilter: any = { status: 'active' };
      
      if (category && category !== 'all') {
        offerFilter.category = new RegExp(category as string, 'i');
      }

      // Build search query for offers
      offerFilter.$or = [
        { title: new RegExp(searchTerm, 'i') },
        { description: new RegExp(searchTerm, 'i') },
        { keywords: { $in: [new RegExp(searchTerm, 'i')] } },
        { category: new RegExp(searchTerm, 'i') }
      ];

      const offers = await offersCollection
        .find(offerFilter)
        .sort({ views: -1, addedAt: -1 })
        .toArray();

      // Calculate relevance for offers
      offers.forEach(offer => {
        let relevance = 0;
        const titleMatch = offer.title.toLowerCase().includes(searchTerm);
        const descMatch = offer.description.toLowerCase().includes(searchTerm);
        const keywordMatch = offer.keywords.some(k => k.toLowerCase().includes(searchTerm));
        const categoryMatch = offer.category.toLowerCase().includes(searchTerm);

        if (titleMatch) relevance += 10;
        if (descMatch) relevance += 5;
        if (keywordMatch) relevance += 7;
        if (categoryMatch) relevance += 3;
        if (offer.featured) relevance += 2;

        const { _id, ...offerData } = offer;
        searchResults.push({
          type: 'offer',
          data: offerData,
          relevance
        });
      });
    }

    // Search articles if type is not specified or is 'article'
    if (!type || type === 'article' || type === 'all') {
      const articleFilter: any = { published: true };

    if (category && category !== 'all') {
        articleFilter.category = new RegExp(category as string, 'i');
      }

      // Build search query for articles
      articleFilter.$or = [
        { title: new RegExp(searchTerm, 'i') },
        { summary: new RegExp(searchTerm, 'i') },
        { content: new RegExp(searchTerm, 'i') },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { category: new RegExp(searchTerm, 'i') }
      ];

      const articles = await articlesCollection
        .find(articleFilter)
        .sort({ views: -1, createdAt: -1 })
        .toArray();

      // Calculate relevance for articles
      articles.forEach(article => {
        let relevance = 0;
        const titleMatch = article.title.toLowerCase().includes(searchTerm);
        const summaryMatch = article.summary.toLowerCase().includes(searchTerm);
        const contentMatch = article.content.toLowerCase().includes(searchTerm);
        const tagMatch = article.tags.some(t => t.toLowerCase().includes(searchTerm));
        const categoryMatch = article.category.toLowerCase().includes(searchTerm);

        if (titleMatch) relevance += 10;
        if (summaryMatch) relevance += 7;
        if (contentMatch) relevance += 5;
        if (tagMatch) relevance += 6;
        if (categoryMatch) relevance += 3;

        const { _id, ...articleData } = article;
        searchResults.push({
          type: 'article',
          data: articleData,
          relevance
        });
      });
    }

    // Sort by relevance and apply pagination
    searchResults.sort((a, b) => b.relevance - a.relevance);
    
    const total = searchResults.length;
    const paginatedResults = searchResults.slice(skip, skip + limitNum);

    const response = {
      results: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      query: searchTerm,
      filters: {
        type: type || 'all',
        category: category || 'all'
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('MongoDB search error, falling back to JSON:', error);
    
    // Fallback to JSON files if MongoDB is not available
    try {
      const searchResults: SearchResult[] = [];
      const searchTerm = query.toLowerCase().trim();
      const limitNum = parseInt(limit as string) || 20;
      const pageNum = parseInt(page as string) || 1;
      const skip = (pageNum - 1) * limitNum;

      // Search offers from JSON
      if (!type || type === 'offer' || type === 'all') {
        // Prefer /tmp on serverless (e.g., Vercel), fallback to repo data
        const offersPaths = [
          path.join('/tmp', 'unlockvault', 'offers.json'),
          path.join(process.cwd(), 'data', 'offers.json'),
        ];
        const offersPath = offersPaths.find((p) => fs.existsSync(p)) || offersPaths[1];
        const offersContent = fs.readFileSync(offersPath, 'utf8');
        const offers: Offer[] = JSON.parse(offersContent);

        offers
          .filter(offer => offer.status === 'active')
          .filter(offer => {
            if (category && category !== 'all') {
              return offer.category.toLowerCase().includes((category as string).toLowerCase());
            }
            return true;
          })
          .forEach(offer => {
            const titleMatch = offer.title.toLowerCase().includes(searchTerm);
            const descMatch = offer.description.toLowerCase().includes(searchTerm);
            const keywordMatch = offer.keywords.some(k => k.toLowerCase().includes(searchTerm));
            const categoryMatch = offer.category.toLowerCase().includes(searchTerm);

            if (titleMatch || descMatch || keywordMatch || categoryMatch) {
              let relevance = 0;
              if (titleMatch) relevance += 10;
              if (descMatch) relevance += 5;
              if (keywordMatch) relevance += 7;
              if (categoryMatch) relevance += 3;
              if (offer.featured) relevance += 2;

              searchResults.push({
                type: 'offer',
                data: offer,
                relevance
              });
            }
          });
      }

      // Search articles from JSON
      if (!type || type === 'article' || type === 'all') {
        // Prefer /tmp on serverless (e.g., Vercel), fallback to repo data
        const articlesPaths = [
          path.join('/tmp', 'unlockvault', 'articles.json'),
          path.join(process.cwd(), 'data', 'articles.json'),
        ];
        const articlesPath = articlesPaths.find((p) => fs.existsSync(p)) || articlesPaths[1];
        const articlesContent = fs.readFileSync(articlesPath, 'utf8');
        const articles: Article[] = JSON.parse(articlesContent);

        articles
          .filter(article => article.published)
          .filter(article => {
            if (category && category !== 'all') {
              return article.category.toLowerCase().includes((category as string).toLowerCase());
            }
            return true;
          })
          .forEach(article => {
            const titleMatch = article.title.toLowerCase().includes(searchTerm);
            const summaryMatch = article.summary.toLowerCase().includes(searchTerm);
            const contentMatch = article.content.toLowerCase().includes(searchTerm);
            const tagMatch = article.tags.some(t => t.toLowerCase().includes(searchTerm));
            const categoryMatch = article.category.toLowerCase().includes(searchTerm);

            if (titleMatch || summaryMatch || contentMatch || tagMatch || categoryMatch) {
              let relevance = 0;
              if (titleMatch) relevance += 10;
              if (summaryMatch) relevance += 7;
              if (contentMatch) relevance += 5;
              if (tagMatch) relevance += 6;
              if (categoryMatch) relevance += 3;

              searchResults.push({
                type: 'article',
                data: article,
                relevance
              });
            }
          });
      }

      // Sort by relevance and apply pagination
      searchResults.sort((a, b) => b.relevance - a.relevance);
      
      const total = searchResults.length;
      const paginatedResults = searchResults.slice(skip, skip + limitNum);

      const response = {
        results: paginatedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        },
        query: searchTerm,
        filters: {
          type: type || 'all',
          category: category || 'all'
        }
      };

      res.status(200).json(response);

    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError);
      res.status(500).json({ message: 'Search service temporarily unavailable' });
    }
  }
}