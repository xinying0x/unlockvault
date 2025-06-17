import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'
import geoip from 'geoip-lite'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const filePath = path.join(process.cwd(), 'data', 'visits.json')
  let visits: any[] = []
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    visits = JSON.parse(content)
  } catch (_) {
    visits = []
  }

  const today = new Date().toISOString().slice(0, 10)
  const todaysVisits = visits.filter(v => v.date === today)

  const uniqueVisitors = new Set(todaysVisits.map(v => v.ip)).size
  const bots = todaysVisits.filter(v => v.bot).length
  const adBlockUsers = todaysVisits.filter(v => v.adBlock).length
  const vpnUsers = todaysVisits.filter(v => v.vpn).length

  const byCountry = todaysVisits.reduce((acc, v) => {
    acc[v.country] = (acc[v.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalVisitsToday = todaysVisits.length
  const vpnPercentage = totalVisitsToday > 0 ? parseFloat(((vpnUsers / totalVisitsToday) * 100).toFixed(2)) : 0

  return res.status(200).json({
    uniqueVisitorsToday: uniqueVisitors,
    botsToday: bots,
    adBlockUsersToday: adBlockUsers,
    vpnUsersToday: vpnUsers,
    vpnPercentageToday: vpnPercentage,
    visitsByCountryToday: byCountry
  })
} 