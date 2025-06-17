const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/unlockvault?retryWrites=true&w=majority';

async function migrateData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('unlockvault');
    
    // Migrate offers
    const offersPath = path.join(__dirname, '../data/offers.json');
    if (fs.existsSync(offersPath)) {
      const offersData = JSON.parse(fs.readFileSync(offersPath, 'utf-8'));
      const offersCollection = db.collection('offers');
      
      // Clear existing data
      await offersCollection.deleteMany({});
      
      // Insert new data
      if (offersData.length > 0) {
        await offersCollection.insertMany(offersData);
        console.log(`Migrated ${offersData.length} offers`);
      }
    }
    
    // Migrate visits
    const visitsPath = path.join(__dirname, '../data/visits.json');
    if (fs.existsSync(visitsPath)) {
      const visitsData = JSON.parse(fs.readFileSync(visitsPath, 'utf-8'));
      const visitsCollection = db.collection('visits');
      
      // Clear existing data
      await visitsCollection.deleteMany({});
      
      // Insert new data
      if (visitsData.length > 0) {
        await visitsCollection.insertMany(visitsData);
        console.log(`Migrated ${visitsData.length} visits`);
      }
    }
    
    // Migrate testimonials
    const testimonialsPath = path.join(__dirname, '../data/testimonials.json');
    if (fs.existsSync(testimonialsPath)) {
      const testimonialsData = JSON.parse(fs.readFileSync(testimonialsPath, 'utf-8'));
      const testimonialsCollection = db.collection('testimonials');
      
      // Clear existing data
      await testimonialsCollection.deleteMany({});
      
      // Insert new data
      if (testimonialsData.length > 0) {
        await testimonialsCollection.insertMany(testimonialsData);
        console.log(`Migrated ${testimonialsData.length} testimonials`);
      }
    }
    
    // Migrate categories
    const categoriesPath = path.join(__dirname, '../data/categories.json');
    if (fs.existsSync(categoriesPath)) {
      const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
      const categoriesCollection = db.collection('categories');
      
      // Clear existing data
      await categoriesCollection.deleteMany({});
      
      // Insert new data
      if (categoriesData.length > 0) {
        await categoriesCollection.insertMany(categoriesData);
        console.log(`Migrated ${categoriesData.length} categories`);
      }
    }
    
    // Migrate settings
    const settingsPath = path.join(__dirname, '../data/settings.json');
    if (fs.existsSync(settingsPath)) {
      const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      const settingsCollection = db.collection('settings');
      
      // Clear existing data
      await settingsCollection.deleteMany({});
      
      // Insert settings as a single document
      await settingsCollection.insertOne(settingsData);
      console.log('Migrated settings');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

// Run migration
migrateData(); 