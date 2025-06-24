const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockvault';
const DB_NAME = process.env.MONGODB_DB || 'unlockvault';

async function migrateData() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    console.log(`✅ Connected to database: ${DB_NAME}`);

    // Migrate Offers
    console.log('\n📦 Migrating offers...');
    const offersPath = path.join(__dirname, '..', 'data', 'offers.json');
    
    if (fs.existsSync(offersPath)) {
      const offersData = JSON.parse(fs.readFileSync(offersPath, 'utf8'));
      const offersCollection = db.collection('offers');
      
      // Clear existing data
      await offersCollection.deleteMany({});
      console.log('🗑️  Cleared existing offers');
      
      // Insert new data
      if (offersData.length > 0) {
        const result = await offersCollection.insertMany(offersData);
        console.log(`✅ Migrated ${result.insertedCount} offers`);
        
        // Create indexes for better performance
        await offersCollection.createIndex({ slug: 1 }, { unique: true });
        await offersCollection.createIndex({ status: 1 });
        await offersCollection.createIndex({ type: 1 });
        await offersCollection.createIndex({ category: 1 });
        await offersCollection.createIndex({ featured: 1 });
        await offersCollection.createIndex({ addedAt: -1 });
        await offersCollection.createIndex({ 
          title: 'text', 
          description: 'text', 
          keywords: 'text' 
        });
        console.log('📊 Created indexes for offers collection');
      }
    } else {
      console.log('⚠️  offers.json not found, skipping...');
    }

    // Migrate Articles
    console.log('\n📝 Migrating articles...');
    const articlesPath = path.join(__dirname, '..', 'data', 'articles.json');
    
    if (fs.existsSync(articlesPath)) {
      const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
      const articlesCollection = db.collection('articles');
      
      // Clear existing data
      await articlesCollection.deleteMany({});
      console.log('🗑️  Cleared existing articles');
      
      // Insert new data
      if (articlesData.length > 0) {
        const result = await articlesCollection.insertMany(articlesData);
        console.log(`✅ Migrated ${result.insertedCount} articles`);
        
        // Create indexes for better performance
        await articlesCollection.createIndex({ slug: 1 }, { unique: true });
        await articlesCollection.createIndex({ published: 1 });
        await articlesCollection.createIndex({ category: 1 });
        await articlesCollection.createIndex({ createdAt: -1 });
        await articlesCollection.createIndex({ 
          title: 'text', 
          summary: 'text', 
          content: 'text',
          tags: 'text'
        });
        console.log('📊 Created indexes for articles collection');
      }
    } else {
      console.log('⚠️  articles.json not found, skipping...');
    }

    // Migrate Categories
    console.log('\n🏷️  Migrating categories...');
    const categoriesPath = path.join(__dirname, '..', 'data', 'categories.json');
    
    if (fs.existsSync(categoriesPath)) {
      const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      const categoriesCollection = db.collection('categories');
      
      // Clear existing data
      await categoriesCollection.deleteMany({});
      console.log('🗑️  Cleared existing categories');
      
      // Insert new data
      if (categoriesData.length > 0) {
        const result = await categoriesCollection.insertMany(categoriesData);
        console.log(`✅ Migrated ${result.insertedCount} categories`);
        
        // Create indexes
        await categoriesCollection.createIndex({ name: 1 }, { unique: true });
        console.log('📊 Created indexes for categories collection');
      }
    } else {
      console.log('⚠️  categories.json not found, skipping...');
    }

    // Migrate Settings
    console.log('\n⚙️  Migrating settings...');
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    
    if (fs.existsSync(settingsPath)) {
      const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const settingsCollection = db.collection('settings');
      
      // Clear existing data
      await settingsCollection.deleteMany({});
      console.log('🗑️  Cleared existing settings');
      
      // Insert new data
      if (settingsData && Object.keys(settingsData).length > 0) {
        const result = await settingsCollection.insertOne({
        ...settingsData,
          updatedAt: new Date().toISOString()
      });
        console.log(`✅ Migrated settings`);
      }
    } else {
      console.log('⚠️  settings.json not found, skipping...');
    }

    // Migrate Testimonials
    console.log('\n💬 Migrating testimonials...');
    const testimonialsPath = path.join(__dirname, '..', 'data', 'testimonials.json');
    
    if (fs.existsSync(testimonialsPath)) {
      const testimonialsData = JSON.parse(fs.readFileSync(testimonialsPath, 'utf8'));
      const testimonialsCollection = db.collection('testimonials');
      
      // Clear existing data
      await testimonialsCollection.deleteMany({});
      console.log('🗑️  Cleared existing testimonials');
      
      // Insert new data
      if (testimonialsData.length > 0) {
        const result = await testimonialsCollection.insertMany(testimonialsData);
        console.log(`✅ Migrated ${result.insertedCount} testimonials`);
        
        // Create indexes
        await testimonialsCollection.createIndex({ approved: 1 });
        await testimonialsCollection.createIndex({ createdAt: -1 });
        console.log('📊 Created indexes for testimonials collection');
      }
    } else {
      console.log('⚠️  testimonials.json not found, skipping...');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Database Summary:');
    
    // Show collection stats
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
    await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run migration
if (require.main === module) {
  console.log('🚀 Starting data migration from JSON to MongoDB...');
migrateData(); 
} 