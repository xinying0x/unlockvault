const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockvault';
const MONGODB_DB = process.env.MONGODB_DB || 'unlockvault';

async function migrateArticlesToMongoDB() {
  console.log('🚀 Starting articles migration to MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    const collection = db.collection('articles');
    
    // Read articles from JSON file
    const articlesPath = path.join(__dirname, '..', 'data', 'articles.json');
    
    if (!fs.existsSync(articlesPath)) {
      console.log('⚠️  No articles.json file found, creating empty collection...');
      
      // Create indexes for better performance
      await collection.createIndex({ slug: 1 }, { unique: true });
      await collection.createIndex({ published: 1 });
      await collection.createIndex({ category: 1 });
      await collection.createIndex({ createdAt: -1 });
      await collection.createIndex({ tags: 1 });
      
      console.log('✅ Created indexes for articles collection');
      return;
    }
    
    const articlesData = fs.readFileSync(articlesPath, 'utf8');
    const articles = JSON.parse(articlesData);
    
    if (!Array.isArray(articles) || articles.length === 0) {
      console.log('⚠️  No articles found in JSON file');
      return;
    }
    
    console.log(`📄 Found ${articles.length} articles to migrate`);
    
    // Clear existing articles
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Removed ${deleteResult.deletedCount} existing articles`);
    
    // Insert articles
    const insertResult = await collection.insertMany(articles);
    console.log(`✅ Inserted ${insertResult.insertedCount} articles`);
    
    // Create indexes for better performance
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ published: 1 });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ tags: 1 });
    
    console.log('✅ Created indexes for articles collection');
    
    // Verify migration
    const count = await collection.countDocuments();
    console.log(`🔍 Verification: ${count} articles in database`);
    
    console.log('🎉 Articles migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateArticlesToMongoDB();
}

module.exports = { migrateArticlesToMongoDB }; 