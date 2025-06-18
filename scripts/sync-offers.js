const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://unlockvault:HM1b5XXUeTQ8fkZK@unlockvault.maja2ph.mongodb.net/unlockvault.xyz?retryWrites=true&w=majority';
const OFFERS_FILE = path.join(__dirname, '..', 'data', 'offers.json');

async function syncOffersToFile() {
  let client;
  
  try {
    console.log('🔄 Starting offers sync from MongoDB to JSON...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('unlockvault');
    
    // Get all offers from MongoDB
    const offers = await db.collection('offers').find({}).toArray();
    
    console.log(`📊 Found ${offers.length} offers in MongoDB`);
    
    // Transform MongoDB documents to match expected format
    const transformedOffers = offers.map(offer => ({
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
    
    // Write to JSON file
    await fs.writeFile(OFFERS_FILE, JSON.stringify(transformedOffers, null, 2));
    
    console.log(`✅ Successfully synced ${transformedOffers.length} offers to JSON file`);
    console.log(`📂 File location: ${OFFERS_FILE}`);
    
    return {
      success: true,
      count: transformedOffers.length
    };
    
  } catch (error) {
    console.error('❌ Error syncing offers to file:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Main execution
async function main() {
  const command = process.argv[2] || 'sync';
  
  if (command === 'sync') {
    const result = await syncOffersToFile();
    if (result.success) {
      console.log('🎉 Sync completed successfully!');
      process.exit(0);
    } else {
      console.error('💥 Sync failed!');
      process.exit(1);
    }
  } else {
    console.log('Usage: node scripts/sync-offers.js [sync]');
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { syncOffersToFile }; 