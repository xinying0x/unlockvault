import { NextApiRequest, NextApiResponse } from 'next';
import { getArticlesSyncStatus, syncAllContent } from '../../../lib/syncArticles';
import { getOffersSyncStatus } from '../../../lib/syncOffers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get sync status for both articles and offers
        const [articlesStatus, offersStatus] = await Promise.all([
          getArticlesSyncStatus(),
          getOffersSyncStatus()
        ]);

        res.status(200).json({
          articles: articlesStatus,
          offers: offersStatus,
          overallStatus: {
            needsSync: articlesStatus.needsSync || offersStatus.needsSync,
            lastCheck: new Date().toISOString()
          }
        });
        break;

      case 'POST':
        // Force sync all content
        console.log('🔄 Manual sync triggered from admin panel...');
        
        await syncAllContent();
        
        // Get updated status
        const [updatedArticlesStatus, updatedOffersStatus] = await Promise.all([
          getArticlesSyncStatus(),
          getOffersSyncStatus()
        ]);

        res.status(200).json({
          message: 'Sync completed successfully',
          articles: updatedArticlesStatus,
          offers: updatedOffersStatus,
          syncedAt: new Date().toISOString()
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Sync status API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 