/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://unlockvault.xyz',
  generateRobotsTxt: true,
  exclude: ['/admin-xyz123/*', '/api/*', '/vpn-blocked'],
  additionalPaths: async (config) => {
    const result = [];
    
    // Add dynamic offer pages
    try {
      const response = await fetch(`${config.siteUrl}/api/offers`);
      if (response.ok) {
        const offers = await response.json();
        offers.forEach(offer => {
          result.push({
            loc: `/offers/${offer.slug || offer.id}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: offer.addedAt || new Date().toISOString()
          });
        });
      }
    } catch (error) {
      console.warn('Could not fetch offers for sitemap:', error);
    }
    
    return result;
  },
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin-xyz123/*', '/api/*'],
      },
    ],
  },
}; 