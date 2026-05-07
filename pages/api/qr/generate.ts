/**
 * QR Code Generator API
 * Admin: Generate QR Code for offers/articles with CPA Content Locker
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

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

const normalizeBaseUrl = (url?: string) => {
  const fallback = 'https://www.unlockvault.xyz';
  const value = (url || process.env.NEXT_PUBLIC_SITE_URL || fallback).trim();

  try {
    const parsed = new URL(value);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return fallback;
    }
    return parsed.origin.replace('https://unlockvault.xyz', fallback);
  } catch {
    return fallback;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { offerId, type = 'offer', siteUrl } = req.body;
    const baseUrl = normalizeBaseUrl(siteUrl);

    // Validate input
    if (!offerId) {
      return res.status(400).json({ error: 'offerId is required' });
    }

    let offer: Offer | null = null;

    if (type === 'offer') {
      try {
        const db = await connectToDatabase().then(({ db }) => db);
        offer = await db.collection<Offer>('offers').findOne({
          $or: [{ id: offerId }, { slug: offerId }]
        });
      } catch (dbError) {
        console.error('QR Generation DB lookup failed, trying JSON fallback:', dbError);
      }

      if (!offer) {
        const candidatePaths = [
          path.join('/tmp', 'unlockvault', 'offers.json'),
          path.join(process.cwd(), 'data', 'offers.json')
        ];
        const filePath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[1];
        if (fs.existsSync(filePath)) {
          const offers = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Offer[];
          offer = offers.find((item) => item.id === offerId || item.slug === offerId) || null;
        }
      }
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
        pageName: `Unlock ${offer.title}`,
        offerTitle: offer.title,
        offerType: offer.type,
        offerImage: offer.image,
        offerSlug: offer.slug,
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
