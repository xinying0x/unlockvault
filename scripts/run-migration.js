/**
 * This script runs the migration of articles from JSON files to MongoDB
 * It can be used in production environments where direct file access is restricted
 */

// Set MongoDB connection string directly if needed
// process.env.MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/dbname';
// process.env.MONGODB_DB = 'dbname';

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Configuration
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockvault';
const dbName = process.env.MONGODB_DB || 'unlockvault';
const dataDir = path.join(__dirname, '../data');

// Function to read JSON file
function readJsonFile(filePath) {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Function to migrate articles from JSON to MongoDB
async function migrateArticles(db) {
  console.log('Migrating articles...');
  
  const articlesFilePath = path.join(dataDir, 'articles.json');
  const articles = readJsonFile(articlesFilePath);
  
  if (!articles || !Array.isArray(articles)) {
    console.error('Invalid or empty articles data');
    return;
  }
  
  const collection = db.collection('articles');
  
  // Get existing articles from MongoDB
  const existingArticles = await collection.find({}).toArray();
  const existingSlugs = new Set(existingArticles.map(article => article.slug));
  
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const article of articles) {
    // Ensure article has all required fields
    if (!article.slug || !article.title) {
      console.warn('Skipping article without slug or title:', article.id || 'unknown');
      skipped++;
      continue;
    }
    
    // Add timestamps if missing
    if (!article.createdAt) {
      article.createdAt = new Date().toISOString();
    }
    
    if (!article.updatedAt) {
      article.updatedAt = new Date().toISOString();
    }
    
    try {
      if (existingSlugs.has(article.slug)) {
        // Update existing article
        const result = await collection.updateOne(
          { slug: article.slug },
          { $set: { ...article, lastModified: new Date().toISOString() } }
        );
        
        if (result.modifiedCount > 0) {
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Insert new article
        await collection.insertOne({
          ...article,
          views: article.views || 0,
          lastModified: new Date().toISOString()
        });
        inserted++;
      }
    } catch (error) {
      console.error(`Error processing article ${article.slug}:`, error);
      skipped++;
    }
  }
  
  console.log(`Articles migration completed: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
}

// Function to migrate other collections
async function migrateCollection(db, collectionName) {
  console.log(`Migrating ${collectionName}...`);
  
  const filePath = path.join(dataDir, `${collectionName}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${collectionName}: file not found`);
    return;
  }
  
  const data = readJsonFile(filePath);
  
  if (!data || !Array.isArray(data)) {
    console.error(`Invalid or empty ${collectionName} data`);
    return;
  }
  
  const collection = db.collection(collectionName);
  
  try {
    // For simple collections, just replace the data
    await collection.deleteMany({});
    
    if (data.length > 0) {
      await collection.insertMany(data);
    }
    
    console.log(`${collectionName} migration completed: ${data.length} records processed`);
  } catch (error) {
    console.error(`Error migrating ${collectionName}:`, error);
  }
}

// Main migration function
async function runMigration() {
  console.log('Starting data migration to MongoDB...');
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true
  });
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Migrate articles (special handling)
    await migrateArticles(db);
    
    // Migrate other collections
    const otherCollections = ['categories', 'offers', 'settings', 'testimonials', 'tools', 'visits'];
    
    for (const collectionName of otherCollections) {
      await migrateCollection(db, collectionName);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
runMigration().catch(console.error); 