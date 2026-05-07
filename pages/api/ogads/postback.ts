import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // OGAds usually sends GET requests for postbacks
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Example postback URL from OGAds config: 
  // https://yourdomain.com/api/ogads/postback?session={aff_sub4}&offer_id={aff_sub5}&payout={payout}&ip={ip}
  
  const { session, offer_id, payout, ip } = req.query;

  if (!session || typeof session !== 'string') {
    return res.status(400).json({ error: 'Missing session identifier' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'unlockvault');

    // Update the session document to marked as completed
    const result = await db.collection('unlock_sessions').updateOne(
      { sessionId: session },
      { 
        $set: { 
          status: 'completed',
          payout: payout ? Number(payout) : 0,
          completedAt: new Date(),
          offerId: offer_id || null,
          userIp: ip || null
        } 
      },
      { upsert: true } // If the session doesn't exist yet, we create it
    );

    console.log(`[OGAds Postback] Session ${session} marked as completed. Payout: ${payout}`);

    // OGAds requires a 200 OK response to know the postback was received successfully
    return res.status(200).send('OK');
  } catch (error) {
    console.error('[OGAds Postback] Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
