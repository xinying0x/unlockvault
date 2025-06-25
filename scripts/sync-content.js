const { syncAllContent } = require('../lib/syncArticles');

async function runSync() {
  try {
    console.log('🚀 Starting content synchronization...');
    
    await syncAllContent();
    
    console.log('✅ Content synchronization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during content synchronization:', error);
    process.exit(1);
  }
}

runSync(); 