// Bot Protection and Anti-Fraud System

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  touchSupport: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
}

export interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
  fingerprint: DeviceFingerprint;
}

// Generate device fingerprint
export const generateFingerprint = (): DeviceFingerprint => {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      screenResolution: '',
      timezone: '',
      language: '',
      platform: '',
      cookieEnabled: false,
      doNotTrack: null,
      touchSupport: false,
      hardwareConcurrency: 0
    };
  }

  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    touchSupport: 'ontouchstart' in window,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory
  };
};

// Bot detection algorithm
export const detectBot = (): BotDetectionResult => {
  const fingerprint = generateFingerprint();
  let botScore = 0;
  const reasons: string[] = [];

  if (typeof window === 'undefined') {
    return { isBot: false, confidence: 0, reasons: [], fingerprint };
  }

  // Check User Agent
  const botUserAgents = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'phantom',
    'headless', 'selenium', 'automation', 'test', 'robot'
  ];
  
  const userAgentLower = fingerprint.userAgent.toLowerCase();
  if (botUserAgents.some(bot => userAgentLower.includes(bot))) {
    botScore += 50;
    reasons.push('Suspicious user agent');
  }

  // Check for missing browser features
  if (!fingerprint.cookieEnabled) {
    botScore += 20;
    reasons.push('Cookies disabled');
  }

  // Check screen resolution
  if (fingerprint.screenResolution === '0x0' || fingerprint.screenResolution === '') {
    botScore += 30;
    reasons.push('Invalid screen resolution');
  }

  // Check for webdriver
  if ((window as any).webdriver || (navigator as any).webdriver) {
    botScore += 60;
    reasons.push('WebDriver detected');
  }

  // Check for automation tools
  if ((window as any).phantom || (window as any).callPhantom || (window as any)._phantom) {
    botScore += 60;
    reasons.push('PhantomJS detected');
  }

  // Check plugins (real browsers usually have some plugins)
  if (navigator.plugins.length === 0 && !fingerprint.touchSupport) {
    botScore += 15;
    reasons.push('No browser plugins');
  }

  // Check for rapid requests (localStorage based)
  const now = Date.now();
  const lastRequest = localStorage.getItem('lastBotCheck');
  if (lastRequest && now - parseInt(lastRequest) < 1000) {
    botScore += 25;
    reasons.push('Rapid requests detected');
  }
  localStorage.setItem('lastBotCheck', now.toString());

  // Check for missing mouse movement
  if (!sessionStorage.getItem('mouseActivity')) {
    setTimeout(() => {
      const handleMouseMove = () => {
        sessionStorage.setItem('mouseActivity', 'true');
        document.removeEventListener('mousemove', handleMouseMove);
      };
      document.addEventListener('mousemove', handleMouseMove);
    }, 100);
  }

  return {
    isBot: botScore >= 40,
    confidence: Math.min(botScore, 100),
    reasons,
    fingerprint
  };
};

// Rate limiting
const requestCounts = new Map<string, { count: number; lastReset: number }>();

export const checkRateLimit = (fingerprint: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const current = requestCounts.get(fingerprint) || { count: 0, lastReset: now };

  // Reset counter if window has passed
  if (now - current.lastReset > windowMs) {
    current.count = 0;
    current.lastReset = now;
  }

  current.count++;
  requestCounts.set(fingerprint, current);

  return current.count <= maxRequests;
};

// Advanced bot detection with behavioral analysis
export const advancedBotDetection = (): Promise<BotDetectionResult> => {
  return new Promise((resolve) => {
    const result = detectBot();
    let additionalScore = 0;
    const additionalReasons: string[] = [];

    // Test for automated behavior patterns
    const startTime = Date.now();
    
    // Check if JavaScript execution is too fast
    setTimeout(() => {
      const executionTime = Date.now() - startTime;
      if (executionTime < 10) {
        additionalScore += 20;
        additionalReasons.push('Suspiciously fast execution');
      }

      // Check for missing human-like delays
      if (!sessionStorage.getItem('humanActivity')) {
        additionalScore += 15;
        additionalReasons.push('No human activity detected');
      }

      resolve({
        isBot: result.isBot || additionalScore >= 20,
        confidence: Math.min(result.confidence + additionalScore, 100),
        reasons: [...result.reasons, ...additionalReasons],
        fingerprint: result.fingerprint
      });
    }, 50);
  });
};

// Track human activity
export const trackHumanActivity = () => {
  if (typeof window === 'undefined') return;

  const activities = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'];
  
  const markHumanActivity = () => {
    sessionStorage.setItem('humanActivity', 'true');
    activities.forEach(activity => {
      document.removeEventListener(activity, markHumanActivity);
    });
  };

  activities.forEach(activity => {
    document.addEventListener(activity, markHumanActivity, { once: true });
  });
}; 