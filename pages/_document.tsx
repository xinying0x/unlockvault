import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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
        
        {/* Preload Critical Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
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