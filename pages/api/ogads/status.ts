import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session } = req.query;

  if (!session || typeof session !== 'string') {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'unlockvault');

    // Find the session in the database
    const sessionDoc = await db.collection('unlock_sessions').findOne({ sessionId: session });

    if (!sessionDoc) {
      // If it doesn't exist, we create it as 'pending' to initialize the tracking
      await db.collection('unlock_sessions').insertOne({
        sessionId: session,
        status: 'pending',
        createdAt: new Date()
      });
      return res.status(200).json({ status: 'pending' });
    }

    return res.status(200).json({ status: sessionDoc.status });
  } catch (error) {
    console.error('[OGAds Status] Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
