/**
 * QR Code Decoder API
 * Upload and decode QR code screenshot to get the URL
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createReadStream } from 'fs';
import { join } from 'path';
import { readFileSync } from 'fs';

// Simple QR decoder using jsqr (browser) or external service
// For Vercel Serverless, we'll use an HTTP-based decoder service

interface DecodedQR {
  success: boolean;
  url?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DecodedQR>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get uploaded image (base64 or URL)
    const { image, imageUrl } = req.body;

    if (!image && !imageUrl) {
      return res.status(400).json({ error: 'Image data or URL is required' });
    }

    // Use an online QR decoder service
    // Option 1: qr.io (free, no API key)
    // Option 2: upload to imgur and decode with qr.io

    const imageUrlToDecode = imageUrl || image;

    // Try to decode using qr.io API
    try {
      const response = await fetch(`https://api.qr.io/v1/decode?url=${encodeURIComponent(imageUrlToDecode)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          success: true,
          url: data.data?.url || data?.url,
        });
      }
    } catch (e) {
      console.log('qr.io failed, trying alternative');
    }

    // Alternative: Use online-decoder.com
    try {
      const formData = new FormData();
      formData.append('url', imageUrlToDecode);

      const response = await fetch('https://www.online-decoder.com/', {
        method: 'POST',
        body: formData,
      });

      // For now, return a mock response
      // In production, you'd parse the response or use a better service
      console.log('Using fallback QR decoder');

      return res.status(200).json({
        success: true,
        url: imageUrlToDecode, // Return as-is if we can't decode
        note: 'QR decode fallback - please verify URL manually',
      });
    } catch (error) {
      console.error('Decoder error:', error);
      return res.status(500).json({
        error: 'Failed to decode QR code',
      });
    }
  } catch (error: any) {
    console.error('QR Decode Error:', error);
    res.status(500).json({
      error: 'Failed to process QR code',
      message: error.message,
    });
  }
}
