import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { logger } from '../../lib/logger';
import { cache } from '../../lib/cache';
import { searchRateLimit } from '../../lib/rateLimit';
import fs from 'fs';
import path from 'path';

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

    // Use JSON file as primary data source
    const filePath = path.join(process.cwd(), 'data', 'offers.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const allOffers = JSON.parse(fileContents);
    
    // Filter offers based on status
    let filteredOffers = allOffers.filter((offer: any) => offer.status === 'active');
    
    // Apply search filters
    if (query) {
      const queryLower = query.toLowerCase();
      filteredOffers = filteredOffers.filter((offer: any) => 
        offer.title.toLowerCase().includes(queryLower) ||
        offer.description.toLowerCase().includes(queryLower) ||
        offer.category.toLowerCase().includes(queryLower) ||
        (offer.keywords && offer.keywords.some((keyword: string) => 
          keyword.toLowerCase().includes(queryLower)
        ))
      );
    }

    if (category && category !== 'all') {
      filteredOffers = filteredOffers.filter((offer: any) => 
        offer.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (type && type !== 'all') {
      filteredOffers = filteredOffers.filter((offer: any) => offer.type === type);
    }

    // Sort offers
    switch (sort) {
      case 'newest':
        filteredOffers.sort((a: any, b: any) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        break;
      case 'popular':
        filteredOffers.sort((a: any, b: any) => 
          (b.views * 0.3 + b.unlocks * 0.7) - (a.views * 0.3 + a.unlocks * 0.7)
        );
        break;
      case 'views':
        filteredOffers.sort((a: any, b: any) => b.views - a.views);
        break;
      case 'unlocks':
        filteredOffers.sort((a: any, b: any) => b.unlocks - a.unlocks);
        break;
      case 'relevance':
      default:
        if (!query) {
          filteredOffers.sort((a: any, b: any) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (b.views * 0.3 + b.unlocks * 0.7) - (a.views * 0.3 + a.unlocks * 0.7);
          });
        }
        break;
    }

    // Apply pagination
    const totalFilteredCount = filteredOffers.length;
    const startIndex = skip;
    const endIndex = skip + limitNum;
    const paginatedOffers = filteredOffers.slice(startIndex, endIndex);
    
    const hasMore = endIndex < totalFilteredCount;
    const responseData = {
      offers: paginatedOffers.map((offer: any) => ({
        id: offer.id,
        slug: offer.slug,
        title: offer.title,
        description: offer.description,
        image: offer.image,
        category: offer.category,
        type: offer.type,
        views: offer.views || 0,
        unlocks: offer.unlocks || 0,
        keywords: offer.keywords || [],
        addedAt: offer.addedAt || new Date().toISOString(),
        featured: offer.featured || false,
        rating: offer.rating || 4.5
      })),
      totalCount: totalFilteredCount,
      filteredCount: totalFilteredCount,
      hasMore,
      currentPage: pageNum,
      totalPages: Math.ceil(totalFilteredCount / limitNum)
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
        resultCount: responseData.offers.length,
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

    // Return empty results on error instead of dummy data
    res.status(200).json({
      offers: [],
      totalCount: 0,
      filteredCount: 0,
      hasMore: false,
      currentPage: 1,
      totalPages: 0,
      error: 'Search temporarily unavailable'
    });
  }
} 