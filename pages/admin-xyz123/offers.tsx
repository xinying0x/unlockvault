import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'

interface Offer {
  id: string
  title: string
  description: string
  type: string
  status: 'active' | 'inactive'
  views: number
  clicks: number
  createdAt: string
  updatedAt: string
}

const OffersPage: React.FC = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof Offer>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin-xyz123/login')
    } else if (user) {
      fetchOffers()
    }
  }, [user, loading, router])

  const fetchOffers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/admin/offers')
      if (!response.ok) {
        throw new Error('Failed to fetch offers')
      }
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error('Error fetching offers:', error)
      setError('Failed to load offers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof Offer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedOffers = offers
    .filter(offer => 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const direction = sortDirection === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction * aValue.localeCompare(bValue)
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction * (aValue - bValue)
      }
      return 0
    })

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete offer');
      }
      // If deletion is successful, re-fetch offers to update the list
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      // setError('Failed to delete offer'); // Re-add error handling as needed
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading offers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchOffers}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout title="Offers Management">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Manage Offers</h1>
          <button
            onClick={() => router.push('/admin-xyz123/new')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-400 hover:to-indigo-500 transition-all duration-300"
          >
            Add New Offer
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Offers Table */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="bg-purple-800/50 border-b border-purple-700">
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-purple-300"
                    onClick={() => handleSort('title')}
                  >
                    Title
                    {sortField === 'title' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-purple-300"
                    onClick={() => handleSort('type')}
                  >
                    Type
                    {sortField === 'type' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-purple-300"
                    onClick={() => handleSort('views')}
                  >
                    Views
                    {sortField === 'views' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-purple-300"
                    onClick={() => handleSort('clicks')}
                  >
                    Clicks
                    {sortField === 'clicks' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-purple-300"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-purple-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-700">
                {filteredAndSortedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-purple-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{offer.title}</div>
                      <div className="text-sm text-gray-400">{offer.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{offer.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-300">{offer.views.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-300">{offer.clicks.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        offer.status === 'active' ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 'bg-red-600/20 text-red-300 border border-red-500/30'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin-xyz123/edit/${offer.id}`)}
                        className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this offer?')) {
                            handleDeleteOffer(offer.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OffersPage; 