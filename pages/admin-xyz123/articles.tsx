import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/AdminLayout';
import { Article } from '../../types';

const AdminArticlesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Android Games', 'Android Apps', 'iOS Software', 'How-to', 'Reviews', 'News'];

  useEffect(() => {
    if (!authLoading && user) {
      fetchArticles();
    }
  }, [authLoading, user]);

  const fetchArticles = async () => {
    try {
      // Fetch all articles (both published and unpublished) for admin
      const response = await fetch('/api/articles?published=all');
      const data = await response.json();
      
      // Handle both array response and paginated response
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

  const deleteArticle = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter(article => article.slug !== slug));
      } else {
        alert('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const togglePublished = async (article: Article) => {
    try {
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !article.published,
        }),
      });

      if (response.ok) {
        // Update the article in the local state
        setArticles(articles.map(a => 
          a.slug === article.slug 
            ? { ...a, published: !a.published, lastModified: new Date().toISOString() }
            : a
        ));
      } else {
        const errorData = await response.text();
        console.error('Failed to update article:', errorData);
        alert('Failed to update article status');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article status');
    }
  };

  const filteredArticles = articles.filter(article => {
    if (!article || typeof article !== 'object') return false;
    
    const matchesSearch = searchQuery ? (
      (typeof article.title === 'string' && article.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof article.summary === 'string' && article.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : true;
    
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Articles Management | Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Articles Management</h1>
            <p className="text-gray-400">Manage your blog articles and content</p>
          </div>
          <Link
            href="/admin-xyz123/articles/new"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            + New Article
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-white">{articles.length}</div>
            <div className="text-gray-400 text-sm">Total Articles</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-green-400">
              {articles.filter(a => a && typeof a === 'object' && a.published).length}
            </div>
            <div className="text-gray-400 text-sm">Published</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-yellow-400">
              {articles.filter(a => a && typeof a === 'object' && !a.published).length}
            </div>
            <div className="text-gray-400 text-sm">Drafts</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="text-2xl font-bold text-blue-400">
              {articles
                .filter(a => a && typeof a === 'object')
                .reduce((sum, a) => sum + (typeof a.views === 'number' ? a.views : 0), 0)
                .toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total Views</div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Articles Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first article'}
              </p>
              <Link
                href="/admin-xyz123/articles/new"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-gray-300">Article</th>
                    <th className="text-left px-6 py-4 font-medium text-gray-300">Category</th>
                    <th className="text-left px-6 py-4 font-medium text-gray-300">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-gray-300">Views</th>
                    <th className="text-left px-6 py-4 font-medium text-gray-300">Date</th>
                    <th className="text-left px-6 py-4 font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-700/25 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-white line-clamp-1">{article.title}</div>
                            <div className="text-sm text-gray-400 line-clamp-1">{article.summary}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublished(article)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            article.published
                              ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                              : 'bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30'
                          }`}
                        >
                          {article.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(article.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/articles/${article.slug}`}
                            target="_blank"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Article"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin-xyz123/articles/edit/${article.slug}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            title="Edit Article"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => deleteArticle(article.slug)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Article"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminArticlesPage; 