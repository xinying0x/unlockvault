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
  addedAt?: string;
  rating?: number;
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
    const { 
      q: query, 
      limit = '12', 
      page = '1',
      type, 
      category,
      sort = 'relevance',
      featured
    } = req.query;

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    // Create cache key
    const cacheKey = `search:${query || 'all'}:${type || 'all'}:${category || 'all'}:${sort}:${page}:${limit}`;
    
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

    if (featured === 'true') {
      mongoQuery.featured = true;
    }

    // Get total count for pagination
    const totalCount = await collection.countDocuments(mongoQuery);

    if (query && typeof query === 'string' && query.trim().length >= 1) {
      const searchQuery = query.trim();
      
      // Use MongoDB text search if available, otherwise use regex
      mongoQuery.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { keywords: { $in: [new RegExp(searchQuery, 'i')] } },
        { category: { $regex: searchQuery, $options: 'i' } }
      ];

      // Get all matching documents for relevance calculation
      const items = await collection
        .find(mongoQuery)
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
            views: cleanItem.views || 0,
            unlocks: cleanItem.unlocks || 0,
            addedAt: cleanItem.addedAt,
            rating: cleanItem.rating,
            relevance
          });
        }
      });

      // Sort by relevance or other criteria
      if (sort === 'newest') {
        results.sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime());
      } else if (sort === 'popular') {
        results.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (sort === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        results.sort((a, b) => b.relevance - a.relevance);
      }
    } else {
      // No search query, return all items
      let sortQuery: any = {};
      
      if (sort === 'newest') {
        sortQuery = { addedAt: -1 };
      } else if (sort === 'popular') {
        sortQuery = { views: -1, unlocks: -1 };
      } else if (sort === 'rating') {
        sortQuery = { rating: -1 };
      } else {
        sortQuery = { views: -1, unlocks: -1 };
      }

      const items = await collection
        .find(mongoQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
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
          views: cleanItem.views || 0,
          unlocks: cleanItem.unlocks || 0,
          addedAt: cleanItem.addedAt,
          rating: cleanItem.rating,
          relevance: 1
        };
      });
    }

    // Apply pagination to search results
    const paginatedResults = query ? results.slice(skip, skip + limitNum) : results;
    const filteredCount = query ? results.length : totalCount;
    const hasMore = skip + limitNum < filteredCount;

    const responseData = {
      offers: paginatedResults.map(result => ({
        id: result.id,
        slug: result.slug,
        title: result.title,
        description: result.description,
        image: result.image,
        category: result.category,
        type: result.type,
        views: result.views,
        unlocks: result.unlocks,
        keywords: [],
        addedAt: new Date().toISOString(),
        featured: false,
        rating: 4.5
      })),
      totalCount,
      filteredCount,
      hasMore,
      currentPage: pageNum,
      totalPages: Math.ceil(filteredCount / limitNum)
    };

    // Cache results for 5 minutes
    cache.set(cacheKey, responseData, 5);

    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      logger.warn('Slow operation: Search operation completed', { 
        duration: `${duration}ms`,
        query, 
        type, 
        category, 
        resultCount: paginatedResults.length,
        ip: clientIP
      });
    }

    res.json(responseData);

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Search error', error, { 
      query: req.query.q, 
      ip: clientIP,
      duration 
    });

    // Fallback to dummy data if MongoDB is not available
    const dummyOffers = [
      {
        id: 'dummy-1',
        slug: 'adobe-photoshop-2024',
        title: 'Adobe Photoshop 2024',
        description: 'Professional photo editing software with advanced features',
        image: '/images/placeholder.png',
        category: 'Design',
        type: 'app' as const,
        views: 15420,
        unlocks: 8932,
        keywords: ['photoshop', 'adobe', 'design', 'photo editing'],
        addedAt: new Date().toISOString(),
        featured: true,
        rating: 4.8
      },
      {
        id: 'dummy-2',
        slug: 'microsoft-office-365',
        title: 'Microsoft Office 365',
        description: 'Complete office suite with Word, Excel, PowerPoint and more',
        image: '/images/placeholder.png',
        category: 'Productivity',
        type: 'app' as const,
        views: 23150,
        unlocks: 12043,
        keywords: ['office', 'microsoft', 'word', 'excel', 'powerpoint'],
        addedAt: new Date().toISOString(),
        featured: true,
        rating: 4.7
      },
      {
        id: 'dummy-3',
        slug: 'call-of-duty-warzone',
        title: 'Call of Duty: Warzone',
        description: 'Free-to-play battle royale game with intense action',
        image: '/images/placeholder.png',
        category: 'Games',
        type: 'game' as const,
        views: 45230,
        unlocks: 28901,
        keywords: ['cod', 'warzone', 'battle royale', 'fps'],
        addedAt: new Date().toISOString(),
        featured: false,
        rating: 4.5
      }
    ];

    const responseData = {
      offers: dummyOffers,
      totalCount: dummyOffers.length,
      filteredCount: dummyOffers.length,
      hasMore: false,
      currentPage: 1,
      totalPages: 1
    };

    res.status(200).json(responseData);
  }
} 