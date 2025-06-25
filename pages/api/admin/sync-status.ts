import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Sync status API called with method:', req.method);

    // Try to import functions dynamically to avoid build issues
    let getArticlesSyncStatus, syncAllContent, getOffersSyncStatus;
    
    try {
      const articlesModule = await import('../../../lib/syncArticles');
      const offersModule = await import('../../../lib/syncOffers');
      
      getArticlesSyncStatus = articlesModule.getArticlesSyncStatus;
      syncAllContent = articlesModule.syncAllContent;
      getOffersSyncStatus = offersModule.getOffersSyncStatus;
    } catch (importError) {
      console.error('Import error:', importError);
      
      // Fallback response when modules can't be imported
      return res.status(200).json({
        articles: {
          mongoCount: 0,
          fileCount: 0,
          lastSync: null,
          needsSync: true
        },
        offers: {
          mongoCount: 0,
          fileCount: 0,
          lastSync: null,
          needsSync: true
        },
        overallStatus: {
          needsSync: true,
          lastCheck: new Date().toISOString()
        },
        error: 'Sync modules not available'
      });
    }

    switch (req.method) {
      case 'GET':
        console.log('Getting sync status...');
        
        try {
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
        } catch (statusError) {
          console.error('Status check error:', statusError);
          
          // Fallback response
          res.status(200).json({
            articles: {
              mongoCount: 0,
              fileCount: 0,
              lastSync: null,
              needsSync: true
            },
            offers: {
              mongoCount: 0,
              fileCount: 0,
              lastSync: null,
              needsSync: true
            },
            overallStatus: {
              needsSync: true,
              lastCheck: new Date().toISOString()
            },
            error: 'Status check failed'
          });
        }
        break;

      case 'POST':
        console.log('Manual sync triggered from admin panel...');
        
        try {
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
        } catch (syncError) {
          console.error('Sync error:', syncError);
          
          res.status(200).json({
            message: 'Sync failed but API responded',
            error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
            syncedAt: new Date().toISOString()
          });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Sync status API error:', error);
    
    // Even in case of error, return 200 with error info to prevent UI breaks
    res.status(200).json({ 
      message: 'API error but responding',
      error: error instanceof Error ? error.message : 'Unknown error',
      articles: {
        mongoCount: 0,
        fileCount: 0,
        lastSync: null,
        needsSync: true
      },
      offers: {
        mongoCount: 0,
        fileCount: 0,
        lastSync: null,
        needsSync: true
      },
      overallStatus: {
        needsSync: true,
        lastCheck: new Date().toISOString()
      }
    });
  }
} 