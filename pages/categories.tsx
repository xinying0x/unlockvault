import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  type: 'article' | 'offer' | 'both';
  count: number;
  articleCount?: number;
  offerCount?: number;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'articles' | 'offers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, selectedType, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // Filter by type
    if (selectedType === 'articles') {
      filtered = filtered.filter(cat => cat.type === 'article' || cat.type === 'both');
    } else if (selectedType === 'offers') {
      filtered = filtered.filter(cat => cat.type === 'offer' || cat.type === 'both');
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
      );
    }

    // Sort by count (highest first)
    filtered.sort((a, b) => (b.count || 0) - (a.count || 0));

    setFilteredCategories(filtered);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Articles Only';
      case 'offer': return 'Offers Only';
      case 'both': return 'Articles & Offers';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'offer': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'both': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4 mx-auto"></div>
          <div className="text-2xl font-bold">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
      <Head>
        <title>Categories | UnlockVault</title>
        <meta name="description" content="Browse all categories of tools, apps, games, and articles on UnlockVault" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Browse Categories
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Explore our comprehensive collection organized by categories
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {['all', 'articles', 'offers'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as 'all' | 'articles' | 'offers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <span>
                  {type === 'all' ? '🌟' : type === 'articles' ? '📄' : '🎁'}
                </span>
                <span className="capitalize">
                  {type === 'all' ? 'All Categories' : type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-2xl font-bold mb-2">No Categories Found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No categories available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-[#232046]/80 rounded-2xl shadow-xl border border-purple-900/30 overflow-hidden hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 group"
              >
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${category.color} p-6 text-center`}>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getTypeColor(category.type)}`}>
                    {getTypeLabel(category.type)}
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total Items:</span>
                      <span className="text-white font-medium">{category.count || 0}</span>
                    </div>
                    {category.articleCount !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Articles:</span>
                        <span className="text-blue-400 font-medium">{category.articleCount}</span>
                      </div>
                    )}
                    {category.offerCount !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Offers:</span>
                        <span className="text-green-400 font-medium">{category.offerCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {(category.type === 'article' || category.type === 'both') && category.articleCount && category.articleCount > 0 && (
                      <Link
                        href={`/articles?category=${category.slug}`}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-center"
                      >
                        View Articles
                      </Link>
                    )}
                    {(category.type === 'offer' || category.type === 'both') && category.offerCount && category.offerCount > 0 && (
                      <Link
                        href={`/search?category=${category.slug}`}
                        className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-center"
                      >
                        View Offers
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 bg-[#232046]/50 rounded-2xl p-6 border border-purple-900/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Categories Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {categories.length}
              </div>
              <div className="text-sm text-gray-400">Total Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {categories.filter(cat => cat.type === 'article' || cat.type === 'both').length}
              </div>
              <div className="text-sm text-gray-400">Article Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {categories.filter(cat => cat.type === 'offer' || cat.type === 'both').length}
              </div>
              <div className="text-sm text-gray-400">Offer Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 