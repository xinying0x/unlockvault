import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { logger } from '../../lib/logger';
import { cache } from '../../lib/cache';
import { searchRateLimit } from '../../lib/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const rateLimitResult = searchRateLimit(req);
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', rateLimitResult.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  if (!rateLimitResult.success) {
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  const startTime = Date.now();
  const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';

  try {
    const { q: query = '', category = '', type = '', sort = 'relevance', page = '1', limit = '20' } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20)); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Create cache key
    const cacheKey = `search:${query}:${category}:${type}:${sort}:${pageNum}:${limitNum}`;
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      logger.debug('Search cache hit', { query, type, category });
      return res.json(cachedResult);
    }

    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('offers');

    // Build search pipeline
    let pipeline: any[] = [];

    // Match stage
    let matchStage: any = {};

    if (query) {
      matchStage.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      matchStage.category = { $regex: category, $options: 'i' };
    }

    if (type && type !== 'all') {
      matchStage.type = type;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add fields for sorting
    pipeline.push({
      $addFields: {
        relevanceScore: query ? {
          $add: [
            { $cond: [{ $regexMatch: { input: "$title", regex: query, options: "i" } }, 10, 0] },
            { $cond: [{ $regexMatch: { input: "$description", regex: query, options: "i" } }, 5, 0] },
            { $cond: [{ $regexMatch: { input: "$keywords", regex: query, options: "i" } }, 3, 0] }
          ]
        } : 0,
        popularityScore: { $add: [{ $multiply: ["$views", 0.3] }, { $multiply: ["$unlocks", 0.7] }] }
      }
    });

    // Sort stage
    let sortStage: any = {};
    switch (sort) {
      case 'newest':
        sortStage = { addedAt: -1 };
        break;
      case 'popular':
        sortStage = { popularityScore: -1 };
        break;
      case 'views':
        sortStage = { views: -1 };
        break;
      case 'unlocks':
        sortStage = { unlocks: -1 };
        break;
      case 'relevance':
      default:
        if (query) {
          sortStage = { relevanceScore: -1, popularityScore: -1 };
        } else {
          sortStage = { featured: -1, popularityScore: -1 };
        }
        break;
    }

    pipeline.push({ $sort: sortStage });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await collection.aggregate(countPipeline).toArray();
    const totalCount = totalResult[0]?.total || 0;
    const filteredCount = totalCount;

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Project final fields
    pipeline.push({
      $project: {
        id: { $toString: "$_id" },
        slug: 1,
        title: 1,
        description: 1,
        image: 1,
        category: 1,
        type: 1,
        views: 1,
        unlocks: 1,
        addedAt: 1,
        featured: 1,
        _id: 0
      }
    });

    // Execute search
    const results = await collection.aggregate(pipeline).toArray();
    const hasMore = skip + limitNum < filteredCount;

    const responseData = {
      offers: results.map(result => ({
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
        resultCount: results.length,
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

    // Apply basic filtering to dummy data
    let filteredDummy = dummyOffers;
    const queryStr = (req.query.q as string || '').toLowerCase();
    const categoryStr = (req.query.category as string || '');
    const typeStr = (req.query.type as string || '');

    if (queryStr) {
      filteredDummy = filteredDummy.filter(offer => 
        offer.title.toLowerCase().includes(queryStr) ||
        offer.description.toLowerCase().includes(queryStr) ||
        offer.category.toLowerCase().includes(queryStr)
      );
    }

    if (categoryStr && categoryStr !== 'all') {
      filteredDummy = filteredDummy.filter(offer => 
        offer.category.toLowerCase().includes(categoryStr.toLowerCase())
      );
    }

    if (typeStr && typeStr !== 'all') {
      filteredDummy = filteredDummy.filter(offer => offer.type === typeStr);
    }

    res.status(200).json({
      offers: filteredDummy,
      totalCount: filteredDummy.length,
      filteredCount: filteredDummy.length,
      hasMore: false,
      currentPage: 1,
      totalPages: 1,
      fallback: true
    });
  }
} 