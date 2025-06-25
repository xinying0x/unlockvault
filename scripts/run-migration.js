/**
 * This script runs the migration of articles from JSON files to MongoDB
 * It can be used in production environments where direct file access is restricted
 */

// Set MongoDB connection string directly if needed
// process.env.MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/dbname';
// process.env.MONGODB_DB = 'dbname';

const { migrateArticlesToMongoDB } = require('./migrate-articles-to-mongodb');

console.log('Starting migration process...');

migrateArticlesToMongoDB()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 