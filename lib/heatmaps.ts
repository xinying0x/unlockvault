// Heat Maps and User Behavior Analytics
declare global {
  interface Window {
    hj: (...args: any[]) => void;
    _hjSettings: {
      hjid: number;
      hjsv: number;
    };
    clarity: (...args: any[]) => void;
  }
}

const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID || '6438859';
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || 's1facumamm';

// Initialize Hotjar (already loaded via script tag in _document.tsx)
export const initHotjar = () => {
  // Hotjar is already initialized via script tag in _document.tsx
  // This function is kept for compatibility but doesn't need to do anything
  return true;
};

// Initialize Microsoft Clarity (already loaded via script tag in _document.tsx)
export const initClarity = () => {
  // Clarity is already initialized via script tag in _document.tsx
  // This function is kept for compatibility but doesn't need to do anything
  return true;
};

// Track scroll depth
export const trackScrollDepth = () => {
  if (typeof window === 'undefined') return;
  
  let maxScroll = 0;
  const trackingPoints = [25, 50, 75, 90, 100];
  const tracked = new Set();

  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;
      
      trackingPoints.forEach(point => {
        if (scrollPercent >= point && !tracked.has(point)) {
          tracked.add(point);
          
          // Send to Hotjar
          if (window.hj) {
            window.hj('event', 'scroll_depth', { depth: point });
          }
          
          // Send to Google Analytics
          if (window.gtag) {
            window.gtag('event', 'scroll', {
              event_category: 'engagement',
              event_label: `${point}%`,
              value: point
            });
          }
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
};

// Track time on page
export const trackTimeOnPage = () => {
  if (typeof window === 'undefined') return;
  
  const startTime = Date.now();
  const intervals = [30, 60, 120, 300]; // seconds
  const tracked = new Set();

  const trackTime = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    intervals.forEach(interval => {
      if (timeSpent >= interval && !tracked.has(interval)) {
        tracked.add(interval);
        
        // Send to Hotjar
        if (window.hj) {
          window.hj('event', 'time_on_page', { seconds: interval });
        }
        
        // Send to Google Analytics
        if (window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: 'time_on_page',
            value: interval * 1000,
            event_category: 'engagement'
          });
        }
      }
    });
  };

  const timer = setInterval(trackTime, 5000);
  return () => clearInterval(timer);
};

// Track CPA interactions
export const trackCPAInteraction = (action: string, offerId: string, position?: { x: number, y: number }) => {
  if (typeof window === 'undefined') return;
  
  // Send to Hotjar
  if (window.hj) {
    window.hj('event', 'cpa_interaction', {
      action,
      offer_id: offerId,
      position: position ? `${position.x},${position.y}` : null,
      timestamp: Date.now()
    });
  }
  
  // Send to Microsoft Clarity
  if (window.clarity) {
    window.clarity('set', 'cpa_interaction', {
      action,
      offer_id: offerId,
      position: position ? `${position.x},${position.y}` : 'unknown'
    });
  }
  
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', 'cpa_interaction', {
      event_category: 'CPA',
      event_label: action,
      custom_parameter_1: offerId,
      custom_parameter_2: position ? `${position.x},${position.y}` : 'unknown'
    });
  }
};

// Track form interactions
export const trackFormInteraction = (formName: string, fieldName: string, action: 'focus' | 'blur' | 'change') => {
  if (typeof window === 'undefined') return;
  
  // Send to Hotjar
  if (window.hj) {
    window.hj('event', 'form_interaction', {
      form: formName,
      field: fieldName,
      action: action
    });
  }
};

// Initialize all heat map tracking
export const initHeatMapTracking = () => {
  if (typeof window === 'undefined') return () => {};
  
  // Initialize tracking services (already loaded in _document.tsx)
  // initHotjar(); // Already loaded via script tag
  // initClarity(); // Optional
  
  // Start tracking user behavior
  const cleanupScroll = trackScrollDepth();
  const cleanupTime = trackTimeOnPage();
  
  // Track page load
  if (window.hj) {
    window.hj('event', 'page_load', {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now()
    });
  }
  
  // Return cleanup function
  return () => {
    if (cleanupScroll) cleanupScroll();
    if (cleanupTime) cleanupTime();
  };
}; 