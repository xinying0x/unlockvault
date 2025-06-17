import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';

interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  lockerLinks: { [key: string]: string };
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  lastModified: string;
}

const ManagePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('addedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  const itemsPerPage = 20;

  const categories = [
    'Design & Graphics',
    'Video & Audio',
    'Productivity',
    'Development',
    'Gaming',
    'Business',
    'AI & Machine Learning',
    'Security'
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin-xyz123/login');
    } else if (user) {
      fetchOffers();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    filterAndSortOffers();
  }, [offers, searchTerm, filterType, filterCategory, filterStatus, sortBy]);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers');
      const data = await response.json();
      
      // Add additional properties for management
      const enhancedData = data.map((offer: any) => ({
        ...offer,
        status: offer.status || 'active',
        lastModified: offer.lastModified || offer.addedAt
      }));
      
      setOffers(enhancedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      setIsLoading(false);
    }
  };

  const filterAndSortOffers = () => {
    let filtered = offers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(offer => offer.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(offer => offer.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(offer => offer.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'addedAt':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'lastModified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.views - a.views;
        case 'unlocks':
          return b.unlocks - a.unlocks;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredOffers(filtered);
    setCurrentPage(1);
  };

  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

  const handleBulkAction = async (action: string) => {
    try {
      const updatedOffersPromises = selectedOffers.map(async (offerId) => {
        const offerToUpdate = offers.find(o => o.id === offerId);
        if (!offerToUpdate) return null;

        let updatedData = {};
        if (action === 'feature') updatedData = { featured: true };
        else if (action === 'unfeature') updatedData = { featured: false };
        else if (action === 'archive') updatedData = { status: 'archived' };
        else if (action === 'activate') updatedData = { status: 'active' };
        
      if (action === 'delete') {
          await fetch(`/api/offers/${offerId}`, {
            method: 'DELETE',
          });
          return { id: offerId, deleted: true };
        } else {
          const response = await fetch(`/api/offers/${offerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
          });
          if (!response.ok) throw new Error(`Failed to update offer ${offerId}`);
          return { ...offerToUpdate, ...updatedData };
        }
      });

      const results = await Promise.all(updatedOffersPromises);
      const newOffersList = offers.filter(offer => !results.some(res => res?.deleted && res.id === offer.id));
      
      setOffers(newOffersList.map(offer => {
        const updated = results.find(res => res && res.id === offer.id && !res.deleted);
        return updated ? updated as Offer : offer;
      }));

      setSelectedOffers([]);
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete offer');
      }
      setOffers(offers.filter(offer => offer.id !== offerId));
      setShowDeleteModal(false);
      setOfferToDelete(null);
    } catch (error) {
      console.error('Failed to delete offer:', error);
    }
  };

  const toggleFeature = async (offerId: string) => {
    try {
      const offerToUpdate = offers.find(offer => offer.id === offerId);
      if (!offerToUpdate) return;
      
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !offerToUpdate.featured }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle feature');
      }
      // Update state if API call is successful
      setOffers(offers.map(offer => 
        offer.id === offerId 
          ? { ...offer, featured: !offer.featured }
          : offer
      ));
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'draft': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
      case 'archived': return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tool': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'app': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'game': return 'bg-red-600/20 text-red-300 border-red-300/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Manage Offers">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-[#2D1B5A]/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-center border border-purple-900/30">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Total Offers</h3>
            <p className="text-2xl sm:text-4xl font-bold text-white">{offers.length}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-center border border-purple-900/30">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Active Offers</h3>
            <p className="text-2xl sm:text-4xl font-bold text-green-400">{offers.filter(o => o.status === 'active').length}</p>
          </div>
          <div className="bg-[#2D1B5A]/50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-center border border-purple-900/30">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Drafts</h3>
            <p className="text-2xl sm:text-4xl font-bold text-blue-400">{offers.filter(o => o.status === 'draft').length}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-purple-900/30 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
              <label htmlFor="search" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Search</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700/50 border border-purple-900/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            <div>
              <label htmlFor="filterType" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Filter by Type</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700/50 border border-purple-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="tool">Tool</option>
                <option value="app">App</option>
                <option value="game">Game</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterCategory" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Filter by Category</label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700/50 border border-purple-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Filter by Status</label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700/50 border border-purple-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
            <div>
              <label htmlFor="sortBy" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Sort by</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700/50 border border-purple-900/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="addedAt">Date Added</option>
                <option value="title">Title</option>
                <option value="views">Views</option>
                <option value="unlocks">Unlocks</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-purple-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="bg-purple-800/50 border-b border-purple-700">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium uppercase tracking-wider text-purple-300">Title</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium uppercase tracking-wider text-purple-300 hidden sm:table-cell">Type</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium uppercase tracking-wider text-purple-300 hidden md:table-cell">Category</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium uppercase tracking-wider text-purple-300 hidden md:table-cell">Status</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium uppercase tracking-wider text-purple-300 hidden md:table-cell">Stats</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium uppercase tracking-wider text-purple-300 hidden sm:table-cell">Date Added</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium uppercase tracking-wider text-purple-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-700">
                {paginatedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-purple-900/30 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-white">{offer.title}</div>
                      <div className="text-xs sm:text-sm text-gray-400 line-clamp-1 max-w-[150px] sm:max-w-[200px]">{offer.description}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30">
                        {offer.type === 'tool' ? 'Tool' : offer.type === 'app' ? 'App' : 'Game'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-xs sm:text-sm text-gray-300">{offer.category}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(offer.status)}`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-xs sm:text-sm">
                        <div className="text-blue-300">👁️ {offer.views.toLocaleString()}</div>
                        <div className="text-green-300">🔓 {offer.unlocks.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400 hidden sm:table-cell">
                      {new Date(offer.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => router.push(`/admin-xyz123/edit/${offer.id}`)}
                          className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:text-white transition-colors shadow-sm border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOfferToDelete(offer.id);
                            setShowDeleteModal(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-white transition-colors shadow-sm border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-purple-600/20 text-white rounded-lg disabled:opacity-50 hover:bg-purple-600/30 transition-colors"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-purple-600 text-white' : 'bg-purple-600/20 text-gray-300 hover:bg-purple-600/30'} transition-colors`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-purple-600/20 text-white rounded-lg disabled:opacity-50 hover:bg-purple-600/30 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1A2E] p-8 rounded-lg shadow-xl border border-purple-900/30 max-w-sm w-full text-center">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete this offer? This action cannot be undone.</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2 rounded-lg bg-gray-600/30 text-white hover:bg-gray-600/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => offerToDelete && handleDeleteOffer(offerToDelete)}
                  className="px-5 py-2 rounded-lg bg-red-600/50 text-white hover:bg-red-600/70 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManagePage; 