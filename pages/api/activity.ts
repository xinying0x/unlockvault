import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

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
    const client = await clientPromise;
    const db = client.db('unlockvault');
    
    // Get recent visits from MongoDB
    const visitsCollection = db.collection('visits');
    const offersCollection = db.collection('offers');

    // Get the latest 50 visits that include offerId (meaning they unlocked something)
    const recentVisits = await visitsCollection
      .find({ 
        offerId: { $exists: true, $ne: null },
        bot: { $ne: true } // Exclude bot traffic
      })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // Get offers for tool names
    const offers = await offersCollection.find({}).toArray();
    const offersMap = new Map(offers.map(offer => [offer.id, offer.title]));

    // Process visits into activities
    const activities: Activity[] = recentVisits.map(visit => {
      return {
        id: visit.id || visit._id?.toString() || `${visit.ip}-${visit.timestamp}`,
        type: 'unlock',
        country: visit.country || 'Unknown',
        city: visit.city || '',
        tool: offersMap.get(visit.offerId) || 'Premium Tool',
        timestamp: new Date(visit.timestamp),
        ip: visit.ip,
        deviceType: visit.deviceType || 'Unknown',
        browser: visit.browser || 'Unknown',
      };
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error('Activity API Error:', error);
    res.status(500).json({ message: 'Failed to fetch activity data' });
  }
} 