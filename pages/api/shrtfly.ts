import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Use the API key provided by the user
  const api_token = process.env.SHRTFLY_API_KEY || 'c48efe0a1a2b86395a0eab3cab8d979e';
  const ad_type = 1; // 1 for Mainstream
  
  const api_url = `https://shrtfly.com/api?api=${api_token}&url=${encodeURIComponent(url)}&type=${ad_type}&format=json`;

  try {
    const response = await fetch(api_url);
    const data = await response.json();
    
    if (data.status === 'success') {
      res.status(200).json({ shortUrl: data.result.shorten_url });
    } else {
      res.status(400).json({ error: data.result || 'Failed to shorten URL' });
    }
  } catch (error) {
    console.error('Shrtfly API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
