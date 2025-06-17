export default {
  titleTemplate: '%s | UnlockVault',
  defaultTitle: 'UnlockVault - Premium Tools & Apps',
  description: 'Access premium tools, apps, and games with UnlockVault. Your trusted source for premium software solutions.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://unlockvault.com/',
    site_name: 'UnlockVault',
    images: [
      {
        url: 'https://unlockvault.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UnlockVault',
      },
    ],
  },
  twitter: {
    handle: '@unlockvault',
    site: '@unlockvault',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'premium tools, apps, games, software, downloads, unlock, premium access',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
  ],
} 