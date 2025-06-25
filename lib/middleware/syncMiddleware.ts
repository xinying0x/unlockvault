import { NextApiRequest, NextApiResponse } from 'next';
import { autoSyncOffers } from '../syncOffers';
import { autoSyncArticles } from '../syncArticles';

export interface SyncMiddlewareOptions {
  onSuccess?: boolean;
  onError?: boolean;
  delay?: number;
  syncType?: 'offers' | 'articles' | 'both';
}

/**
 * Middleware to automatically sync content after API operations
 */
export function withSyncMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: SyncMiddlewareOptions = { onSuccess: true, onError: false, delay: 0, syncType: 'offers' }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let operationSuccess = false;
    let originalJson = res.json;
    
    // Override res.json to detect success/error responses
    res.json = function(body: any) {
      operationSuccess = res.statusCode >= 200 && res.statusCode < 300;
      return originalJson.call(this, body);
    };

    const performSync = async () => {
      try {
        switch (options.syncType) {
          case 'articles':
            await autoSyncArticles();
            break;
          case 'both':
            await Promise.all([autoSyncOffers(), autoSyncArticles()]);
            break;
          case 'offers':
          default:
            await autoSyncOffers();
            break;
        }
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    };

    try {
      // Execute the original handler
      await handler(req, res);
      
      // Trigger sync based on options
      if (options.onSuccess && operationSuccess) {
        if (options.delay && options.delay > 0) {
          setTimeout(performSync, options.delay);
        } else {
          await performSync();
        }
      }
      
    } catch (error) {
      // Trigger sync on error if configured
      if (options.onError) {
        if (options.delay && options.delay > 0) {
          setTimeout(performSync, options.delay);
        } else {
          await performSync();
        }
      }
      
      throw error; // Re-throw the original error
    }
  };
}

/**
 * Sync middleware for offer creation/update operations
 */
export const withOfferSync = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return withSyncMiddleware(handler, {
    onSuccess: true,
    onError: false,
    delay: 1000, // 1 second delay to allow DB to propagate
    syncType: 'offers'
  });
};

/**
 * Sync middleware for offer deletion operations
 */
export const withOfferDeleteSync = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return withSyncMiddleware(handler, {
    onSuccess: true,
    onError: false,
    delay: 500, // Shorter delay for deletions
    syncType: 'offers'
  });
};

/**
 * Sync middleware for article creation/update operations
 */
export const withArticleSync = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return withSyncMiddleware(handler, {
    onSuccess: true,
    onError: false,
    delay: 1000, // 1 second delay to allow DB to propagate
    syncType: 'articles'
  });
};

/**
 * Sync middleware for article deletion operations
 */
export const withArticleDeleteSync = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return withSyncMiddleware(handler, {
    onSuccess: true,
    onError: false,
    delay: 500, // Shorter delay for deletions
    syncType: 'articles'
  });
};

/**
 * Sync middleware for operations that affect both articles and offers
 */
export const withFullSync = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return withSyncMiddleware(handler, {
    onSuccess: true,
    onError: false,
    delay: 1000,
    syncType: 'both'
  });
}; 