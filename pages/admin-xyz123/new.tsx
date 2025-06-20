import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';

interface OfferData {
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  keywords: string[];
  link: string;
  gallery: string[];
  featured: boolean;
  rating: number;
  customCategory: string;
  slug: string;
  showInDashboard: boolean;
}

const NewOfferPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [offerData, setOfferData] = useState<OfferData>({
    title: '',
    description: '',
    image: '',
    category: '',
    type: 'tool',
    keywords: [],
    link: '',
    gallery: [],
    featured: false,
    rating: 5,
    customCategory: '',
    slug: '',
    showInDashboard: true,
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [categories, setCategories] = useState<string[]>([
    'Design & Graphics',
    'Video & Audio',
    'Productivity',
    'Development',
    'Gaming',
    'Business',
    'AI & Machine Learning',
    'Security'
  ]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  useEffect(() => {
    // Only redirect if not already on the login page and router is ready
    if (!router.isReady) return;

    if (!loading && !user && router.pathname !== '/admin-xyz123/login') {
      router.push('/admin-xyz123/login');
    }
  }, [user, loading, router]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !offerData.keywords.includes(keywordInput.trim())) {
      setOfferData({
        ...offerData,
        keywords: [...offerData.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setOfferData({
      ...offerData,
      keywords: offerData.keywords.filter(k => k !== keyword)
    });
  };

  const handleAddCustomCategory = () => {
    if (offerData.customCategory.trim() && !categories.includes(offerData.customCategory.trim())) {
      const newCategory = offerData.customCategory.trim();
      setCategories([...categories, newCategory]);
      setOfferData({
        ...offerData,
        category: newCategory,
        customCategory: ''
      });
      setShowCustomCategory(false);
    }
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
              onMouseEnter={(e) => {
                // تأثير الاستطلاع على النجوم
                const stars = e.currentTarget.parentElement?.querySelectorAll('button');
                stars?.forEach((starBtn, index) => {
                  if (index < star) {
                    starBtn.style.transform = 'scale(1.2)';
                    starBtn.style.filter = 'brightness(1.3)';
                  } else {
                    starBtn.style.transform = 'scale(1)';
                    starBtn.style.filter = 'brightness(1)';
                  }
                });
              }}
              onMouseLeave={(e) => {
                // إرجاع النجوم لحالتها الطبيعية
                const stars = e.currentTarget.parentElement?.querySelectorAll('button');
                stars?.forEach((starBtn) => {
                  starBtn.style.transform = 'scale(1)';
                  starBtn.style.filter = 'brightness(1)';
                });
              }}
              className={`relative text-3xl transition-all duration-300 ease-in-out hover:scale-125 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded ${
                star <= rating 
                  ? 'text-yellow-400 drop-shadow-lg' 
                  : 'text-gray-600 hover:text-yellow-200'
            }`}
              style={{
                textShadow: star <= rating ? '0 0 10px rgba(255, 193, 7, 0.8)' : 'none',
                filter: star <= rating ? 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.4))' : 'none'
              }}
            >
              {star <= rating ? '★' : '☆'}
          </button>
        ))}
        </div>
        <div className="flex flex-col items-start ml-3">
          <span className="text-white font-semibold text-lg">({rating}/5)</span>
          <span className="text-gray-400 text-xs">
            {rating === 5 ? 'ممتاز' : rating >= 4 ? 'جيد جداً' : rating >= 3 ? 'جيد' : rating >= 2 ? 'متوسط' : 'ضعيف'}
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!offerData.title || !offerData.description || !offerData.category) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    if (offerData.link.trim() === '') {
      setMessage('Please add a main offer link');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newSlug = generateSlug(offerData.title);

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...offerData,
          slug: newSlug,
          link: offerData.link,
          gallery: JSON.stringify(offerData.gallery),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create offer');
      }
      
      setMessage('Offer created successfully!');
      setMessageType('success');
      
      // Reset form
      setOfferData({
        title: '',
        description: '',
        image: '',
        category: '',
        type: 'tool',
        keywords: [],
        link: '',
        gallery: [],
        featured: false,
        rating: 5,
        customCategory: '',
        slug: '',
        showInDashboard: true,
      });
      
        setTimeout(() => {
        router.push('/admin-xyz123/manage');
      }, 2000);
    } catch (error: any) {
      setMessage(`Failed to create offer: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Add New Offer">
      <div className="max-w-4xl mx-auto">
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${messageType === 'success' ? 'bg-green-600/20 border border-green-500/30 text-green-300' : 'bg-red-600/20 border border-red-500/30 text-red-300'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Basic Offer Details</h2>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={offerData.title}
              onChange={(e) => setOfferData({ ...offerData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              id="description"
              value={offerData.description}
              onChange={(e) => setOfferData({ ...offerData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
            <input
              type="text"
              id="image"
              value={offerData.image}
              onChange={(e) => setOfferData({ ...offerData, image: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {offerData.image && (
              <img src={offerData.image} alt="Offer Thumbnail" className="mt-4 max-w-xs rounded-lg shadow-lg" />
            )}
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                id="type"
                value={offerData.type}
                onChange={(e) => setOfferData({ ...offerData, type: e.target.value as 'tool' | 'app' | 'game' })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="tool">Tool</option>
                <option value="app">App</option>
                <option value="game">Game</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                id="category"
                value={offerData.category}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    setShowCustomCategory(true);
                    setOfferData({ ...offerData, category: '' });
                  } else {
                    setShowCustomCategory(false);
                    setOfferData({ ...offerData, category: value });
                  }
                }}
                className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">+ Add Custom Category</option>
              </select>
              {showCustomCategory && (
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={offerData.customCategory}
                    onChange={(e) => setOfferData({ ...offerData, customCategory: e.target.value })}
                    placeholder="Enter new custom category"
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Keywords</h2>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Enter keyword and press Enter"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {offerData.keywords.map((keyword, index) => (
                <span key={index} className="flex items-center gap-2 bg-purple-800/50 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-700/30">
                  {keyword}
                  <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="text-purple-300 hover:text-white">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Gallery Images</h2>
            <div className="space-y-4">
              {offerData.gallery.map((url, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-800/40 p-3 rounded-xl">
                  <input
                    type="text"
                    value={url}
                    onChange={e => {
                      const newGallery = [...offerData.gallery];
                      newGallery[idx] = e.target.value;
                      setOfferData({ ...offerData, gallery: newGallery });
                    }}
                    placeholder="Image URL"
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {url && (
                    <img src={url} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-purple-700/30" />
                  )}
                  <button
                    type="button"
                    onClick={() => setOfferData({ ...offerData, gallery: offerData.gallery.filter((_, i) => i !== idx) })}
                    className="text-red-400 hover:text-red-600 text-xl font-bold px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setOfferData({ ...offerData, gallery: [...offerData.gallery, ''] })}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-400 hover:to-indigo-500 transition-all"
              >
                + Add Image
              </button>
            </div>
          </div>

          {/* Main Offer Link */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-2 mt-4">Main Offer Link</label>
            <input
              type="url"
              id="link"
              value={offerData.link}
              onChange={e => setOfferData({ ...offerData, link: e.target.value })}
              placeholder="https://your-link.com"
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Featured & Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offerData.featured}
                  onChange={(e) => setOfferData({ ...offerData, featured: e.target.checked })}
                  className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-300 font-medium">Featured Offer</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
              {renderStars(offerData.rating, (rating) => setOfferData({ ...offerData, rating }))}
            </div>
          </div>

          {/* Show in Dashboard */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={offerData.showInDashboard}
                onChange={(e) => setOfferData({ ...offerData, showInDashboard: e.target.checked })}
                className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-gray-300 font-medium">Show in Dashboard</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Offer'}
            </button>
            <Link
              href="/admin-xyz123/manage"
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default NewOfferPage; 