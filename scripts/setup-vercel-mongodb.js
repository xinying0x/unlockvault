const { MongoClient } = require("mongodb");

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "unlockvault";

if (!MONGODB_URI) {
  console.error("No MONGODB_URI environment variable found");
  process.exit(1);
}

async function setupMongoDB() {
  console.log("Setting up MongoDB collections and indexes...");
  console.log("Using database: " + MONGODB_DB);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db(MONGODB_DB);
    
    // Setup articles collection
    const articlesCollection = db.collection("articles");
    console.log("Setting up articles collection...");
    
    // Create indexes for articles
    await articlesCollection.createIndex({ slug: 1 }, { unique: true });
    await articlesCollection.createIndex({ published: 1 });
    await articlesCollection.createIndex({ category: 1 });
    await articlesCollection.createIndex({ createdAt: -1 });
    await articlesCollection.createIndex({ tags: 1 });
    
    // Check if articles collection is empty
    const articlesCount = await articlesCollection.countDocuments();
    console.log("Found " + articlesCount + " articles in database");
    
    console.log("MongoDB setup completed successfully!");
    
  } catch (error) {
    console.error("MongoDB setup failed:", error);
    // Do not exit with error to allow build to continue
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run setup
setupMongoDB();
