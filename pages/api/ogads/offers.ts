import { NextApiRequest, NextApiResponse } from 'next';

const OGADS_API_KEY = process.env.OGADS_API_KEY || '43923|kX3jS7OAt6toH0TSSKS0GSYH7960xNIrFxd2vM4xe6a135c2';
const OGADS_API_URL = 'https://checkmyapp.store/api/v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get visitor IP - support proxies/Vercel
  const forwarded = req.headers['x-forwarded-for'];
  const visitorIp =
    (typeof forwarded === 'string' ? forwarded.split(',')[0] : null) ||
    req.socket.remoteAddress ||
    '8.8.8.8';

  const userAgent = req.headers['user-agent'] || 'Mozilla/5.0';

  // Optional params from client
  const { max, min, ctype, aff_sub4, aff_sub5 } = req.query;

  try {
    const params = new URLSearchParams({
      ip: visitorIp,
      user_agent: userAgent,
    });

    if (max) params.append('max', String(max));
    if (min) params.append('min', String(min));
    if (ctype) params.append('ctype', String(ctype));
    if (aff_sub4) params.append('aff_sub4', String(aff_sub4));
    if (aff_sub5) params.append('aff_sub5', String(aff_sub5));

    const response = await fetch(`${OGADS_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${OGADS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[OGAds] API error:', response.status, await response.text());
      return res.status(502).json({ error: 'Failed to fetch offers from OGAds', offers: [] });
    }

    const data = await response.json();

    // Return offers to client
    return res.status(200).json({
      success: true,
      offers: data.data || data.offers || data || [],
      country: data.country || null,
    });
  } catch (error: any) {
    console.error('[OGAds] Fetch error:', error.message);
    return res.status(500).json({ error: 'Internal server error', offers: [] });
  }
}
