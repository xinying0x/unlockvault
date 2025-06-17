import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'
import geoip from 'geoip-lite'
import UAParser from 'ua-parser-js'

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

  const { adBlock, offerId } = req.body || {}
  // Get client IP, support x-forwarded-for
  const forwarded = req.headers['x-forwarded-for']
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded || req.socket.remoteAddress || ''
  const cleanIp = ip.split(',')[0].trim()

  // Check if this is a local/development IP
  const isLocalIP = cleanIp === '::1' || cleanIp === '127.0.0.1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.') || cleanIp.startsWith('172.') || cleanIp.startsWith('::ffff:');

  // Bot detection via User-Agent
  const ua = req.headers['user-agent'] || ''
  const bot = /bot|crawl|spider|slurp|fetch|monitor|scan|ping|libwww|curl|wget|python-requests/i.test(ua)

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
    // For real IPs, use actual geolocation
    const geo = geoip.lookup(cleanIp)
    country = geo?.country || 'Unknown'
    finalIp = cleanIp;

    // VPN detection via IPWHOIS.IO security.vpn field
    try {
      const resp = await fetch(`https://ipwho.is/${cleanIp}?fields=security`)
      const json = await resp.json()
      vpn = !!json.security?.vpn
    } catch (_) {
      vpn = false
    }
  }

  const now = new Date()
  const timestamp = now.toISOString()
  const date = timestamp.slice(0, 10)

  const dataDir = path.join(process.cwd(), 'data')
  const filePath = path.join(dataDir, 'visits.json')
  await fs.mkdir(dataDir, { recursive: true })

  let visits: any[] = []
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    visits = JSON.parse(content)
  } catch (_) {
    visits = []
  }

  // Generate unique ID for each visit
  const visitId = `${finalIp}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`

  // Add new visit (no city field)
  visits.push({ 
    id: visitId,
    ip: finalIp, 
    country, 
    bot, 
    adBlock: !!adBlock, 
    vpn, 
    timestamp, 
    date, 
    browser, 
    os, 
    deviceType, 
    trafficSource,
    offerId: offerId || null
  })

  // Keep last 2000 records
  if (visits.length > 2000) {
    visits = visits.slice(-2000)
  }

  await fs.writeFile(filePath, JSON.stringify(visits, null, 2), 'utf-8')
  return res.status(200).json({ ok: true })
} 