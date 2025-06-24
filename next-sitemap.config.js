/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://unlockvault.xyz',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin-xyz123/*',
    '/api/*',
    '/404',
    '/_error',
    '/_document',
    '/_app'
  ],
  additionalPaths: async (config) => {
    const result = [];

    // Add dynamic article paths
    try {
      const articles = require('./data/articles.json');
      articles.forEach(article => {
        result.push({
          loc: `/articles/${article.slug}`,
          lastmod: article.lastModified || article.createdAt,
          changefreq: 'weekly',
          priority: 0.8
        });
      });
    } catch (error) {
      console.log('Articles data not found for sitemap generation');
    }

    // Add dynamic offer paths
    try {
      const offers = require('./data/offers.json');
      offers.forEach(offer => {
        result.push({
          loc: `/offers/${offer.slug || offer.id}`,
          lastmod: offer.lastModified || offer.createdAt,
          changefreq: 'weekly',
          priority: 0.7
        });
      });
    } catch (error) {
      console.log('Offers data not found for sitemap generation');
    }

    // Add category pages
    try {
      const categories = require('./data/categories.json');
      categories.forEach(category => {
        result.push({
          loc: `/categories?filter=${encodeURIComponent(category.name)}`,
          changefreq: 'weekly',
          priority: 0.6
        });
      });
    } catch (error) {
      console.log('Categories data not found for sitemap generation');
    }

    return result;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin-xyz123/',
          '/api/',
          '/_next/',
          '/404',
          '/_error'
        ]
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin-xyz123/', '/api/']
      }
    ],
    additionalSitemaps: [
      'https://unlockvault.xyz/sitemap.xml'
    ]
  },
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/articles')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/offers')) {
      priority = 0.7;
      changefreq = 'weekly';
    } else if (path === '/search' || path === '/categories') {
      priority = 0.6;
      changefreq = 'weekly';
    } else if (path === '/tools' || path === '/games' || path === '/apps') {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? []
    };
  }
}; 