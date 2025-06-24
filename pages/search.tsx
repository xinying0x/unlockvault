import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

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

interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
}

interface SearchResult {
  type: 'offer' | 'article';
  data: Offer | Article;
  relevance: number;
}

interface SearchPageProps {
  initialQuery?: string;
  initialResults: SearchResult[];
  categories: string[];
  totalCount: number;
}

const ITEMS_PER_PAGE = 12;

const SearchPage: React.FC<SearchPageProps> = ({ 
  initialQuery = '', 
  initialResults, 
  categories, 
  totalCount 
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialResults.length >= ITEMS_PER_PAGE);
  const [searchStats, setSearchStats] = useState({ total: totalCount, filtered: initialResults.length });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Update query from URL parameters
  useEffect(() => {
    const urlQuery = router.query.q as string;
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [router.query.q]);

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
        setResults(initialResults);
        setSearchStats({ total: totalCount, filtered: initialResults.length });
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
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString()
        });

        const response = await fetch(`/api/search-v2?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (page === 1) {
            setResults(data.results || []);
          } else {
            setResults(prev => [...prev, ...(data.results || [])]);
          }
          
          setHasMore(data.pagination.page < data.pagination.pages);
          setSearchStats({ 
            total: data.pagination.total || totalCount, 
            filtered: data.pagination.total || data.results?.length || 0 
          });
        } else {
          // Fallback to initial results on error
          if (page === 1) {
            setResults(initialResults);
            setSearchStats({ total: totalCount, filtered: initialResults.length });
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to initial results on error
        if (page === 1) {
          setResults(initialResults);
          setSearchStats({ total: totalCount, filtered: initialResults.length });
        }
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    }, 300),
    [initialResults, totalCount]
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
    setResults(initialResults);
    setSearchStats({ total: totalCount, filtered: initialResults.length });
  };

  const filterOptions = useMemo(() => ({
    types: [
      { value: 'all', label: 'All Content', icon: '📦' },
      { value: 'offer', label: 'Offers', icon: '🎁' },
      { value: 'article', label: 'Articles', icon: '📄' }
    ],
    sorts: [
      { value: 'relevance', label: 'Most Relevant', icon: '🎯' },
      { value: 'newest', label: 'Newest', icon: '🆕' },
      { value: 'popular', label: 'Most Popular', icon: '🔥' },
      { value: 'views', label: 'Most Viewed', icon: '👁️' }
    ]
  }), []);

  const renderSearchResult = (result: SearchResult, index: number) => {
    if (result.type === 'offer') {
      const offer = result.data as Offer;
      const offerHref = offer.slug ? `/offers/${offer.slug}` : `/offers/${offer.id}`;
      return (
        <div key={`offer-${offer.id}-${index}`} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:border-purple-500/50">
          <Link href={offerHref} className="block h-full">
            <div className="relative h-48 mb-4 rounded-t-xl overflow-hidden">
              <Image
                src={offer.image || '/images/placeholder.png'}
                alt={offer.title || 'Offer'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                🎁 Offer
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-white group-hover:text-purple-400 transition-colors">
                {offer.title || 'Untitled Offer'}
              </h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {offer.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="bg-gray-700/50 text-gray-200 px-2 py-1 rounded">
                  {offer.category || 'Uncategorized'}
                </span>
                <div className="flex items-center space-x-2">
                  <span>👁️ {offer.views || 0}</span>
                  <span>🔓 {offer.unlocks || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      );
    } else {
      const article = result.data as Article;
      const articleHref = article.slug ? `/articles/${article.slug}` : `/articles/${article.id}`;
      return (
        <div key={`article-${article.id}-${index}`} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:border-green-500/50">
          <Link href={articleHref} className="block h-full">
            <div className="relative h-48 mb-4 rounded-t-xl overflow-hidden">
              <Image
                src={article.image || '/images/placeholder.png'}
                alt={article.title || 'Article'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold">
                📄 Article
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-white group-hover:text-green-400 transition-colors">
                {article.title || 'Untitled Article'}
              </h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                {article.summary || 'No summary available'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="bg-gray-700/50 text-gray-200 px-2 py-1 rounded">
                  {article.category || 'Uncategorized'}
                </span>
                <div className="flex items-center space-x-2">
                  <span>👁️ {article.views || 0}</span>
                  <span>✍️ {article.author || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      );
    }
  };

  return (
    <>
      <SEOHead
        title={query ? `Search Results for "${query}" - UnlockVault` : "Search - UnlockVault"}
        description={query ? `Find the best results for "${query}" on UnlockVault` : "Search through our collection of premium software, games, and articles"}
        url="https://unlockvault.xyz/search"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E]">
            {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                Search UnlockVault
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Find premium software, games, tools, and helpful articles
              </p>
            </div>
          </div>
            </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                placeholder="Search for software, games, or articles..."
                className="w-full px-4 py-3 pl-12 pr-4 text-lg border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              </div>
            </div>

            {/* Filters */}
          <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700/50">
            <div className="flex flex-wrap items-center gap-4">
              {/* Content Type Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-300">Type:</label>
                <select
                  value={selectedType}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {filterOptions.types.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
                
                {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-300">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-300">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {filterOptions.sorts.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {(query || selectedCategory !== 'all' || selectedType !== 'all' || sortBy !== 'relevance') && (
                  <button
                    onClick={clearFilters}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
                  >
                  Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Search Stats */}
          <div className="mb-6 text-sm text-gray-400">
            {query && (
              <p>
                Showing {searchStats.filtered} results for <strong className="text-white">"{query}"</strong>
                {searchStats.total > 0 && ` (${searchStats.total} total items)`}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="mt-2 text-gray-400">Searching...</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && (
            <>
              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((result, index) => renderSearchResult(result, index))}
          </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-400 mb-4">
                    {query ? `No results found for "${query}". Try different keywords or filters.` : 'Enter a search term to get started.'}
                  </p>
                  {query && (
                <button
                  onClick={clearFilters}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                      Clear Search
                </button>
                  )}
              </div>
              )}

              {/* Load More Trigger */}
              {hasMore && results.length > 0 && (
                <div ref={observerRef} className="py-8 text-center">
                  {isLoadingMore ? (
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Load More Results
                    </button>
                  )}
                  </div>
                )}
              </>
            )}
          </div>
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
    const searchQuery = query.q as string || '';
    const results: SearchResult[] = [];
    let totalCount = 0;

    // Get categories for filter from API
    let categories: string[] = [];
    try {
      const categoriesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        categories = categoriesData.map((cat: any) => cat.name);
      }
    } catch (error) {
      console.error('Categories API error:', error);
      // Fallback categories
      categories = ['Technology', 'Gaming', 'Productivity', 'Security', 'Design', 'Development'];
    }

    // If there's a search query, perform initial search
    if (searchQuery) {
      const searchParams = new URLSearchParams({
        q: searchQuery,
        limit: ITEMS_PER_PAGE.toString()
      });

      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/search-v2?${searchParams}`);
        if (response.ok) {
          const data = await response.json();
          results.push(...(data.results || []));
          totalCount = data.pagination?.total || 0;
        }
      } catch (error) {
        console.error('Search API error:', error);
      }
    }

    return {
      props: {
        initialQuery: searchQuery,
        initialResults: results,
        categories,
        totalCount
      }
    };
  } catch (error) {
    console.error('Search page error:', error);
    return {
      props: {
        initialQuery: '',
        initialResults: [],
        categories: [],
        totalCount: 0
      }
    };
  }
};

export default SearchPage; 