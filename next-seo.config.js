const SEO = {
  titleTemplate: '%s | UnlockVault - Premium Software & Digital Tools',
  defaultTitle: 'UnlockVault - Premium Software, Games, Apps & Digital Tools',
  description: 'Discover premium software, games, applications, and digital tools. Get access to professional software, latest games, productivity apps, and development tools with UnlockVault.',
  canonical: 'https://unlockvault.xyz',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://unlockvault.xyz',
    siteName: 'UnlockVault',
    title: 'UnlockVault - Premium Software & Digital Tools',
    description: 'Discover premium software, games, applications, and digital tools. Get access to professional software, latest games, productivity apps, and development tools.',
    images: [
      {
        url: 'https://unlockvault.xyz/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UnlockVault - Premium Software & Digital Tools',
        type: 'image/jpeg',
      },
      {
        url: 'https://unlockvault.xyz/images/og-image-square.jpg',
        width: 1080,
        height: 1080,
        alt: 'UnlockVault Logo',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    handle: '@UnlockVault',
    site: '@UnlockVault',
    cardType: 'summary_large_image',
    creator: '@UnlockVault'
  },
  facebook: {
    appId: '1234567890123456' // Replace with actual Facebook App ID
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0'
    },
    {
      name: 'theme-color',
      content: '#8B5CF6'
    },
    {
      name: 'msapplication-TileColor',
      content: '#8B5CF6'
    },
    {
      name: 'msapplication-config',
      content: '/browserconfig.xml'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent'
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'UnlockVault'
    },
    {
      name: 'application-name',
      content: 'UnlockVault'
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    },
    {
      name: 'googlebot',
      content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1'
    },
    {
      name: 'bingbot',
      content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1'
    },
    {
      name: 'keywords',
      content: 'premium software, games download, applications, digital tools, productivity software, development tools, creative software, gaming, tech tools, software solutions'
    },
    {
      name: 'author',
      content: 'UnlockVault Team'
    },
    {
      name: 'publisher',
      content: 'UnlockVault'
    },
    {
      name: 'copyright',
      content: '© 2024 UnlockVault. All rights reserved.'
    },
    {
      name: 'language',
      content: 'English'
    },
    {
      name: 'distribution',
      content: 'global'
    },
    {
      name: 'rating',
      content: 'general'
    }
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    {
      rel: 'mask-icon',
      href: '/safari-pinned-tab.svg',
      color: '#8B5CF6',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'dns-prefetch',
      href: 'https://www.google-analytics.com',
    },
    {
      rel: 'dns-prefetch',
      href: 'https://www.googletagmanager.com',
    },
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'UnlockVault RSS Feed',
      href: 'https://unlockvault.xyz/rss.xml',
    }
  ],
  languageAlternates: [
    {
      hrefLang: 'en',
      href: 'https://unlockvault.xyz',
    }
  ]
};

export default SEO; 