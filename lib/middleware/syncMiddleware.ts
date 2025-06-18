import { NextApiRequest, NextApiResponse } from 'next';
import { autoSyncOffers } from '../syncOffers';

export interface SyncMiddlewareOptions {
  onSuccess?: boolean;
  onError?: boolean;
  delay?: number;
}

/**
 * Middleware to automatically sync offers after API operations
 */
export function withSyncMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: SyncMiddlewareOptions = { onSuccess: true, onError: false, delay: 0 }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let operationSuccess = false;
    let originalJson = res.json;
    
    // Override res.json to detect success/error responses
    res.json = function(body: any) {
      operationSuccess = res.statusCode >= 200 && res.statusCode < 300;
      return originalJson.call(this, body);
    };

    try {
      // Execute the original handler
      await handler(req, res);
      
      // Trigger sync based on options
      if (options.onSuccess && operationSuccess) {
        if (options.delay && options.delay > 0) {
          setTimeout(() => {
            autoSyncOffers().catch(error => {
              console.error('Background sync failed:', error);
            });
          }, options.delay);
        } else {
          await autoSyncOffers();
        }
      }
      
    } catch (error) {
      // Trigger sync on error if configured
      if (options.onError) {
        if (options.delay && options.delay > 0) {
          setTimeout(() => {
            autoSyncOffers().catch(syncError => {
              console.error('Background sync failed:', syncError);
            });
          }, options.delay);
        } else {
          await autoSyncOffers();
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
    delay: 1000 // 1 second delay to allow DB to propagate
  });
};

/**
 * Sync middleware for offer deletion operations
 */
export const withOfferDeleteSync = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return withSyncMiddleware(handler, {
    onSuccess: true,
    onError: false,
    delay: 500 // Shorter delay for deletions
  });
}; 