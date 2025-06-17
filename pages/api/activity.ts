import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Visit {
  id: string;
  timestamp: string;
  ip: string;
  offerId: string;
  country: string;
  city: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  referrer: string;
}

interface Offer {
  id: string;
  title: string;
}

interface Activity {
  id: string;
  type: 'unlock';
  country: string;
  city: string;
  tool: string;
  timestamp: Date;
  ip: string;
  deviceType: string;
  browser: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const visitsPath = path.join(process.cwd(), 'data', 'visits.json');
    const offersPath = path.join(process.cwd(), 'data', 'offers.json');

    const visitsData = fs.readFileSync(visitsPath, 'utf-8');
    const offersData = fs.readFileSync(offersPath, 'utf-8');

    const visits: Visit[] = JSON.parse(visitsData);
    const offers: Offer[] = JSON.parse(offersData);

    // Create a map for quick offer lookup
    const offersMap = new Map(offers.map(offer => [offer.id, offer.title]));

    // Sort visits by most recent and take the latest 20
    const recentVisits = visits
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    // Process visits into activities
    const activities: Activity[] = recentVisits.map(visit => {
      return {
        id: visit.id,
        type: 'unlock',
        country: visit.country || 'Unknown',
        city: visit.city || '',
        tool: offersMap.get(visit.offerId) || 'a premium tool',
        timestamp: new Date(visit.timestamp),
        ip: visit.ip,
        deviceType: visit.deviceType || 'Unknown',
        browser: visit.browser || 'Unknown',
      };
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
} 