import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    
    // Parse the request body
    let data;
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }

    // Get client IP and user agent
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Handle different types of analytics events
    switch (data.event) {
      case 'analytics_blocked':
        // Log blocked analytics services
        await db.collection('analytics_blocked').insertOne({
          ...data,
          clientIP,
          userAgent,
          timestamp: new Date(),
          headers: {
            'accept-language': req.headers['accept-language'],
            'referer': req.headers.referer
          }
        });
        
        console.log('Analytics blocked detected:', {
          blocked: data.blocked,
          userAgent: userAgent.substring(0, 100),
          timestamp: data.timestamp
        });
        break;

      case 'page_view':
        // Fallback page view tracking
        await db.collection('analytics_fallback').insertOne({
          event: 'page_view',
          page: data.page || req.headers.referer,
          clientIP,
          userAgent,
          timestamp: new Date(),
          sessionId: data.sessionId,
          source: 'fallback'
        });
        break;

      case 'cpa_click':
        // Fallback CPA click tracking
        await db.collection('analytics_fallback').insertOne({
          event: 'cpa_click',
          offerId: data.offerId,
          offerTitle: data.offerTitle,
          clientIP,
          userAgent,
          timestamp: new Date(),
          source: 'fallback'
        });
        break;

      case 'user_engagement':
        // Fallback user engagement tracking
        await db.collection('analytics_fallback').insertOne({
          event: 'user_engagement',
          action: data.action,
          duration: data.duration,
          interactions: data.interactions,
          clientIP,
          userAgent,
          timestamp: new Date(),
          source: 'fallback'
        });
        break;

      default:
        // Generic analytics event
        await db.collection('analytics_fallback').insertOne({
          ...data,
          clientIP,
          userAgent,
          timestamp: new Date(),
          source: 'fallback'
        });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Analytics data recorded',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record analytics data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 