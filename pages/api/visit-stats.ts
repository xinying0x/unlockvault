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

    // Get all visits
    const allVisits = await collection.find({}).toArray();
    
    // Calculate comprehensive stats
    const stats = {
      totalVisits: allVisits.length,
      uniqueIPs: new Set(allVisits.map(v => v.ip)).size,
      todayVisits: allVisits.filter(v => v.date === new Date().toISOString().slice(0, 10)).length,
      vpnUsers: allVisits.filter(v => v.vpn).length,
      botTraffic: allVisits.filter(v => v.bot).length,
      adBlockUsers: allVisits.filter(v => v.adBlock).length,
      countries: allVisits.reduce((acc: { [key: string]: number }, visit) => {
        acc[visit.country] = (acc[visit.country] || 0) + 1;
        return acc;
      }, {}),
      browsers: allVisits.reduce((acc: { [key: string]: number }, visit) => {
        acc[visit.browser || 'Unknown'] = (acc[visit.browser || 'Unknown'] || 0) + 1;
        return acc;
      }, {}),
      devices: allVisits.reduce((acc: { [key: string]: number }, visit) => {
        acc[visit.deviceType || 'desktop'] = (acc[visit.deviceType || 'desktop'] || 0) + 1;
        return acc;
      }, {}),
      trafficSources: allVisits.reduce((acc: { [key: string]: number }, visit) => {
        acc[visit.trafficSource || 'Direct'] = (acc[visit.trafficSource || 'Direct'] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Visit stats API error:', error);

    res.status(200).json({
      totalVisits: 0,
      uniqueIPs: 0,
      todayVisits: 0,
      vpnUsers: 0,
      botTraffic: 0,
      adBlockUsers: 0,
      countries: {},
      browsers: {},
      devices: {},
      trafficSources: {}
    });
  }
} 
