import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Structured Data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://unlockvault.xyz/#organization",
        "name": "UnlockVault",
        "alternateName": ["Unlock Vault", "UnlockVault.xyz"],
        "url": "https://unlockvault.xyz",
        "logo": {
          "@type": "ImageObject",
          "url": "https://unlockvault.xyz/logo.svg",
          "width": 512,
          "height": 512
        },
        "description": "UnlockVault - Premium software, games, apps & digital tools. Unlock premium content for free.",
        "foundingDate": "2024",
        "sameAs": [
          "https://unlockvault.xyz"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "url": "https://unlockvault.xyz"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://unlockvault.xyz/#website",
        "url": "https://unlockvault.xyz",
        "name": "UnlockVault - Premium Software & Digital Tools",
        "alternateName": ["UnlockVault", "Unlock Vault"],
        "description": "UnlockVault - Discover premium software, games, applications, and digital tools. Get access to professional software, latest games, productivity apps, and development tools. Unlock premium content for free.",
        "publisher": {
          "@id": "https://unlockvault.xyz/#organization"
        },
        "inLanguage": "en-US",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://unlockvault.xyz/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://unlockvault.xyz/#webpage",
        "url": "https://unlockvault.xyz",
        "name": "UnlockVault - Premium Software, Games, Apps & Digital Tools",
        "isPartOf": {
          "@id": "https://unlockvault.xyz/#website"
        },
        "about": {
          "@id": "https://unlockvault.xyz/#organization"
        },
        "description": "UnlockVault - Discover premium software, games, applications, and digital tools. Get access to professional software, latest games, productivity apps, and development tools. Unlock premium content for free.",
        "breadcrumb": {
          "@id": "https://unlockvault.xyz/#breadcrumb"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://unlockvault.xyz/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://unlockvault.xyz"
          }
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

        {/* Additional meta tags for better search visibility */}
        <meta name="google-site-verification" content="UnlockVault-Premium-Software-Games-Apps" />
        <meta name="msvalidate.01" content="UnlockVault-Premium-Digital-Tools" />
        <meta name="yandex-verification" content="UnlockVault-Software-Vault" />
        
        {/* Rich snippets support */}
        <meta property="article:publisher" content="https://unlockvault.xyz" />
        <meta property="article:author" content="UnlockVault Team" />
        
        {/* Additional search keywords for partial matching */}
        <meta name="search-title" content="UnlockVault unlock vault premium software games apps tools" />
        <meta name="alternate-names" content="unlock vault, unlockv, unlockvault, vault software, premium vault" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        
        {/* Dynamic Favicon */}
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.svg" />
        
        {/* Meta Tags */}
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="description" content="UnlockVault - Premium Tools, Apps & Games. Unlock exclusive content with our secure platform." />
        <meta name="keywords" content="unlock, premium tools, apps, games, software, download" />
        <meta name="author" content="UnlockVault" />
        {/* Google AdSense Site Verification */}
        <meta name="google-adsense-account" content="ca-pub-9040874024446421" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="UnlockVault - Premium Tools & Apps" />
        <meta property="og:description" content="Discover and unlock premium tools, apps, and games. Your gateway to exclusive content." />
        <meta property="og:image" content="/logo.svg" />
        <meta property="og:site_name" content="UnlockVault" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="UnlockVault - Premium Tools & Apps" />
        <meta name="twitter:description" content="Discover and unlock premium tools, apps, and games. Your gateway to exclusive content." />
        <meta name="twitter:image" content="/logo.svg" />
        
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