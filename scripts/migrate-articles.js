const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Configuration
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockvault';
const dbName = process.env.MONGODB_DB || 'unlockvault';
const articlesFilePath = path.join(__dirname, '../data/articles.json');

async function migrateArticles() {
  console.log('Starting articles migration to MongoDB...');
  
  // Read articles from JSON file
  try {
    const articlesData = fs.readFileSync(articlesFilePath, 'utf8');
    const articles = JSON.parse(articlesData);
    
    if (!Array.isArray(articles)) {
      console.error('Articles data is not an array');
      process.exit(1);
    }
    
    console.log(`Found ${articles.length} articles in JSON file`);
    
    // Connect to MongoDB
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
      const collection = db.collection('articles');
      
      // Get existing articles from MongoDB
      const existingArticles = await collection.find({}).toArray();
      const existingSlugs = new Set(existingArticles.map(article => article.slug));
      
      console.log(`Found ${existingArticles.length} existing articles in MongoDB`);
      
      // Process articles
      let inserted = 0;
      let updated = 0;
      let skipped = 0;
      
      for (const article of articles) {
        // Ensure article has all required fields
        if (!article.slug || !article.title) {
          console.warn(`Skipping article without slug or title: ${article.id || 'unknown'}`);
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
        
        if (!article.lastModified) {
          article.lastModified = new Date().toISOString();
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
              console.log(`Updated article: ${article.title} (${article.slug})`);
            } else {
              skipped++;
              console.log(`No changes for article: ${article.title} (${article.slug})`);
            }
          } else {
            // Insert new article
            await collection.insertOne({
              ...article,
              views: article.views || 0,
              lastModified: new Date().toISOString()
            });
            inserted++;
            console.log(`Inserted article: ${article.title} (${article.slug})`);
          }
        } catch (error) {
          console.error(`Error processing article ${article.slug}:`, error);
          skipped++;
        }
      }
      
      console.log(`\nMigration completed: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
      
    } finally {
      await client.close();
      console.log('MongoDB connection closed');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateArticles().catch(console.error); 