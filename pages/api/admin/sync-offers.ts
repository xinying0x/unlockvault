import { NextApiRequest, NextApiResponse } from 'next';
import { syncOffersToFile, getOffersSyncStatus } from '../../../lib/syncOffers';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin authentication
  const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No authentication token' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    // Manual sync trigger
    try {
      await syncOffersToFile();
      
      // Get updated status
      const status = await getOffersSyncStatus();
      
      res.status(200).json({
        success: true,
        message: 'Offers synchronized successfully',
        status,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Manual sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync offers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
  } else if (req.method === 'GET') {
    // Get sync status
    try {
      const status = await getOffersSyncStatus();
      
      res.status(200).json({
        success: true,
        status,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Sync status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 