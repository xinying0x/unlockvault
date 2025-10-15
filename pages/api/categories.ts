import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import fs from 'fs';
import path from 'path';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'article' | 'offer' | 'both';
  count: number;
  slug: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { type = 'all' } = req.query;
    
    // Try MongoDB first
    try {
      const { db } = await connectToDatabase();
      
      // Get categories from database
      const [articles, offers, categories] = await Promise.all([
        db.collection('articles').find({}).toArray(),
        db.collection('offers').find({}).toArray(),
        db.collection('categories').find({}).toArray()
      ]);

      // Count articles and offers by category
      const articleCounts: { [key: string]: number } = {};
      const offerCounts: { [key: string]: number } = {};

      articles.forEach(article => {
        if (article.category) {
          articleCounts[article.category] = (articleCounts[article.category] || 0) + 1;
        }
      });

      offers.forEach(offer => {
        if (offer.category) {
          offerCounts[offer.category] = (offerCounts[offer.category] || 0) + 1;
        }
      });

      // Merge counts with category data
      const enrichedCategories = categories.map((cat: any) => ({
        ...cat,
        count: (articleCounts[cat.name] || 0) + (offerCounts[cat.name] || 0),
        articleCount: articleCounts[cat.name] || 0,
        offerCount: offerCounts[cat.name] || 0
      }));

      // Filter by type if specified
      let filteredCategories = enrichedCategories;
      if (type === 'articles') {
        filteredCategories = enrichedCategories.filter((cat: any) => cat.type === 'article' || cat.type === 'both');
      } else if (type === 'offers') {
        filteredCategories = enrichedCategories.filter((cat: any) => cat.type === 'offer' || cat.type === 'both');
      }

      res.status(200).json(filteredCategories);
    } catch (dbError) {
      console.error('MongoDB error, falling back to JSON:', dbError);
      
      // Fallback to JSON files: prefer /tmp for dynamic content, fallback to repo data
      const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
      const articlesPaths = [
        path.join('/tmp', 'unlockvault', 'articles.json'),
        path.join(process.cwd(), 'data', 'articles.json'),
      ];
      const offersPaths = [
        path.join('/tmp', 'unlockvault', 'offers.json'),
        path.join(process.cwd(), 'data', 'offers.json'),
      ];
      const articlesPath = articlesPaths.find((p) => fs.existsSync(p)) || articlesPaths[1];
      const offersPath = offersPaths.find((p) => fs.existsSync(p)) || offersPaths[1];

      const [categoriesData, articlesData, offersData] = await Promise.all([
        fs.promises.readFile(categoriesPath, 'utf8'),
        fs.promises.readFile(articlesPath, 'utf8'),
        fs.promises.readFile(offersPath, 'utf8')
      ]);

      const categories = JSON.parse(categoriesData);
      const articles = JSON.parse(articlesData);
      const offers = JSON.parse(offersData);

      // Count articles and offers by category
      const articleCounts: { [key: string]: number } = {};
      const offerCounts: { [key: string]: number } = {};

      articles.forEach((article: any) => {
        if (article.category) {
          articleCounts[article.category] = (articleCounts[article.category] || 0) + 1;
        }
      });

      offers.forEach((offer: any) => {
        if (offer.category) {
          offerCounts[offer.category] = (offerCounts[offer.category] || 0) + 1;
        }
      });

      // Merge counts with category data
      const enrichedCategories = categories.map((cat: any) => ({
        ...cat,
        count: (articleCounts[cat.name] || 0) + (offerCounts[cat.name] || 0),
        articleCount: articleCounts[cat.name] || 0,
        offerCount: offerCounts[cat.name] || 0
      }));

      // Filter by type if specified
      let filteredCategories = enrichedCategories;
      if (type === 'articles') {
        filteredCategories = enrichedCategories.filter((cat: any) => cat.type === 'article' || cat.type === 'both');
      } else if (type === 'offers') {
        filteredCategories = enrichedCategories.filter((cat: any) => cat.type === 'offer' || cat.type === 'both');
      }

      res.status(200).json(filteredCategories);
    }
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}