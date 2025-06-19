import { NextApiRequest, NextApiResponse } from 'next';
import { cache } from '../../../lib/cache';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin authentication
  const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No authentication token' });
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      // Clear all cache
      cache.clear();
      
      res.status(200).json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 