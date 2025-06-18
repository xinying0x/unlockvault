// Google Analytics 4 with Enhanced E-commerce
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-DQE75NNT98';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title || document.title,
      page_location: url,
    });
  }
};

// Track CPA link clicks
export const trackCPAClick = (offerId: string, offerTitle: string, cpaProvider: string, userCountry?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Enhanced E-commerce event
    window.gtag('event', 'cpa_click', {
      event_category: 'CPA',
      event_label: offerTitle,
      offer_id: offerId,
      cpa_provider: cpaProvider,
      user_country: userCountry || 'unknown',
      value: 1,
      currency: 'USD'
    });

    // Purchase event for conversion tracking
    window.gtag('event', 'purchase', {
      transaction_id: `${offerId}_${Date.now()}`,
      value: 1,
      currency: 'USD',
      items: [{
        item_id: offerId,
        item_name: offerTitle,
        item_category: 'CPA_Offer',
        item_variant: cpaProvider,
        quantity: 1,
        price: 1
      }]
    });
  }
};

// Track offer views
export const trackOfferView = (offerId: string, offerTitle: string, category: string, type: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      event_category: 'Offer',
      event_label: offerTitle,
      item_id: offerId,
      item_name: offerTitle,
      item_category: category,
      item_variant: type,
      value: 1,
      currency: 'USD'
    });
  }
};

// Track search events
export const trackSearch = (searchTerm: string, resultsCount: number, filters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount,
      filters: JSON.stringify(filters || {})
    });
  }
};

// Track user engagement
export const trackEngagement = (action: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'Engagement',
      event_label: label,
      value: value || 1
    });
  }
};

// Track traffic sources
export const trackTrafficSource = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    const referrer = document.referrer;
    let source = 'direct';
    
    if (referrer) {
      if (referrer.includes('google')) source = 'google';
      else if (referrer.includes('facebook')) source = 'facebook';
      else if (referrer.includes('twitter')) source = 'twitter';
      else if (referrer.includes('instagram')) source = 'instagram';
      else if (referrer.includes('tiktok')) source = 'tiktok';
      else if (referrer.includes('youtube')) source = 'youtube';
      else source = 'referral';
    }

    window.gtag('event', 'traffic_source', {
      event_category: 'Traffic',
      source: source,
      referrer: referrer || 'none'
    });
  }
};

// Track errors
export const trackError = (error: string, page: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error,
      fatal: false,
      page: page
    });
  }
};

// Track human activity patterns
export const trackHumanActivity = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    let mouseMovements = 0;
    let keyPresses = 0;
    let scrolls = 0;
    let clicks = 0;
    let startTime = Date.now();

    // Track mouse movements
    const handleMouseMove = () => {
      mouseMovements++;
    };

    // Track key presses
    const handleKeyPress = () => {
      keyPresses++;
    };

    // Track scrolling
    const handleScroll = () => {
      scrolls++;
    };

    // Track clicks
    const handleClick = () => {
      clicks++;
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('keydown', handleKeyPress, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });

    // Send activity data after 30 seconds
    setTimeout(() => {
      const timeSpent = Date.now() - startTime;
      const activityScore = mouseMovements + keyPresses + scrolls + clicks;
      
      window.gtag('event', 'human_activity', {
        event_category: 'Engagement',
        mouse_movements: mouseMovements,
        key_presses: keyPresses,
        scrolls: scrolls,
        clicks: clicks,
        time_spent: timeSpent,
        activity_score: activityScore
      });

      // Clean up event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    }, 30000);
  }
}; 