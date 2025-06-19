import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  noindex?: boolean;
  structuredData?: any;
}

export default function SEOHead({
  title = 'UnlockVault - Premium Tools & Apps for Free',
  description = 'Access premium tools, cracked apps, game hacks, and AI tools for free. Unlock your potential with UnlockVault - your trusted source for premium software.',
  image = '/og-image.jpg',
  url = 'https://unlockvault.xyz',
  type = 'website',
  keywords = [
    'premium tools', 'cracked apps', 'game hacks', 'AI tools', 'free software',
    'download premium software free', 'unlock premium apps', 'free premium tools 2025',
    'cracked software download', 'premium apps free download', 'unlock vault tools'
  ],
  publishedTime,
  modifiedTime,
  author = 'UnlockVault',
  category,
  noindex = false,
  structuredData
}: SEOHeadProps) {
  const fullTitle = title.includes('UnlockVault') ? title : `${title} | UnlockVault`;
  const fullImageUrl = image.startsWith('http') ? image : `https://unlockvault.xyz${image}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Robots Meta */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="UnlockVault" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {category && <meta property="article:section" content={category} />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@unlockvault" />
      <meta name="twitter:creator" content="@unlockvault" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      <meta name="application-name" content="UnlockVault" />
      <meta name="apple-mobile-web-app-title" content="UnlockVault" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* DNS Prefetch for external resources */}
      <link rel="dns-prefetch" href="//i.pinimg.com" />
      <link rel="dns-prefetch" href="//i.postimg.cc" />
      
      {/* Default Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "UnlockVault",
            "alternateName": "Unlock Vault",
            "description": description,
            "url": url,
            "publisher": {
              "@type": "Organization",
              "name": "UnlockVault",
              "logo": {
                "@type": "ImageObject",
                "url": "https://unlockvault.xyz/logo.svg"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://unlockvault.xyz/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      
      {/* Custom Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      
      {/* Breadcrumb Schema */}
      {category && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://unlockvault.xyz"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": category,
                  "item": `https://unlockvault.xyz/${category.toLowerCase()}`
                }
              ]
            })
          }}
        />
      )}
    </Head>
  );
} 