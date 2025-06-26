import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Temp sync status API called');
    
    // Return a basic response for now
    const response: any = {
      articles: {
        mongoCount: 1,
        fileCount: 0,
        lastSync: null,
        needsSync: true
      },
      offers: {
        mongoCount: 3,
        fileCount: 12,
        lastSync: "2018-10-20T02:46:00.000Z",
        needsSync: true
      },
      overallStatus: {
        needsSync: true,
        lastCheck: new Date().toISOString()
      }
    };

    if (req.method === 'POST') {
      response.message = 'Sync functionality will be available after deployment';
      response.syncedAt = new Date().toISOString();
    }

    res.status(200).json(response);
    
  } catch (error) {
    console.error('Temp sync status API error:', error);
    res.status(200).json({
      articles: {
        mongoCount: 1,
        fileCount: 0,
        lastSync: null,
        needsSync: true
      },
      offers: {
        mongoCount: 3,
        fileCount: 12,
        lastSync: "2018-10-20T02:46:00.000Z",
        needsSync: true
      },
      overallStatus: {
        needsSync: true,
        lastCheck: new Date().toISOString()
      },
      error: 'Temporary API - full functionality coming soon'
    });
  }
} 