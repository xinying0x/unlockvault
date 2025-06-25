import { NextApiRequest, NextApiResponse } from 'next';
import { autoSyncArticles, getArticlesSyncStatus } from '../../../lib/syncArticles';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get articles sync status
        const status = await getArticlesSyncStatus();
        res.status(200).json({ status });
        break;

      case 'POST':
        // Force sync articles
        console.log('🔄 Manual articles sync triggered from API...');
        
        await autoSyncArticles();
        
        // Get updated status
        const updatedStatus = await getArticlesSyncStatus();
        
        res.status(200).json({
          message: 'Articles synchronized successfully',
          status: updatedStatus,
          syncedAt: new Date().toISOString()
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Articles sync API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 