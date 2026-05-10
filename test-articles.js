// Test script for articles APIs
console.log('🧪 Testing Articles APIs...\n');

// Test 1: Get all articles
async function testGetAllArticles() {
  try {
    console.log('📋 Testing GET /api/articles');
    const response = await fetch('http://localhost:3000/api/articles');
    const articles = await response.json();
    console.log(`✅ Success: Found ${articles.length} articles`);
    console.log(`   First article: ${articles[0]?.title || 'None'}\n`);
    return articles;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return [];
  }
}

// Test 2: Get specific article
async function testGetSpecificArticle() {
  try {
    console.log('📄 Testing GET /api/articles/how-to-get-canva-pro-for-free');
    const response = await fetch('http://localhost:3000/api/articles/how-to-get-canva-pro-for-free');
    
    if (response.ok) {
      const article = await response.json();
      console.log(`✅ Success: Article "${article.title}" loaded`);
      console.log(`   Views: ${article.views}, Published: ${article.published}\n`);
    } else {
      console.log(`❌ Error: ${response.status} - ${response.statusText}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

// Test 3: Create new article
async function testCreateArticle() {
  try {
    console.log('➕ Testing POST /api/articles');
    const newArticle = {
      title: 'Test Article from API',
      summary: 'This is a test article created via API',
      content: '<h1>Test Article</h1><p>This is test content.</p>',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
      author: 'API Tester',
      category: 'How-to',
      tags: ['test', 'api'],
      published: true
    };

    const response = await fetch('http://localhost:3000/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArticle)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success: Article created with ID ${result.id}`);
      console.log(`   Slug: ${result.slug}\n`);
      return result;
    } else {
      console.log(`❌ Error: ${result.message || 'Unknown error'}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

// Test 4: Get articles for admin (all published and unpublished)
async function testGetAllArticlesForAdmin() {
  try {
    console.log('👨‍💼 Testing GET /api/articles?published=all (Admin view)');
    const response = await fetch('http://localhost:3000/api/articles?published=all');
    const articles = await response.json();
    
    if (Array.isArray(articles)) {
      const published = articles.filter(a => a.published).length;
      const unpublished = articles.filter(a => !a.published).length;
      console.log(`✅ Success: Found ${articles.length} total articles`);
      console.log(`   Published: ${published}, Unpublished: ${unpublished}\n`);
    } else {
      console.log(`❌ Error: Expected array, got ${typeof articles}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

// Run all tests
async function runTests() {
  await testGetAllArticles();
  await testGetSpecificArticle();
  await testCreateArticle();
  await testGetAllArticlesForAdmin();
  console.log('🏁 Testing complete!');
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment
  runTests();
} 