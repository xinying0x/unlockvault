import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ADSTERRA_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      items: [],
    });
  }

  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const url = new URL('https://api3.adsterratools.com/publisher/stats.json');
    url.searchParams.set('start_date', formatDate(sevenDaysAgo));
    url.searchParams.set('finish_date', formatDate(today));
    url.searchParams.set('group_by', 'date');

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': apiKey,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({
        configured: true,
        error: 'Failed to fetch Adsterra stats',
        details,
        items: [],
      });
    }

    const data = await response.json();
    return res.status(200).json({
      configured: true,
      ...data,
      items: Array.isArray(data.items) ? data.items : [],
    });
  } catch (error: any) {
    return res.status(500).json({
      configured: true,
      error: 'Failed to fetch Adsterra stats',
      message: error.message,
      items: [],
    });
  }
}
