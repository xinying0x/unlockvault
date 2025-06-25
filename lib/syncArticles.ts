import clientPromise from './mongodb';
import fs from 'fs/promises';
import path from 'path';
import { cache } from './cache';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
  lastModified?: string;
  updatedAt?: string;
}

/**
 * Sync articles from MongoDB to JSON file for search functionality
 */
export async function syncArticlesToFile(): Promise<void> {
  try {
    console.log('🔄 Starting articles sync from MongoDB to JSON...');
    
    const client = await clientPromise;
    const db = client.db('unlockvault');
    
    // Get all articles from MongoDB
    const articles = await db.collection('articles').find({}).toArray();
    
    // Transform MongoDB documents to match expected format
    const transformedArticles: ArticleData[] = articles.map(article => ({
      id: article._id.toString(),
      slug: article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: article.title,
      summary: article.summary || '',
      content: article.content,
      image: article.image || '/images/placeholder.png',
      author: article.author || 'Anonymous',
      category: article.category || 'General',
      tags: article.tags || [],
      published: article.published || false,
      views: article.views || 0,
      createdAt: article.createdAt || new Date().toISOString(),
      lastModified: article.lastModified || article.updatedAt || new Date().toISOString(),
      updatedAt: article.updatedAt || article.createdAt || new Date().toISOString()
    }));
    
    // Ensure data directory exists
    const dataDir = path.dirname(ARTICLES_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write to JSON file
    await fs.writeFile(ARTICLES_FILE, JSON.stringify(transformedArticles, null, 2));
    
    // Clear all search cache
    cache.clear();
    
    console.log(`✅ Successfully synced ${transformedArticles.length} articles to JSON file`);
    console.log(`📂 File location: ${ARTICLES_FILE}`);
    
  } catch (error) {
    console.error('❌ Error syncing articles to file:', error);
    throw error;
  }
}

/**
 * Auto-sync articles when database changes are detected
 */
export async function autoSyncArticles(): Promise<void> {
  try {
    await syncArticlesToFile();
  } catch (error) {
    console.error('Auto-sync articles failed:', error);
    // Don't throw error to prevent breaking the main operation
  }
}

/**
 * Get articles count from MongoDB vs JSON file for comparison
 */
export async function getArticlesSyncStatus(): Promise<{
  mongoCount: number;
  fileCount: number;
  lastSync: string | null;
  needsSync: boolean;
}> {
  try {
    // Get MongoDB count
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const mongoCount = await db.collection('articles').countDocuments();
    
    // Get JSON file count
    let fileCount = 0;
    let lastSync = null;
    
    try {
      const fileContents = await fs.readFile(ARTICLES_FILE, 'utf8');
      const articles = JSON.parse(fileContents);
      fileCount = articles.length;
      
      // Get file modification time
      const stats = await fs.stat(ARTICLES_FILE);
      lastSync = stats.mtime.toISOString();
    } catch (error) {
      // File doesn't exist or is corrupted
      fileCount = 0;
    }
    
    const needsSync = mongoCount !== fileCount;
    
    return {
      mongoCount,
      fileCount,
      lastSync,
      needsSync
    };
    
  } catch (error) {
    console.error('Error checking articles sync status:', error);
    return {
      mongoCount: 0,
      fileCount: 0,
      lastSync: null,
      needsSync: true
    };
  }
}

/**
 * Sync both articles and offers
 */
export async function syncAllContent(): Promise<void> {
  try {
    console.log('🔄 Starting full content sync...');
    
    // Import syncOffers function
    const { syncOffersToFile } = await import('./syncOffers');
    
    // Sync both articles and offers
    await Promise.all([
      syncArticlesToFile(),
      syncOffersToFile()
    ]);
    
    console.log('✅ Full content sync completed successfully');
    
  } catch (error) {
    console.error('❌ Error during full content sync:', error);
    throw error;
  }
} 