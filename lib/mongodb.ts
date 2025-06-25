import { MongoClient } from 'mongodb';

// Use fallback values if environment variables are not set
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/unlockvault';
const dbName = process.env.MONGODB_DB || 'unlockvault';
const options = {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000,  // 45 seconds
  maxPoolSize: 50,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Connection retry mechanism
let retries = 0;
const MAX_RETRIES = 3;

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    // Reset retries on successful connection
    retries = 0;
    
    return { client, db };
  } catch (error) {
    console.error(`Failed to connect to MongoDB (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
    
    if (retries < MAX_RETRIES) {
      retries++;
      console.log(`Retrying connection in 1 second...`);
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return connectToDatabase();
    }
    
    // If we've exhausted retries, throw an error
    throw new Error(`Database connection failed after ${MAX_RETRIES} attempts`);
  }
}

// Helper function to safely handle DB operations with fallback values
export async function safeDbOperation<T>(operation: () => Promise<T>, fallbackValue: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    return fallbackValue;
  }
}

export default clientPromise; 