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
        
        {/* Hotjar Tracking Code with Error Handling */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:6438859,hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  r.onerror = function() {
                    console.warn('Hotjar script blocked by ad blocker');
                  };
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                console.log('Hotjar tracking initialized');
              } catch (error) {
                console.warn('Hotjar failed to load:', error);
              }
            `
          }}
        />
        
        {/* Microsoft Clarity Tracking Code with Error Handling */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  t.onerror = function() {
                    console.warn('Microsoft Clarity script blocked by ad blocker');
                  };
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "s1facumamm");
                console.log('Microsoft Clarity tracking initialized');
              } catch (error) {
                console.warn('Microsoft Clarity failed to load:', error);
              }
            `
          }}
        />
        
        {/* Analytics Fallback Detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Check if analytics are blocked and provide fallback
              setTimeout(function() {
                const analyticsBlocked = {
                  gtag: typeof window.gtag === 'undefined',
                  hotjar: typeof window.hj === 'undefined',
                  clarity: typeof window.clarity === 'undefined'
                };
                
                if (analyticsBlocked.gtag || analyticsBlocked.hotjar || analyticsBlocked.clarity) {
                  console.warn('Some analytics services are blocked:', analyticsBlocked);
                  
                  // Send notification to server about blocked analytics
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/analytics', JSON.stringify({
                      event: 'analytics_blocked',
                      blocked: analyticsBlocked,
                      userAgent: navigator.userAgent,
                      timestamp: new Date().toISOString()
                    }));
                  }
                }
              }, 3000);
            `
          }}
        />
        
        {/* Adsterra Advertisement Script */}
        <script
          type='text/javascript'
          src='//pl26969556.profitableratecpm.com/37/1d/25/371d25654ccae832cb32f47b040d26ff.js'
          async
          onError={() => console.warn('Adsterra script blocked or failed to load')}
        />
        
        {/* Preload Critical Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://static.hotjar.com" />
        <link rel="preconnect" href="https://insights.hotjar.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="//pl26969556.profitableratecpm.com" />
        
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