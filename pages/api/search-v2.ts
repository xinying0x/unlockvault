import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { cache } from '../../lib/cache';
import { logger } from '../../lib/logger';
import { checkRateLimit, getClientIP } from '../../lib/security';

interface SearchResult {
  id: string;
  title: string;
  type: 'tool' | 'app' | 'game';
  category: string;
  slug: string;
  image: string;
  relevance: number;
  description: string;
  views: number;
  unlocks: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const startTime = Date.now();
  const clientIP = getClientIP(req);

  // Rate limiting
  if (!checkRateLimit(clientIP, 50, 60 * 1000)) { // 50 requests per minute
    return res.status(429).json({ message: 'Too many requests' });
  }

  try {
    const { q: query, limit = '10', type, category } = req.query;

    // Create cache key
    const cacheKey = `search:${query || 'all'}:${type || 'all'}:${category || 'all'}:${limit}`;
    
    // Check cache first
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
      logger.debug('Search cache hit', { query, type, category });
      return res.json(cachedResults);
    }

    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('offers');

    let mongoQuery: any = { status: 'active' };
    let results: SearchResult[] = [];

    // Build MongoDB query
    if (type && type !== 'all') {
      mongoQuery.type = type;
    }

    if (category && category !== 'all') {
      mongoQuery.category = category;
    }

    if (query && typeof query === 'string' && query.trim().length >= 2) {
      const searchQuery = query.trim();
      
      // Use MongoDB text search if available, otherwise use regex
      mongoQuery.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { keywords: { $in: [new RegExp(searchQuery, 'i')] } },
        { category: { $regex: searchQuery, $options: 'i' } }
      ];

      // Get all matching documents
      const items = await collection
        .find(mongoQuery)
        .limit(parseInt(limit as string) * 2) // Get more to allow for relevance sorting
        .toArray();

      // Calculate relevance scores
      items.forEach(item => {
        let relevance = 0;
        const searchLower = searchQuery.toLowerCase();
        const titleLower = item.title.toLowerCase();
        const descLower = item.description.toLowerCase();

        // Title match (highest priority)
        if (titleLower.includes(searchLower)) {
          relevance += 10;
          if (titleLower.startsWith(searchLower)) {
            relevance += 5; // Boost for prefix match
          }
        }

        // Description match
        if (descLower.includes(searchLower)) {
          relevance += 3;
        }

        // Keywords match
        if (item.keywords && Array.isArray(item.keywords)) {
          item.keywords.forEach((keyword: string) => {
            if (keyword.toLowerCase().includes(searchLower)) {
              relevance += 2;
            }
          });
        }

        // Category match
        if (item.category.toLowerCase().includes(searchLower)) {
          relevance += 4;
        }

        // Boost based on popularity
        relevance += Math.log(item.views + 1) * 0.1;
        relevance += Math.log(item.unlocks + 1) * 0.2;

        if (relevance > 0) {
          const { _id, ...cleanItem } = item;
          results.push({
            id: cleanItem.id,
            title: cleanItem.title,
            type: cleanItem.type,
            category: cleanItem.category,
            slug: cleanItem.slug,
            image: cleanItem.image,
            description: cleanItem.description,
            views: cleanItem.views,
            unlocks: cleanItem.unlocks,
            relevance
          });
        }
      });

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);
    } else {
      // No search query, return all items sorted by popularity
      const items = await collection
        .find(mongoQuery)
        .sort({ views: -1, unlocks: -1 })
        .limit(parseInt(limit as string))
        .toArray();

      results = items.map(item => {
        const { _id, ...cleanItem } = item;
        return {
          id: cleanItem.id,
          title: cleanItem.title,
          type: cleanItem.type,
          category: cleanItem.category,
          slug: cleanItem.slug,
          image: cleanItem.image,
          description: cleanItem.description,
          views: cleanItem.views,
          unlocks: cleanItem.unlocks,
          relevance: 1
        };
      });
    }

    // Limit final results
    const finalResults = results.slice(0, parseInt(limit as string));

    // Cache results for 5 minutes
    cache.set(cacheKey, finalResults, 5);

    const duration = Date.now() - startTime;
    logger.performance('Search operation', duration, { 
      query, 
      type, 
      category, 
      resultCount: finalResults.length,
      ip: clientIP
    });

    res.json(finalResults);

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Search error', error, { 
      query: req.query.q, 
      ip: clientIP,
      duration 
    });
    res.status(500).json({ message: 'Internal server error' });
  }
} 