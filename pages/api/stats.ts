import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'

const VISITS_FILE = path.resolve(process.cwd(), 'data', 'visits.json')
const OFFERS_FILE = path.resolve(process.cwd(), 'data', 'offers.json')

interface Visit {
  ip: string
  country: string
  bot: boolean
  adBlock: boolean
  vpn: boolean
  timestamp: string
  date: string
  browser?: string
  os?: string
  deviceType?: string
  trafficSource?: string
}

interface Offer {
  id: string
  slug: string
  title: string
  description: string
  image: string
  category: string
  type: 'tool' | 'app' | 'game'
  lockerLinks: { [key: string]: string }
  views: number
  unlocks: number
  keywords: string[]
  addedAt: string
  featured?: boolean
  status: 'active' | 'draft' | 'archived'
  lastModified: string
}

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    console.error(`Error reading ${filePath}:`, error)
    throw error
  }
}

function filterVisitsByRange(visits: Visit[], range: string): Visit[] {
  const now = new Date()
  let startDate = new Date(now)

  switch (range) {
    case '24h':
      startDate.setHours(now.getHours() - 24)
      break
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    default:
      // For 'all' or invalid range, consider all visits
      return visits
  }

  return visits.filter(visit => new Date(visit.timestamp) >= startDate)
}

async function calculateDashboardMetrics(filteredVisits: Visit[], offers: Offer[], totalOffersCount: number) {
  const totalViews = filteredVisits.length
  const uniqueVisitors = new Set(filteredVisits.map(v => v.ip)).size

  const totalUnlocks = offers.reduce((sum, offer) => sum + offer.unlocks, 0)

  const vpnUsers = filteredVisits.filter(visit => visit.vpn).length

  const conversionRate = totalViews > 0 ? parseFloat(((totalUnlocks / totalViews) * 100).toFixed(2)) : 0
  
  const revenue = parseFloat((totalUnlocks * 0.5).toFixed(2))

  const dailyStatsMap = new Map<string, number>()
  filteredVisits.forEach(visit => {
    const date = visit.date
    dailyStatsMap.set(date, (dailyStatsMap.get(date) || 0) + 1)
  })

  const dailyStats = Array.from(dailyStatsMap.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()).map(([timestamp, count]) => ({
    timestamp: `${timestamp}T00:00:00Z`,
    _count: { id: count }
  }))

  const recentTools = offers.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 5)

  const viewsByCountryMap = new Map<string, number>()
  filteredVisits.forEach(visit => {
    viewsByCountryMap.set(visit.country, (viewsByCountryMap.get(visit.country) || 0) + 1)
  })
  const viewsByCountry = Array.from(viewsByCountryMap.entries()).map(([country, views]) => ({
    country,
    views,
    percentage: totalViews > 0 ? parseFloat(((views / totalViews) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.views - a.views)

  // Device Data (now uses real data)
  const viewsByDeviceMap = new Map<string, number>()
  filteredVisits.forEach(visit => {
    const device = visit.deviceType || 'Unknown'
    viewsByDeviceMap.set(device, (viewsByDeviceMap.get(device) || 0) + 1)
  })
  const viewsByDevice = Array.from(viewsByDeviceMap.entries()).map(([device, views]) => ({
    device,
    users: views,
    percentage: totalViews > 0 ? parseFloat(((views / totalViews) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.users - a.users)

  // Traffic Sources (now uses real data)
  const trafficSourcesMap = new Map<string, number>()
  filteredVisits.forEach(visit => {
    const source = visit.trafficSource || 'Unknown'
    trafficSourcesMap.set(source, (trafficSourcesMap.get(source) || 0) + 1)
  })
  const trafficSources = Array.from(trafficSourcesMap.entries()).map(([source, users]) => ({
    source,
    users,
    percentage: totalViews > 0 ? parseFloat(((users / totalViews) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.users - a.users)

  // Browser Data (now uses real data)
  const viewsByBrowserMap = new Map<string, number>()
  filteredVisits.forEach(visit => {
    const browser = visit.browser || 'Unknown'
    viewsByBrowserMap.set(browser, (viewsByBrowserMap.get(browser) || 0) + 1)
  })
  const viewsByBrowser = Array.from(viewsByBrowserMap.entries()).map(([browser, views]) => ({
    browser,
    users: views,
    percentage: totalViews > 0 ? parseFloat(((views / totalViews) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.users - a.users)

  // OS Data (now uses real data)
  const viewsByOSMap = new Map<string, number>()
  filteredVisits.forEach(visit => {
    const os = visit.os || 'Unknown'
    viewsByOSMap.set(os, (viewsByOSMap.get(os) || 0) + 1)
  })
  const viewsByOS = Array.from(viewsByOSMap.entries()).map(([os, users]) => ({
    os,
    users,
    percentage: totalViews > 0 ? parseFloat(((users / totalViews) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.users - a.users)

  const today = new Date().toISOString().slice(0, 10)
  const todayVisits = filteredVisits.filter(visit => visit.date === today)
  const todayViews = todayVisits.length

  // todayUnlocks and recentActivity cannot be accurately calculated with current data structure
  // without explicit unlock events being logged with timestamps and offer IDs
  const todayUnlocks = 0 // Remains 0 due to lack of specific unlock event data
  const recentActivity: any[] = [] // Remains empty as there's no generic activity log

  return {
    totalOffers: totalOffersCount,
    totalViews,
    totalUnlocks,
    totalUsers: uniqueVisitors,
    todayViews,
    todayUnlocks,
    conversionRate,
    revenue,
    recentActivity,
    dailyStats,
    recentTools,
    topOffers: recentTools.map(offer => ({
      id: offer.id,
      title: offer.title,
      views: offer.views,
      unlocks: offer.unlocks,
      conversionRate: offer.views > 0 ? parseFloat(((offer.unlocks / offer.views) * 100).toFixed(2)) : 0
    })).sort((a,b) => b.conversionRate - a.conversionRate).slice(0, 5),
    geographicData: viewsByCountry,
    deviceData: viewsByDevice,
    trafficSources,
    viewsByBrowser,
    viewsByOS,
    viewsByCountry,
    viewsByDevice
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const range = req.query.range as string || '7d'

  try {
    const allVisits = await readJsonFile<Visit>(VISITS_FILE)
    const allOffers = await readJsonFile<Offer>(OFFERS_FILE)

    const filteredVisits = filterVisitsByRange(allVisits, range)
    const dashboardMetrics = await calculateDashboardMetrics(filteredVisits, allOffers, allOffers.length)

    return res.status(200).json(dashboardMetrics)
  } catch (error) {
    console.error('Error in stats API:', error)
    return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: (error as Error).message })
  }
}