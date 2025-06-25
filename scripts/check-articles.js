const { MongoClient } = require('mongodb');

async function checkArticles() {
  console.log('Checking articles in MongoDB...');
  
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
    const collection = db.collection('articles');
    
    // Check articles count
    const articlesCount = await collection.countDocuments();
    console.log(`Found ${articlesCount} articles in database`);
    
    // Get sample articles
    if (articlesCount > 0) {
      const articles = await collection.find().limit(5).toArray();
      console.log('Sample articles:');
      articles.forEach((article, index) => {
        console.log(`\nArticle ${index + 1}:`);
        console.log(`- Title: ${article.title}`);
        console.log(`- Slug: ${article.slug}`);
        console.log(`- Published: ${article.published}`);
        console.log(`- Category: ${article.category}`);
        console.log(`- Views: ${article.views}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking articles:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the check function
checkArticles().catch(console.error); 