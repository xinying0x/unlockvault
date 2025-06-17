import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import UnlockCard from '../components/UnlockCard';

interface SearchResult {
  id: string;
  title: string;
  type: 'tool' | 'app' | 'game';
  category: string;
  slug: string;
  image: string;
  relevance: number;
  description: string;
  views?: number;
  unlocks?: number;
}

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<SearchResult[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      const initialQuery = Array.isArray(q) ? q[0] : q || '';
      setSearchQuery(initialQuery);
      performSearch(initialQuery, selectedType);
    }
  }, [q, selectedType, router.isReady]);

  const performSearch = async (query: string, type: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) {
        params.append('q', query);
      }
      if (type !== 'all') {
        params.append('type', type);
      }

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data: SearchResult[] = await response.json();
      setFilteredItems(data);
    } catch (error) {
      console.error('Search API error:', error);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery || '')}&type=${selectedType}`);
  };

  const getButtonText = (type: string) => {
    switch (type) {
      case 'game': return 'Get Hack';
      case 'app': return 'Download';
      default: return 'Unlock Now';
    }
  };

  const getHref = (item: SearchResult) => {
    return `/offers/${item.slug}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
      <Head>
        <title>Search Results | UnlockVault</title>
        <meta name="description" content="Search results for tools, games, and apps on UnlockVault." />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Search Results</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, games, apps..."
              className="w-full bg-[#232046] border border-purple-800 rounded-full px-6 py-4 pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
            />
            <button
              type="submit"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition text-xl"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Type Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4 bg-[#232046]/50 rounded-2xl p-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'tool', label: 'Tools' },
              { value: 'game', label: 'Games' },
              { value: 'app', label: 'Apps' }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-6 py-2 rounded-xl font-medium transition ${
                  selectedType === type.value
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-gray-300">
            {searchQuery && `Showing ${filteredItems.length} results for "${searchQuery}"`}
            {!searchQuery && `Showing all ${filteredItems.length} items`}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Searching...</p>
          </div>
        ) : (
          /* Results Grid */
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-start">
              {filteredItems.map(item => (
                <UnlockCard
                  key={`${item.type}-${item.slug}`}
                  image={item.image}
                  title={item.title}
                  description={item.description}
                  buttonText={getButtonText(item.type)}
                  buttonHref={getHref(item)}
                  offerSlug={item.slug}
                  views={item.views}
                  unlocks={item.unlocks}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-2">No results found</h2>
              <p className="text-gray-400">Try searching with different keywords or browse our categories.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchPage; 