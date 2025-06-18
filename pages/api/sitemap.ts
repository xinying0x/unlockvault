import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Offer {
  id: string;
  slug: string;
  title: string;
  image?: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  addedAt: string;
  featured?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try MongoDB first, fallback to JSON file
    let offers: Offer[] = [];
    
    try {
      const clientPromise = require('../../lib/mongodb');
      const client = await clientPromise;
      const db = client.db('unlockvault');
      const offersCollection = db.collection('offers');

      // Get all active offers from MongoDB
      const mongoOffers = await offersCollection
        .find({ status: 'active' })
        .project({ slug: 1, title: 1, image: 1, category: 1, type: 1, addedAt: 1, featured: 1, _id: 0 })
        .toArray();
      
      offers = mongoOffers;
    } catch (error) {
      // Fallback to JSON file
      const offersPath = path.join(process.cwd(), 'data', 'offers.json');
      if (fs.existsSync(offersPath)) {
        const offersData = fs.readFileSync(offersPath, 'utf8');
        offers = JSON.parse(offersData);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unlockvault.xyz';
    const currentDate = new Date().toISOString();

    // Enhanced static pages with better priorities
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily', title: 'UnlockVault - Premium Tools & Apps' },
      { url: '/search', priority: '0.9', changefreq: 'daily', title: 'Search Premium Tools' },
      { url: '/tools', priority: '0.9', changefreq: 'daily', title: 'Premium Tools' },
      { url: '/apps', priority: '0.9', changefreq: 'daily', title: 'Premium Apps' },
      { url: '/games', priority: '0.8', changefreq: 'weekly', title: 'Premium Games' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'monthly', title: 'Privacy Policy' },
      { url: '/terms', priority: '0.3', changefreq: 'monthly', title: 'Terms of Service' }
    ];

    // Enhanced XML with image sitemap support
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

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

    // Add offer pages with enhanced data
    offers.forEach((offer: Offer) => {
      const lastMod = offer.addedAt ? new Date(offer.addedAt).toISOString() : currentDate;
      const priority = offer.featured ? '0.9' : '0.7';
      const imageUrl = offer.image ? `${baseUrl}${offer.image}` : `${baseUrl}/images/placeholder.png`;
      
      sitemap += `
  <url>
    <loc>${baseUrl}/offers/${offer.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${offer.title}</image:title>
      <image:caption>${offer.title} - ${offer.category} ${offer.type}</image:caption>
    </image:image>
  </url>`;
    });

    // Add category pages
    const categories = [...new Set(offers.map(offer => offer.category))];
    categories.forEach(category => {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add type-based pages
    const types = [...new Set(offers.map(offer => offer.type))];
    types.forEach(type => {
      sitemap += `
  <url>
    <loc>${baseUrl}/${type}s</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200'); // 24 hours cache
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
} 