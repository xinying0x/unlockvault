import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Visit {
  ip: string;
  country: string;
  city?: string;
  bot: boolean;
  adBlock: boolean;
  vpn: boolean;
  timestamp: string;
  date: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  trafficSource?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const visitsPath = path.join(process.cwd(), 'data', 'visits.json');
    
    let visits: Visit[] = [];
    try {
      const visitsData = fs.readFileSync(visitsPath, 'utf-8');
      visits = JSON.parse(visitsData);
    } catch (parseError) {
      console.error('Error parsing visits.json:', parseError);
      // If JSON is corrupted, reset to empty array
      visits = [];
      fs.writeFileSync(visitsPath, '[]', 'utf-8');
    }

    // Calculate statistics
    const totalVisits = visits.length;
    const uniqueIPs = new Set(visits.map(v => v.ip)).size;
    const vpnUsers = visits.filter(v => v.vpn).length;
    const botTraffic = visits.filter(v => v.bot).length;
    const adBlockUsers = visits.filter(v => v.adBlock).length;

    // Countries breakdown
    const countries: { [key: string]: number } = {};
    visits.forEach(visit => {
      countries[visit.country] = (countries[visit.country] || 0) + 1;
    });

    // Sort visits by most recent
    const sortedVisits = visits.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const stats = {
      totalVisits,
      uniqueIPs,
      countries,
      vpnUsers,
      botTraffic,
      adBlockUsers
    };

    res.status(200).json({
      visits: sortedVisits,
      stats
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
} 