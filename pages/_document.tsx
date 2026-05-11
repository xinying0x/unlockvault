import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Structured Data for better SEO — Organization logo + Sitelinks
  const SITE_URL = "https://unlockvault.xyz";
  const LOGO_URL = `${SITE_URL}/logo-512.svg`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "UnlockVault",
        "alternateName": ["Unlock Vault", "UnlockVault.xyz"],
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          "inLanguage": "en-US",
          "url": LOGO_URL,
          "contentUrl": LOGO_URL,
          "width": 512,
          "height": 512,
          "caption": "UnlockVault"
        },
        "image": { "@id": `${SITE_URL}/#logo` },
        "description": "UnlockVault — Premium software, games, apps and digital tools. Unlock premium content for free.",
        "foundingDate": "2024",
        "sameAs": [
          "https://twitter.com/UnlockVault",
          "https://facebook.com/UnlockVault",
          "https://www.instagram.com/UnlockVault",
          "https://www.youtube.com/@UnlockVault"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "UnlockVault",
        "alternateName": ["Unlock Vault", "UnlockVault.xyz"],
        "description": "Discover premium software, games, applications and digital tools. Unlock premium content for free.",
        "publisher": { "@id": `${SITE_URL}/#organization` },
        "inLanguage": "en-US",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        "url": SITE_URL,
        "name": "UnlockVault — Premium Software, Games, Apps & Digital Tools",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "about": { "@id": `${SITE_URL}/#organization` },
        "primaryImageOfPage": { "@id": `${SITE_URL}/#logo` },
        "description": "UnlockVault — Discover premium software, games, applications and digital tools. Unlock premium content for free.",
        "breadcrumb": { "@id": `${SITE_URL}/#breadcrumb` },
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL }
        ]
      },
      // Sitelinks hint — these are the main sections of the site (Apps, Games, Tools, Articles)
      {
        "@type": "SiteNavigationElement",
        "@id": `${SITE_URL}/#nav`,
        "name": ["Apps", "Games", "Tools", "Articles", "Categories", "Search"],
        "url": [
          `${SITE_URL}/apps`,
          `${SITE_URL}/games`,
          `${SITE_URL}/tools`,
          `${SITE_URL}/articles`,
          `${SITE_URL}/categories`,
          `${SITE_URL}/search`
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#sections`,
        "name": "UnlockVault main sections",
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "numberOfItems": 4,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Apps",     "url": `${SITE_URL}/apps`,     "description": "Premium and modded apps" },
          { "@type": "ListItem", "position": 2, "name": "Games",    "url": `${SITE_URL}/games`,    "description": "Latest premium and modded games" },
          { "@type": "ListItem", "position": 3, "name": "Tools",    "url": `${SITE_URL}/tools`,    "description": "Professional digital tools" },
          { "@type": "ListItem", "position": 4, "name": "Articles", "url": `${SITE_URL}/articles`, "description": "Tech articles, tutorials and reviews" }
        ]
      }
    ]
  };

  return (
    <Html lang="en" data-critters-container>
      <Head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />

        {/* NOTE: Add real verification codes here from Google/Bing Search Console */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}
        {/* <meta name="msvalidate.01" content="YOUR_BING_CODE" /> */}

        {/* Rich snippets support */}
        <meta property="article:publisher" content="https://unlockvault.xyz" />

        {/* Favicons — use static logo so Google can crawl it */}
        <link rel="icon" type="image/svg+xml" href="/logo-512.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo-512.svg" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preload */}
        <link rel="preload" href="/logo-512.svg" as="image" type="image/svg+xml" />

        {/* Meta Tags */}
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="description" content="UnlockVault - Premium Tools, Apps & Games. Unlock exclusive content with our secure platform." />
        <meta name="author" content="UnlockVault" />
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-9040874024446421" />

        {/* Open Graph — use absolute URLs */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="UnlockVault - Premium Tools & Apps" />
        <meta property="og:description" content="Discover and unlock premium tools, apps, and games. Your gateway to exclusive content." />
        <meta property="og:image" content="https://unlockvault.xyz/logo-512.svg" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:url" content="https://unlockvault.xyz" />
        <meta property="og:site_name" content="UnlockVault" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@UnlockVault" />
        <meta name="twitter:title" content="UnlockVault - Premium Tools & Apps" />
        <meta name="twitter:description" content="Discover and unlock premium tools, apps, and games. Your gateway to exclusive content." />
        <meta name="twitter:image" content="https://unlockvault.xyz/logo-512.svg" />
        
        {/* Google Analytics with Error Handling */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DQE75NNT98" 
          onError={() => console.warn('Google Analytics blocked by ad blocker')}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-DQE75NNT98', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
                console.log('Google Analytics loaded successfully');
              } catch (error) {
                console.warn('Google Analytics failed to load:', error);
              }
            `
          }}
        />
        

        

        

        
        {/* Adsterra Ads - Anti-Adblock Popunder */}
        <script async src="https://onionclose.com/37/1d/25/371d25654ccae832cb32f47b040d26ff.js"></script>
        {/* Preload Critical Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        
        {/* Dynamic Title Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Dynamic favicon animation
              let faviconLink = document.querySelector("link[rel*='icon']");
              let isUnlocked = false;
              
              function updateFavicon() {
                if (faviconLink) {
                  // Toggle between locked and unlocked states
                  isUnlocked = !isUnlocked;
                  const color = isUnlocked ? '#10B981' : '#8B5CF6';
                  
                  // Update theme color
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', color);
                }
              }
              
              // Update favicon every 5 seconds
              setInterval(updateFavicon, 5000);
              
              // Update title with activity indicator
              let originalTitle = document.title;
              let activityCount = 0;
              
              function updateTitle() {
                activityCount++;
                if (document.hidden) {
                  document.title = '🔓 (' + activityCount + ') ' + originalTitle;
                } else {
                  document.title = originalTitle;
                  activityCount = 0;
                }
              }
              
              document.addEventListener('visibilitychange', updateTitle);
              
              // Simulate activity updates
              setInterval(() => {
                if (document.hidden && Math.random() > 0.7) {
                  updateTitle();
                }
              }, 3000);
            `
          }}
        />
      </Head>
      <body className="bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}