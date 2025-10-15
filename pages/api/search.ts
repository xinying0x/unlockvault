import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface SearchItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  keywords: string[];
  views: number;
  unlocks: number;
  addedAt: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'tool' | 'app' | 'game';
  category: string;
  slug: string;
  image: string;
  relevance: number;
  description: string;
  views: number;
  unlocks: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { q: query, limit = '10', type } = req.query;

    // Handle case where no query is provided, return all active items for the selected type
    if (!query || typeof query !== 'string') {
      let allItems: SearchItem[] = [];
      const toolsPath = path.join(process.cwd(), 'data', 'tools.json');
      const offerPaths = [
        path.join('/tmp', 'unlockvault', 'offers.json'),
        path.join(process.cwd(), 'data', 'offers.json')
      ];
      const offersPath = offerPaths.find(p => fs.existsSync(p)) || offerPaths[1];

      if (fs.existsSync(toolsPath)) {
        const toolsData = fs.readFileSync(toolsPath, 'utf8');
        allItems = allItems.concat(JSON.parse(toolsData));
      }
      if (fs.existsSync(offersPath)) {
        const offersData = fs.readFileSync(offersPath, 'utf8');
        allItems = allItems.concat(JSON.parse(offersData));
      }

      let filteredAllItems = allItems;
      if (type && type !== 'all') {
        filteredAllItems = allItems.filter(item => item.type === type);
      }
      
      return res.json(filteredAllItems.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        category: item.category,
        slug: item.slug,
        image: item.image,
        description: item.description, // Ensure description is included
        relevance: 1, // Default relevance for non-search query items
        views: item.views,
        unlocks: item.unlocks
      })));
    }

    const searchQuery = query.toLowerCase().trim();
    if (searchQuery.length < 2) {
      return res.json([]);
    }

    // Read tools and offers data
    const toolsPath = path.join(process.cwd(), 'data', 'tools.json');
    const offerPaths = [
      path.join('/tmp', 'unlockvault', 'offers.json'),
      path.join(process.cwd(), 'data', 'offers.json')
    ];
    const offersPath = offerPaths.find(p => fs.existsSync(p)) || offerPaths[1];
    let allItems: SearchItem[] = [];

    if (fs.existsSync(toolsPath)) {
      const toolsData = fs.readFileSync(toolsPath, 'utf8');
      allItems = allItems.concat(JSON.parse(toolsData));
    }

    if (fs.existsSync(offersPath)) {
      const offersData = fs.readFileSync(offersPath, 'utf8');
      allItems = allItems.concat(JSON.parse(offersData));
    }

    // Search and score results
    const results: SearchResult[] = [];

    allItems.forEach(item => {
      let relevance = 0;

      // Title match (highest priority)
      if (item.title.toLowerCase().includes(searchQuery)) {
        relevance += 10;
        if (item.title.toLowerCase().startsWith(searchQuery)) {
          relevance += 5; // Boost for prefix match
        }
      }

      // Description match
      if (item.description.toLowerCase().includes(searchQuery)) {
        relevance += 3;
      }

      // Keywords match
      item.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(searchQuery)) {
          relevance += 2;
        }
      });

      // Category match
      if (item.category.toLowerCase().includes(searchQuery)) {
        relevance += 4;
      }

      // Type filter (apply only if query exists)
      if (type && item.type !== type && type !== 'all') {
        relevance = 0;
      }

      // Only include results with some relevance or if no query and type matches
      if (relevance > 0) {
        results.push({
          id: item.id,
          title: item.title,
          type: item.type,
          category: item.category,
          slug: item.slug,
          image: item.image,
          description: item.description,
          relevance,
          views: item.views,
          unlocks: item.unlocks
        });
      }
    });

    // Sort by relevance (descending) and limit results
    const sortedResults = results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, parseInt(limit as string));

    res.json(sortedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}