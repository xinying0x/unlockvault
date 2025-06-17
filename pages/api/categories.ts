import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json');

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  href: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Read categories
      const categoriesData = fs.readFileSync(categoriesFilePath, 'utf8');
      const categories: Category[] = JSON.parse(categoriesData);
      res.status(200).json(categories);
    } else if (req.method === 'PUT') {
      // Update categories
      const updatedCategories: Category[] = req.body;
      
      // Validate data
      if (!Array.isArray(updatedCategories)) {
        return res.status(400).json({ error: 'Invalid data format' });
      }
      
      // Write to file
      fs.writeFileSync(categoriesFilePath, JSON.stringify(updatedCategories, null, 2));
      res.status(200).json({ message: 'Categories updated successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 