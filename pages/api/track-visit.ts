import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import UAParser from 'ua-parser-js'

// Global rate limit store type
declare global {
  var rateLimitStore: Map<string, { count: number; resetTime: number }> | undefined;
}

// Sample countries with realistic IP ranges
const sampleData = [
  { country: 'Saudi Arabia', ipPrefix: '188.245' },
  { country: 'United States', ipPrefix: '74.125' },
  { country: 'United Kingdom', ipPrefix: '81.2' },
  { country: 'Germany', ipPrefix: '85.214' },
  { country: 'France', ipPrefix: '90.84' },
  { country: 'Egypt', ipPrefix: '156.202' },
  { country: 'UAE', ipPrefix: '5.62' },
  { country: 'Canada', ipPrefix: '142.103' },
  { country: 'Australia', ipPrefix: '101.164' },
  { country: 'Japan', ipPrefix: '133.242' },
  { country: 'India', ipPrefix: '117.239' },
  { country: 'Brazil', ipPrefix: '177.43' },
  { country: 'Turkey', ipPrefix: '78.188' },
  { country: 'Morocco', ipPrefix: '41.250' },
  { country: 'Algeria', ipPrefix: '41.111' },
  { country: 'Tunisia', ipPrefix: '197.14' },
  { country: 'Jordan', ipPrefix: '176.241' },
  { country: 'Lebanon', ipPrefix: '178.135' },
  { country: 'Iraq', ipPrefix: '37.236' },
  { country: 'Kuwait', ipPrefix: '37.36' },
  { country: 'Qatar', ipPrefix: '37.210' },
  { country: 'Oman', ipPrefix: '5.36' },
  { country: 'Bahrain', ipPrefix: '37.131' }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { adBlock, offerId, botDetected, fingerprint } = req.body || {}
    // Get client IP, support x-forwarded-for
    const forwarded = req.headers['x-forwarded-for']
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded || req.socket.remoteAddress || ''
    const cleanIp = ip.split(',')[0].trim()

    // Rate limiting check - simple implementation
    const rateLimitKey = `rate_limit_${cleanIp}`;
    const currentTime = Date.now();
    const timeWindow = 60000; // 1 minute
    const maxRequests = 30;
    
    // Get existing rate limit data from memory (in production, use Redis)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const existing = global.rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: currentTime + timeWindow };
    
    if (currentTime > existing.resetTime) {
      // Reset the counter
      existing.count = 1;
      existing.resetTime = currentTime + timeWindow;
    } else {
      existing.count++;
    }
    
    global.rateLimitStore.set(rateLimitKey, existing);
    
    if (existing.count > maxRequests) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Check if this is a local/development IP
    const isLocalIP = cleanIp === '::1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.') || cleanIp.startsWith('172.') || cleanIp.startsWith('::ffff:');

    // Enhanced bot detection via User-Agent
    const ua = req.headers['user-agent'] || ''
    const suspiciousPatterns = [
      /bot|crawl|spider|slurp|fetch|monitor|scan|ping|libwww|curl|wget|python-requests/i,
      /headless|phantom|selenium|automation|chrome-lighthouse/i,
      /scrapy|beautifulsoup|mechanize|scraperapi/i
    ];
    
    const bot = suspiciousPatterns.some(pattern => pattern.test(ua)) || botDetected || false;
    
    // Additional bot checks
    const hasCommonHeaders = req.headers['accept'] && req.headers['accept-language'];
    const hasValidReferer = req.headers['referer'] || req.headers['x-referer'];
    const suspiciousScore = (!hasCommonHeaders ? 1 : 0) + (!hasValidReferer ? 0.5 : 0);
    
    const enhancedBotDetection = bot || suspiciousScore >= 1.5;

    // Parse User-Agent for browser, OS, and device
    const parser = new UAParser(ua);
    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';
    const deviceType = parser.getDevice().type || 'desktop'; // 'desktop', 'mobile', 'tablet'

    // Get referrer
    const referrer = req.headers['referer'] || req.headers['x-referer'] || 'Direct';
    const referrerString = Array.isArray(referrer) ? referrer[0] : referrer;
    let trafficSource = 'Direct';
    if (referrerString !== 'Direct') {
      try {
        const url = new URL(referrerString);
        if (url.hostname.includes('google.') || url.hostname.includes('bing.') || url.hostname.includes('yahoo.')) {
          trafficSource = 'Search Engine';
        } else if (url.hostname.includes('facebook.') || url.hostname.includes('twitter.') || url.hostname.includes('linkedin.') || url.hostname.includes('instagram.')) {
          trafficSource = 'Social Media';
        } else if (url.hostname === req.headers.host) { // Internal referrer
          trafficSource = 'Internal';
        } else {
          trafficSource = 'Referral';
        }
      } catch (e) {
        trafficSource = 'Referral'; // Fallback for malformed URLs
      }
    }

    let country, finalIp, vpn = false;

    if (isLocalIP) {
      // For local/development IPs, use sample data
      const randomData = sampleData[Math.floor(Math.random() * sampleData.length)];
      country = randomData.country;
      
      // Generate a realistic-looking IP based on country prefix
      const suffix1 = Math.floor(Math.random() * 255);
      const suffix2 = Math.floor(Math.random() * 255);
      finalIp = `${randomData.ipPrefix}.${suffix1}.${suffix2}`;
      
      // Random chance for VPN (15% chance)
      vpn = Math.random() < 0.15;
    } else {
      // For real IPs, use actual geolocation via ipwho.is API
      finalIp = cleanIp;
      
      try {
        const resp = await fetch(`https://ipwho.is/${cleanIp}`)
        const json = await resp.json()
        
        if (json.success) {
          country = json.country || 'Unknown'
          vpn = !!json.security?.vpn
        } else {
          country = 'Unknown'
          vpn = false
        }
      } catch (_) {
        country = 'Unknown'
        vpn = false
      }
    }

    const now = new Date()
    const timestamp = now.toISOString()
    const date = timestamp.slice(0, 10)

    // Generate unique ID for each visit
    const visitId = `${finalIp}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('unlockvault');
    const collection = db.collection('visits');

    // Add new visit
    const visitData = { 
      id: visitId,
      ip: finalIp, 
      country, 
      bot: enhancedBotDetection, 
      adBlock: !!adBlock, 
      vpn, 
      timestamp, 
      date, 
      browser, 
      os, 
      deviceType, 
      trafficSource,
      offerId: offerId || null,
      fingerprint: fingerprint || null,
      userAgent: ua,
      suspiciousScore,
      headers: {
        accept: req.headers['accept'] || null,
        acceptLanguage: req.headers['accept-language'] || null,
        acceptEncoding: req.headers['accept-encoding'] || null,
        dnt: req.headers['dnt'] || null
      }
    };

    await collection.insertOne(visitData);

    // Keep only last 2000 records (optional cleanup)
    const totalCount = await collection.countDocuments();
    if (totalCount > 2000) {
      const oldestVisits = await collection
        .find({})
        .sort({ timestamp: 1 })
        .limit(totalCount - 2000)
        .toArray();
      
      const idsToDelete = oldestVisits.map(visit => visit._id);
      await collection.deleteMany({ _id: { $in: idsToDelete } });
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Error tracking visit:', error);
    return res.status(500).json({ error: 'Failed to track visit' });
  }
} 