import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ResponsiveCard from '../components/ResponsiveCard';
import SEOHead from '../components/SEOHead';

interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  rating: number;
}

interface SearchPageProps {
  initialQuery?: string;
  initialOffers: Offer[];
  categories: string[];
  totalCount: number;
}

const ITEMS_PER_PAGE = 12;

const SearchPage: React.FC<SearchPageProps> = ({ 
  initialQuery = '', 
  initialOffers, 
  categories, 
  totalCount 
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialOffers.length >= ITEMS_PER_PAGE);
  const [searchStats, setSearchStats] = useState({ total: totalCount, filtered: initialOffers.length });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, isLoadingMore]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, category: string, type: string, sort: string, page: number = 1) => {
      if (!searchQuery.trim() && category === 'all' && type === 'all') {
        setOffers(initialOffers);
        setSearchStats({ total: totalCount, filtered: initialOffers.length });
        setIsLoadingMore(false);
        return;
      }

      if (page === 1) {
        setLoading(true);
      }
      
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          category: category !== 'all' ? category : '',
          type: type !== 'all' ? type : '',
          sort,
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString()
        });

        const response = await fetch(`/api/search-v2?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (page === 1) {
            setOffers(data.offers || []);
          } else {
            setOffers(prev => [...prev, ...(data.offers || [])]);
          }
          
          setHasMore(data.hasMore || false);
          setSearchStats({ 
            total: data.totalCount || totalCount, 
            filtered: data.filteredCount || data.offers?.length || 0 
          });
        } else {
          // Fallback to initial offers on error
          if (page === 1) {
            setOffers(initialOffers);
            setSearchStats({ total: totalCount, filtered: initialOffers.length });
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to initial offers on error
        if (page === 1) {
          setOffers(initialOffers);
          setSearchStats({ total: totalCount, filtered: initialOffers.length });
        }
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    }, 300),
    [initialOffers, totalCount]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setCurrentPage(1);
    debouncedSearch(value, selectedCategory, selectedType, sortBy);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    
    if (filterType === 'category') {
      setSelectedCategory(value);
    } else if (filterType === 'type') {
      setSelectedType(value);
    } else if (filterType === 'sort') {
      setSortBy(value);
    }
    
    debouncedSearch(query, 
      filterType === 'category' ? value : selectedCategory,
      filterType === 'type' ? value : selectedType,
      filterType === 'sort' ? value : sortBy
    );
  };

  // Load more results
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setIsLoadingMore(true);
    
    debouncedSearch(query, selectedCategory, selectedType, sortBy, nextPage);
  }, [currentPage, hasMore, isLoadingMore, query, selectedCategory, selectedType, sortBy, debouncedSearch]);

  // Clear all filters
  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSortBy('relevance');
    setCurrentPage(1);
    setOffers(initialOffers);
    setSearchStats({ total: totalCount, filtered: initialOffers.length });
  };

  const filterOptions = useMemo(() => ({
    types: [
      { value: 'all', label: 'All Types', icon: '📦' },
      { value: 'tool', label: 'Tools', icon: '🛠️' },
      { value: 'app', label: 'Apps', icon: '📱' },
      { value: 'game', label: 'Games', icon: '🎮' }
    ],
    sorts: [
      { value: 'relevance', label: 'Most Relevant', icon: '🎯' },
      { value: 'newest', label: 'Newest', icon: '🆕' },
      { value: 'popular', label: 'Most Popular', icon: '🔥' },
      { value: 'rating', label: 'Highest Rated', icon: '⭐' }
    ]
  }), []);

  return (
    <>
      <SEOHead
        title={`Search ${query ? `- ${query}` : ''} | UnlockVault`}
        description={`Search through our vast library of free tools, apps, and games. ${query ? `Search results for: ${query}` : ''}`}
        keywords={['search', 'free tools', 'apps', 'games', query].filter(Boolean)}
        url={`https://unlockvault.com/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-fade-in">
                🔍 Discover Free Premium Tools
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up delay-200">
                Search through thousands of free tools, apps, and games in our vast library
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-8 animate-fade-in-up delay-400">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xl">🔍</span>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  placeholder="Search for tools, apps, games..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      debouncedSearch('', selectedCategory, selectedType, sortBy);
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto mb-8 animate-fade-in-up delay-600">
              <div className="flex flex-wrap gap-4 justify-center items-center">
                
                {/* Category Filter */}
                <div className="relative min-w-[160px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="appearance-none bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full text-sm font-medium"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">📁</span>
                  </div>
                </div>

                {/* Type Filter */}
                <div className="relative min-w-[140px]">
                  <select
                    value={selectedType}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="appearance-none bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full text-sm font-medium"
                  >
                    {filterOptions.types.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">📦</span>
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative min-w-[160px]">
                  <select
                    value={sortBy}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="appearance-none bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full text-sm font-medium"
                  >
                    {filterOptions.sorts.map(sort => (
                      <option key={sort.value} value={sort.value}>
                        {sort.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">🔄</span>
                  </div>
                </div>

                {/* Clear Filters */}
                {(query || selectedCategory !== 'all' || selectedType !== 'all' || sortBy !== 'relevance') && (
                  <button
                    onClick={clearFilters}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium min-w-[120px] justify-center"
                  >
                    <span className="text-sm">🗑️</span>
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Stats */}
            <div className="text-center mb-16 animate-fade-in-up delay-800">
              <p className="text-gray-400">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </span>
                ) : (
                  <>
                    Found <span className="text-blue-400 font-bold">{searchStats.filtered.toLocaleString()}</span> results
                    {query && ` for "${query}"`}
                    {searchStats.total !== searchStats.filtered && (
                      <span className="text-gray-500"> out of {searchStats.total.toLocaleString()}</span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {offers.length === 0 && !loading ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-xl font-bold text-white mb-3">No results found</h3>
                <p className="text-gray-400 mb-6">Try searching with different keywords or change your filters</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="search-grid">
                  {offers.map((offer, index) => (
                    <div
                      key={offer.id}
                      className="animate-fade-in-up w-full"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ResponsiveCard
                        title={offer.title}
                        description={offer.description}
                        image={offer.image}
                        category={offer.category}
                        type={offer.type}
                        rating={offer.rating}
                        buttonText={offer.type === 'tool' ? 'Open Tool' : offer.type === 'app' ? 'Download App' : 'Download Game'}
                        buttonHref={`/offers/${offer.slug}`}
                        views={offer.views}
                        unlocks={offer.unlocks}
                        featured={offer.featured}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div ref={observerRef} className="flex justify-center items-center py-8">
                    {isLoadingMore && (
                      <div className="flex items-center gap-3 infinite-scroll-loader">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400">Loading more results...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && offers.length > 0 && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full text-gray-400 text-sm end-of-results">
                      <span>🎉</span>
                      <span>You've seen all results!</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const searchQuery = (query.q as string) || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Fetch initial offers and categories
    const [offersResponse, categoriesResponse] = await Promise.all([
      fetch(`${baseUrl}/api/search-v2?q=${encodeURIComponent(searchQuery)}&limit=${ITEMS_PER_PAGE}`),
      fetch(`${baseUrl}/api/categories`)
    ]);

    const offersData = offersResponse.ok ? await offersResponse.json() : { offers: [], totalCount: 0 };
    const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];

    return {
      props: {
        initialQuery: searchQuery,
        initialOffers: offersData.offers || [],
        categories: categoriesData.map((cat: any) => cat.name) || [],
        totalCount: offersData.totalCount || 0
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialQuery: '',
        initialOffers: [],
        categories: [],
        totalCount: 0
      }
    };
  }
};

export default SearchPage; 