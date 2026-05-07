import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('visits');

    const { range = '7d', page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Calculate date filter based on range
    let dateFilter = {};
    const now = new Date();
    
    switch (range) {
      case '24h':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        dateFilter = { timestamp: { $gte: yesterday.toISOString() } };
        break;
      case '7d':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { timestamp: { $gte: weekAgo.toISOString() } };
        break;
      case '30d':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { timestamp: { $gte: monthAgo.toISOString() } };
        break;
      default:
        // No date filter for 'all'
        break;
    }

    // Get visitors with pagination
    const visits = await collection
      .find(dateFilter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Get total count for pagination
    const total = await collection.countDocuments(dateFilter);

    // Calculate stats
    const allVisits = await collection.find(dateFilter).toArray();
    
    const stats = {
      totalVisits: allVisits.length,
      uniqueIPs: new Set(allVisits.map(v => v.ip)).size,
      countries: allVisits.reduce((acc: { [key: string]: number }, visit) => {
        acc[visit.country] = (acc[visit.country] || 0) + 1;
        return acc;
      }, {}),
      vpnUsers: allVisits.filter(v => v.vpn).length,
      botTraffic: allVisits.filter(v => v.bot).length,
      adBlockUsers: allVisits.filter(v => v.adBlock).length
    };

    // Remove MongoDB _id from response
    const cleanVisits = visits.map(({ _id, ...visit }) => ({
      ...visit,
      city: visit.city || null // Add city field if missing
    }));

    res.status(200).json({
      visits: cleanVisits,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Visitors API error:', error);

    res.status(200).json({
      visits: [],
      stats: {
        totalVisits: 0,
        uniqueIPs: 0,
        countries: {},
        vpnUsers: 0,
        botTraffic: 0,
        adBlockUsers: 0
      },
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      }
    });
  }
} 
