/**
 * QR Code Generator API
 * Admin: Generate QR Code for offers/articles with CPA Content Locker
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import QRCode from 'qrcode';

interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  views: number;
  unlocks: number;
  addedAt: string;
  featured?: boolean;
  rating: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { offerId, type = 'offer', siteUrl } = req.body;
    const baseUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://unlockvault.xyz';

    // Validate input
    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required' });
    }

    const db = await connectToDatabase().then(({ db }) => db);
    let offer: Offer | null = null;

    // Fetch offer from database
    if (type === 'offer') {
      offer = await db.collection<Offer>('offers').findOne({ id: offerId });
    }

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Generate CPA link with Content Locker
    const cpaLink = `${baseUrl}/unlock/${offer.slug}`;

    // Generate QR Code as base64
    const qrCodeBase64 = await QRCode.toDataURL(cpaLink, {
      width: 300,
      margin: 2,
      color: { dark: '#8B5CF6', light: '#0D0B1E' },
    });

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeBase64,
        cpaLink: cpaLink,
        offerTitle: offer.title,
        offerType: offer.type,
        offerImage: offer.image,
      },
    });
  } catch (error: any) {
    console.error('QR Generation Error:', error);
    res.status(500).json({
      error: 'Failed to generate QR code',
      message: error.message,
    });
  }
}
