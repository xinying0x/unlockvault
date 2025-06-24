const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockvault';

async function seedArticles() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const articlesCollection = db.collection('articles');
    
    // Read sample articles data
    const articlesPath = path.join(__dirname, '..', 'data', 'articles.json');
    const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    
    // Clear existing articles (optional)
    await articlesCollection.deleteMany({});
    console.log('Cleared existing articles');
    
    // Insert sample articles
    const result = await articlesCollection.insertMany(articlesData);
    console.log(`Inserted ${result.insertedCount} articles`);
    
    // Create indexes for better performance
    await articlesCollection.createIndex({ slug: 1 }, { unique: true });
    await articlesCollection.createIndex({ published: 1 });
    await articlesCollection.createIndex({ category: 1 });
    await articlesCollection.createIndex({ createdAt: -1 });
    await articlesCollection.createIndex({ tags: 1 });
    
    console.log('Created database indexes');
    console.log('Articles seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding articles:', error);
  } finally {
    await client.close();
  }
}

seedArticles(); 