import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const offersCollection = db.collection('offers');

    // Get all active offers
    const offers = await offersCollection
      .find({ status: 'active' })
      .project({ slug: 1, lastModified: 1, _id: 0 })
      .toArray();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unlockvault.com';
    const currentDate = new Date().toISOString();

    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/tools', priority: '0.9', changefreq: 'daily' },
      { url: '/apps', priority: '0.9', changefreq: 'daily' },
      { url: '/games', priority: '0.8', changefreq: 'weekly' },
      { url: '/contact', priority: '0.5', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' }
    ];

    // Generate XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add offer pages
    offers.forEach(offer => {
      const lastMod = offer.lastModified || currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/offers/${offer.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
} 