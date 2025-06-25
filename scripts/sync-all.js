#!/usr/bin/env node

const path = require('path');

// Set NODE_ENV to production for MongoDB connection
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Add the project root to require path
require('module').globalPaths.push(path.join(__dirname, '..'));

async function syncContent() {
  try {
    console.log('🚀 Starting content synchronization...');
    console.log('📦 Loading sync modules...');

    // Dynamic imports to handle ES modules
    const syncArticles = require('../lib/syncArticles');
    const syncOffers = require('../lib/syncOffers');

    console.log('🔄 Syncing articles...');
    await syncArticles.syncArticlesToFile();

    console.log('🔄 Syncing offers...');
    await syncOffers.syncOffersToFile();

    console.log('✅ All content synchronized successfully!');
    console.log('📊 Updated search indexes for both articles and offers');

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the sync
syncContent(); 