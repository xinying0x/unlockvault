import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    // For now, just return success without actually tracking views
    // This can be implemented later with a proper database or analytics service
    res.status(200).json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('View tracking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 