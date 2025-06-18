import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import { cache } from '../../lib/cache'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Check cache first (cache for 2 minutes)
    const cacheKey = 'stats-general';
    const cachedStats = cache.get(cacheKey);
    
    if (cachedStats) {
      return res.status(200).json(cachedStats);
    }

    const client = await clientPromise
    const db = client.db('unlockvault')

    // Get offers stats
    const offersCollection = db.collection('offers')
    const totalOffers = await offersCollection.countDocuments({ status: 'active' })
    const totalViews = await offersCollection.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]).toArray()
    const totalUnlocks = await offersCollection.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$unlocks' } } }
    ]).toArray()

    // Get visits stats
    const visitsCollection = db.collection('visits')
    const totalVisits = await visitsCollection.countDocuments()
    const todayVisits = await visitsCollection.countDocuments({
      date: new Date().toISOString().slice(0, 10)
    })
    const uniqueIPs = await visitsCollection.distinct('ip')

    // Get testimonials stats
    const testimonialsCollection = db.collection('testimonials')
    const totalTestimonials = await testimonialsCollection.countDocuments({ status: 'active' })

    const stats = {
      totalOffers,
      totalViews: totalViews[0]?.total || 0,
      totalUnlocks: totalUnlocks[0]?.total || 0,
      totalVisits,
      todayVisits,
      totalTestimonials,
      uniqueVisitors: uniqueIPs.length
    }

    // Cache the results for 2 minutes
    cache.set(cacheKey, stats, 2);

    res.status(200).json(stats)
  } catch (error) {
    console.error('Stats API error:', error)
    
    // Fallback to dummy stats when MongoDB is not available
    const dummyStats = {
      totalOffers: 2,
      totalUsers: 125000,
      totalViews: 331,
      totalUnlocks: 54,
      totalVisits: 1250000,
      todayVisits: 2450,
      totalTestimonials: 48,
      uniqueVisitors: 87500
    };

    res.status(200).json(dummyStats)
  }
}