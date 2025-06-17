import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
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

    // Get testimonials stats
    const testimonialsCollection = db.collection('testimonials')
    const totalTestimonials = await testimonialsCollection.countDocuments({ status: 'active' })

    const stats = {
      totalOffers,
      totalViews: totalViews[0]?.total || 0,
      totalUnlocks: totalUnlocks[0]?.total || 0,
      totalVisits,
      todayVisits,
      totalTestimonials
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error('Stats API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}