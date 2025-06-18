// Structured Data for SEO Enhancement

export interface OfferStructuredData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  rating: number;
  views: number;
  unlocks: number;
  addedAt: string;
  slug: string;
}

export interface OrganizationStructuredData {
  name: string;
  url: string;
  logo: string;
  description: string;
  socialMedia: string[];
}

// Generate JSON-LD for Organization
export const generateOrganizationSchema = (baseUrl: string): any => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UnlockVault",
  "alternateName": "Unlock Vault",
  "url": baseUrl,
  "logo": `${baseUrl}/logo.svg`,
  "description": "Premium tools, apps, and games unlocked for free. Your gateway to exclusive digital content.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["English", "Arabic"]
  },
  "sameAs": [
    `${baseUrl}/privacy-policy`,
    `${baseUrl}/terms`
  ],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${baseUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

// Generate JSON-LD for Website
export const generateWebsiteSchema = (baseUrl: string): any => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UnlockVault",
  "url": baseUrl,
  "description": "Access premium tools, cracked apps, and game hacks for free. Join thousands of users unlocking their potential.",
  "publisher": {
    "@type": "Organization",
    "name": "UnlockVault",
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.svg`
    }
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${baseUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

// Generate JSON-LD for Software Application (Offer)
export const generateSoftwareSchema = (offer: OfferStructuredData, baseUrl: string): any => {
  const offerUrl = `${baseUrl}/offers/${offer.slug}`;
  const imageUrl = offer.image.startsWith('http') ? offer.image : `${baseUrl}${offer.image}`;
  
  return {
    "@context": "https://schema.org",
    "@type": offer.type === 'game' ? 'VideoGame' : 'SoftwareApplication',
    "name": offer.title,
    "description": offer.description,
    "url": offerUrl,
    "image": imageUrl,
    "applicationCategory": offer.category,
    "operatingSystem": "Windows, macOS, Linux, Android, iOS",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": offer.rating.toString(),
      "ratingCount": Math.max(offer.views, 10).toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": offer.views.toString()
      },
      {
        "@type": "InteractionCounter", 
        "interactionType": "https://schema.org/DownloadAction",
        "userInteractionCount": offer.unlocks.toString()
      }
    ],
    "datePublished": offer.addedAt,
    "dateModified": offer.addedAt,
    "publisher": {
      "@type": "Organization",
      "name": "UnlockVault",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.svg`
      }
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": offerUrl,
      "category": offer.category
    }
  };
};

// Generate JSON-LD for ItemList (Search Results, Categories)
export const generateItemListSchema = (
  items: OfferStructuredData[], 
  baseUrl: string, 
  listName: string,
  description?: string
): any => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": listName,
  "description": description || `Collection of premium ${listName.toLowerCase()}`,
  "numberOfItems": items.length,
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": item.type === 'game' ? 'VideoGame' : 'SoftwareApplication',
      "@id": `${baseUrl}/offers/${item.slug}`,
      "name": item.title,
      "image": item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": item.rating.toString(),
        "ratingCount": Math.max(item.views, 10).toString()
      }
    }
  }))
});

// Generate JSON-LD for FAQ
export const generateFAQSchema = (): any => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is UnlockVault safe to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, UnlockVault is completely safe. All tools and apps are thoroughly tested for malware and viruses before being made available."
      }
    },
    {
      "@type": "Question",
      "name": "How do I unlock premium tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simply browse our collection, select the tool you want, and follow the unlock process. Most unlocks are instant and require no payment."
      }
    },
    {
      "@type": "Question",
      "name": "Are the cracked apps legal?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We provide educational content and trial versions. Users are responsible for complying with local laws and purchasing legitimate licenses for commercial use."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to create an account?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No account registration is required. You can access and unlock tools immediately without any sign-up process."
      }
    }
  ]
});

// Generate Breadcrumb Schema
export const generateBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>, baseUrl: string): any => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
  }))
});

// Generate Review Schema for Testimonials
export const generateReviewSchema = (testimonials: any[], baseUrl: string): any => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "UnlockVault Premium Tools Platform",
  "description": "Platform for accessing premium tools, apps, and games",
  "image": `${baseUrl}/logo.svg`,
  "brand": {
    "@type": "Brand",
    "name": "UnlockVault"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": testimonials.length.toString(),
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": testimonials.map(testimonial => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": testimonial.name
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": testimonial.rating.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": testimonial.text,
    "datePublished": testimonial.createdAt
  }))
});

// Helper function to inject structured data into HTML head
export const injectStructuredData = (data: any): string => {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
}; 