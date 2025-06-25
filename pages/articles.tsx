import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Article } from '../types';

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

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  // Handle URL parameters for category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Articles data:', data);
      
      if (Array.isArray(data)) {
        setArticles(data);
      } else if (data.articles && Array.isArray(data.articles)) {
        setArticles(data.articles);
      } else {
        console.error('Unexpected API response format:', data);
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?type=articles');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterArticles = () => {
    if (!Array.isArray(articles)) {
      console.error('Articles is not an array:', articles);
      setFilteredArticles([]);
      return;
    }

    // Ensure articles is an array and each article has the expected properties
    let validArticles = articles.filter(article => 
      article && typeof article === 'object' && 'published' in article
    );
    
    // Filter published articles
    let filtered = validArticles.filter(article => article.published);

    if (selectedCategory !== 'All') {
      // Check if category is selected by name or slug
      const selectedCat = categories.find(cat => cat.name === selectedCategory || cat.slug === selectedCategory);
      if (selectedCat) {
        filtered = filtered.filter(article => 
          article.category === selectedCat.name || 
          article.category === selectedCat.slug ||
          (typeof article.category === 'string' && article.category.toLowerCase() === selectedCat.name.toLowerCase())
        );
      } else {
        // Fallback to direct name matching
        filtered = filtered.filter(article => article.category === selectedCategory);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        (typeof article.title === 'string' && article.title.toLowerCase().includes(query)) ||
        (typeof article.summary === 'string' && article.summary.toLowerCase().includes(query)) ||
        (typeof article.content === 'string' && article.content.toLowerCase().includes(query)) ||
        (Array.isArray(article.tags) && article.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(query)))
      );
    }

    setFilteredArticles(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-2xl font-bold">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
      <Head>
        <title>Articles & Blog | UnlockVault</title>
        <meta name="description" content="Latest articles about Android games, apps, iOS software, and tech guides" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Articles & Blog
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover the latest insights about Android games, apps, iOS software, and comprehensive tech guides
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
              placeholder="Search articles by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {/* All Categories Button */}
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span>🌟</span>
              <span>All Articles</span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {category.articleCount !== undefined && category.articleCount > 0 && (
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                    {category.articleCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-2">No Articles Found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'No articles available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block bg-[#232046]/80 rounded-2xl shadow-xl border border-purple-900/30 overflow-hidden hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
              >
                {/* Article Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-md text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>By {article.author}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        {article.views}
                      </span>
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>

                  {/* Read More Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-medium text-sm group-hover:text-purple-300 transition-colors">
                      Read Full Article
                    </span>
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-2 group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-300 transform group-hover:scale-110">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredArticles.length > 0 && (
          <div className="text-center mt-12 text-gray-400">
            Showing {filteredArticles.length} of {articles.filter(a => a.published).length} articles
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ArticlesPage; 