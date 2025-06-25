const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  console.log('Setting up MongoDB collections and indexes...');
  
  // Use fallback values if environment variables are not set
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockvault';
  const dbName = process.env.MONGODB_DB || 'unlockvault';
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  
  console.log(`Connecting to MongoDB at ${uri.split('@')[0].includes('://') ? uri.split('@')[0].split('://')[0] + '://*****:****@' + uri.split('@')[1] : uri}`);
  
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
    
    // Setup collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = [
      'articles',
      'offers',
      'tools',
      'users',
      'visits',
      'categories',
      'testimonials',
      'settings'
    ];
    
    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        console.log(`Creating collection: ${collectionName}`);
        await db.createCollection(collectionName);
      } else {
        console.log(`Collection already exists: ${collectionName}`);
      }
    }
    
    // Create indexes
    console.log('Creating indexes...');
    
    // Articles indexes
    await db.collection('articles').createIndex({ slug: 1 }, { unique: true });
    await db.collection('articles').createIndex({ title: 'text', summary: 'text', content: 'text' });
    await db.collection('articles').createIndex({ category: 1 });
    await db.collection('articles').createIndex({ published: 1 });
    await db.collection('articles').createIndex({ createdAt: -1 });
    
    // Offers indexes
    await db.collection('offers').createIndex({ slug: 1 }, { unique: true });
    await db.collection('offers').createIndex({ title: 'text', description: 'text' });
    await db.collection('offers').createIndex({ category: 1 });
    await db.collection('offers').createIndex({ featured: 1 });
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Visits indexes
    await db.collection('visits').createIndex({ timestamp: -1 });
    await db.collection('visits').createIndex({ ip: 1 });
    
    console.log('MongoDB setup completed successfully');
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the setup function
setupMongoDB().catch(console.error);
