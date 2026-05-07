import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import UnlockCard from '../components/UnlockCard';
import { useToast } from '../components/ToastProvider';
import AdBanner from '../components/AdBanner';

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
  rating?: number;
}

const AppsPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [useDummyStats, setUseDummyStats] = useState(false);
  const { addToast } = useToast();

  const itemsPerPage = 12;

  useEffect(() => {
    fetchSettingsAndOffers();
  }, []);

  const fetchSettingsAndOffers = async () => {
    try {
      const settingsResponse = await fetch('/api/admin/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setUseDummyStats(settingsData.useDummyStats);
      } else {
        console.error('فشل جلب الإعدادات للصفحة العامة:', await settingsResponse.json());
      }

      const offersResponse = await fetch('/api/offers');
      const offersData = await offersResponse.json();
      
      // تصفية التطبيقات فقط (وليس الأدوات أو الألعاب)
      const appsOnly = offersData.filter((item: Offer) => item.type === 'app');
      setOffers(appsOnly);
      setLoading(false);
      
      addToast({
        type: 'success',
        title: 'Apps Loaded',
        message: `Found ${appsOnly.length} premium apps`
      });
    } catch (error) {
      console.error('فشل جلب التطبيقات أو الإعدادات:', error);
      setLoading(false);
      addToast({
        type: 'error',
        title: 'Loading Failed',
        message: 'Could not load apps. Please try again.'
      });
    }
  };

  const categories = useMemo(() => {
    const cats = offers.reduce((acc, offer) => {
      if (!acc.includes(offer.category)) {
        acc.push(offer.category);
      }
      return acc;
    }, [] as string[]);
    return cats.sort();
  }, [offers]);

  const filteredAndSortedOffers = useMemo(() => {
    let filtered = offers;

    // تصفية حسب مصطلح البحث
    if (searchTerm) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // تصفية حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(offer => offer.category === selectedCategory);
    }

    // الفرز
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'unlocks':
        filtered.sort((a, b) => b.unlocks - a.unlocks);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [offers, searchTerm, selectedCategory, sortBy]);

  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOffers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedOffers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedOffers.length / itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    setCurrentPage(1);
    addToast({
      type: 'info',
      title: 'Filters Cleared',
      message: 'All filters have been reset'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <SEOHead
          title="Premium Apps - UnlockVault"
          description="Browse our collection of premium apps and software"
          keywords={['premium apps', 'software', 'cracked apps']}
          url="https://unlockvault.com/apps"
        />
        
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Premium Apps</h2>
            <p className="text-gray-400">Please wait while we fetch the latest apps...</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700/50 rounded-2xl h-80"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
      <SEOHead
        title="Premium Apps - UnlockVault"
        description="Browse our collection of premium apps and software for free. Find productivity, design, entertainment apps and more."
        keywords={['premium apps', 'software', 'cracked apps', 'free apps', 'productivity apps', 'design apps']}
        url="https://unlockvault.com/apps"
      />

      {/* قسم البطل (Hero Section) */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-cyan-900/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-fade-in-up">
            Premium Apps Collection
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Explore our extensive library of premium applications, cracked software, and productivity tools, all available for free. Boost your efficiency and creativity without spending a dime.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <input
              type="text"
              placeholder="Search apps..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full md:flex-1 px-5 py-3 bg-[#232046] border border-purple-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-lg"
            />
            <div className="flex gap-4 md:gap-2 lg:gap-4 flex-wrap justify-center">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-5 py-3 bg-[#232046] border border-purple-800 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-5 py-3 bg-[#232046] border border-purple-800 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Viewed</option>
                <option value="unlocks">Most Unlocked</option>
                <option value="title">Title (A-Z)</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={clearFilters}
                className="px-5 py-3 bg-red-600/30 border border-red-500/50 rounded-full text-red-300 hover:bg-red-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Offers Grid */}
          {paginatedOffers.length === 0 && !loading && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg">No apps found matching your criteria.</p>
        </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {paginatedOffers.map((offer) => (
              <UnlockCard
                key={offer.id}
                title={offer.title}
                description={offer.description}
                image={offer.image}
                category={offer.category}
                type={offer.type}
                rating={offer.rating}
                buttonText="Download App"
                buttonHref={`/offers/${offer.slug}`}
                offerSlug={offer.slug}
                views={useDummyStats ? Math.floor(Math.random() * 1000) + 500 : offer.views}
                unlocks={useDummyStats ? Math.floor(Math.random() * 500) + 100 : offer.unlocks}
                addedAt={offer.addedAt}
              />
            ))}
          </div>

          {/* Ad Banner between grid and pagination */}
          <AdBanner position="inline" className="px-1" />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/50 transition-colors"
              >
                Previous
              </button>
              <span className="text-lg font-medium text-gray-300">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-purple-600/30 border border-purple-500/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/50 transition-colors"
              >
                Next
              </button>
          </div>
        )}
      </div>
      </section>
    </div>
  );
};

export default AppsPage; 