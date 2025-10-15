import clientPromise from './mongodb';
import fs from 'fs/promises';
import path from 'path';
import { cache } from './cache';

// Resolve a writable data directory for serverless environments (e.g., Vercel)
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'unlockvault') : path.join(process.cwd(), 'data');
const OFFERS_FILE = path.join(DATA_DIR, 'offers.json');

export interface OfferData {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  lockerLinks: { [key: string]: string };
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  rating: number;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  gallery?: string[];
  features?: string[];
}

/**
 * Sync offers from MongoDB to JSON file for search functionality
 */
export async function syncOffersToFile(): Promise<void> {
  try {
    console.log('🔄 Starting offers sync from MongoDB to JSON...');
    
    const client = await clientPromise;
    const db = client.db('unlockvault');
    
    // Get all offers from MongoDB
    const offers = await db.collection('offers').find({}).toArray();
    
    // Transform MongoDB documents to match expected format
    const transformedOffers: OfferData[] = offers.map(offer => ({
      id: offer._id.toString(),
      slug: offer.slug || offer.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: offer.title,
      description: offer.description,
      image: offer.image,
      category: offer.category,
      type: offer.type,
      lockerLinks: offer.lockerLinks || {},
      views: offer.views || 0,
      unlocks: offer.unlocks || 0,
      keywords: offer.keywords || [],
      addedAt: offer.addedAt || offer.createdAt || new Date().toISOString(),
      featured: offer.featured || false,
      rating: offer.rating || 4.5,
      status: offer.status || 'active',
      gallery: offer.gallery || [],
      features: offer.features || []
    }));
    
    // Ensure data directory exists
    const dataDir = path.dirname(OFFERS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write to JSON file (use /tmp on Vercel)
    await fs.writeFile(OFFERS_FILE, JSON.stringify(transformedOffers, null, 2));
    
    // Clear all search cache
    cache.clear();
    
    console.log(`✅ Successfully synced ${transformedOffers.length} offers to JSON file`);
    console.log(`📂 File location: ${OFFERS_FILE}`);
    
  } catch (error) {
    console.error('❌ Error syncing offers to file:', error);
    throw error;
  }
}

/**
 * Auto-sync offers when database changes are detected
 */
export async function autoSyncOffers(): Promise<void> {
  try {
    await syncOffersToFile();
  } catch (error) {
    console.error('Auto-sync failed:', error);
    // Don't throw error to prevent breaking the main operation
  }
}

/**
 * Get offers count from MongoDB vs JSON file for comparison
 */
export async function getOffersSyncStatus(): Promise<{
  mongoCount: number;
  fileCount: number;
  lastSync: string | null;
  needsSync: boolean;
}> {
  try {
    // Get MongoDB count
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const mongoCount = await db.collection('offers').countDocuments();
    
    // Get JSON file count
    let fileCount = 0;
    let lastSync = null;
    
    try {
      // Prefer /tmp file on Vercel if available; otherwise fallback to repo data file
      const tmpPath = path.join('/tmp', 'unlockvault', 'offers.json');
      const repoPath = path.join(process.cwd(), 'data', 'offers.json');

      let filePathToRead = repoPath;
      try {
        const tmpStats = await fs.stat(tmpPath);
        if (tmpStats && tmpStats.isFile()) {
          filePathToRead = tmpPath;
        }
      } catch {
        // tmp file not found; keep repo path
      }

      const fileContents = await fs.readFile(filePathToRead, 'utf8');
      const offers = JSON.parse(fileContents);
      fileCount = Array.isArray(offers) ? offers.length : 0;

      const stats = await fs.stat(filePathToRead);
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
    console.error('Error checking sync status:', error);
    return {
      mongoCount: 0,
      fileCount: 0,
      lastSync: null,
      needsSync: true
    };
  }
}