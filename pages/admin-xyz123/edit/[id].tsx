import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout'; // Import AdminLayout

interface OfferData {
  id: string;
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
  status: 'active' | 'draft' | 'archived';
  showInDashboard: boolean;
  lockerLinks: { [key: string]: string };
}

const EditOfferPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [offerData, setOfferData] = useState<OfferData | null>(null);
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

  useEffect(() => {
    // Only redirect if not already on the login page and router is ready
    if (!router.isReady) return;

    if (!loading && !user && router.pathname !== '/admin-xyz123/login') {
      router.push('/admin-xyz123/login');
    } else if (user && id) {
      fetchOfferData();
    }
  }, [user, loading, router, id]);

  const fetchOfferData = async () => {
    try {
      const response = await fetch(`/api/offers/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch offer data');
      }
      const data = await response.json();
      
      // Fix gallery data if it's a string
      if (data.gallery && typeof data.gallery === 'string') {
        try {
          data.gallery = JSON.parse(data.gallery);
        } catch (e) {
          console.error('Error parsing gallery:', e);
          data.gallery = [];
        }
      }
      
      // Ensure gallery is always an array
      if (!Array.isArray(data.gallery)) {
        data.gallery = [];
      }
      
      setOfferData({ ...data, lockerLinks: data.lockerLinks || {} });
      // Add any custom categories from the fetched offer to the categories list
      if (data.category && !categories.includes(data.category)) {
        setCategories(prev => [...prev, data.category]);
      }
    } catch (error: any) {
      setMessage(`Failed to load offer: ${error.message}`);
      setMessageType('error');
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && offerData && !offerData.keywords.includes(keywordInput.trim())) {
      setOfferData(prev => prev ? {
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      } : null);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setOfferData(prev => prev ? {
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    } : null);
  };

  const handleAddCustomCategory = () => {
    if (offerData?.customCategory.trim() && !categories.includes(offerData.customCategory.trim())) {
      const newCategory = offerData.customCategory.trim();
      setCategories([...categories, newCategory]);
      setOfferData(prev => prev ? {
        ...prev,
        category: newCategory,
        customCategory: ''
      } : null);
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
    
    if (!offerData || !offerData.title || !offerData.description || !offerData.category) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    if (!offerData.link || offerData.link.trim() === '') {
      setMessage('Please add the main offer link');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...offerData,
          lockerLinks: JSON.stringify(offerData.lockerLinks), // Stringify lockerLinks
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update offer');
      }
      
      setMessage('Offer updated successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        router.push('/admin-xyz123/manage');
      }, 2000);
    } catch (error: any) {
      setMessage(`Failed to update offer: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !offerData) {
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
    <AdminLayout title="Edit Offer">
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
              onChange={(e) => setOfferData(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              id="description"
              value={offerData.description}
              onChange={(e) => setOfferData(prev => prev ? { ...prev, description: e.target.value } : null)}
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
              onChange={(e) => setOfferData(prev => prev ? { ...prev, image: e.target.value } : null)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {offerData.image && (
              <img src={offerData.image} alt="Offer Thumbnail" className="mt-4 max-w-xs rounded-lg shadow-lg" />
            )}
          </div>

          {/* Category & Type */}
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Category & Type</h2>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <select
            id="category"
            value={offerData.category}
            onChange={(e) => {
              setOfferData(prev => prev ? { ...prev, category: e.target.value } : null);
              if (e.target.value === 'Custom') {
                setShowCustomCategory(true);
              } else {
                setShowCustomCategory(false);
                setOfferData(prev => prev ? { ...prev, customCategory: '' } : null);
              }
            }}
            className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="Custom">+ Add custom category</option>
          </select>
          {showCustomCategory && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Custom category name"
                value={offerData.customCategory}
                onChange={(e) => setOfferData(prev => prev ? { ...prev, customCategory: e.target.value } : null)} />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                Add
              </button>
            </div>
          )}

          {/* Offer Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2 mt-4">Offer Type</label>
            <select
              id="type"
              value={offerData.type}
              onChange={e => setOfferData(prev => prev ? { ...prev, type: e.target.value as 'tool' | 'app' | 'game' } : null)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            >
              <option value="tool">Tool</option>
              <option value="app">App</option>
              <option value="game">Game</option>
            </select>
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
                placeholder="Enter a keyword and press Enter"
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
              {offerData.gallery && offerData.gallery.map((url, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-800/40 p-3 rounded-xl">
                  <input
                    type="text"
                    value={url}
                    onChange={e => {
                      const newGallery = [...offerData.gallery];
                      newGallery[idx] = e.target.value;
                      setOfferData(prev => prev ? { ...prev, gallery: newGallery } : null);
                    }}
                    placeholder="Image URL"
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {url && (
                    <img src={url} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-purple-700/30" />
                  )}
                  <button
                    type="button"
                    onClick={() => setOfferData(prev => prev ? { ...prev, gallery: offerData.gallery.filter((_, i) => i !== idx) } : null)}
                    className="text-red-400 hover:text-red-600 text-xl font-bold px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setOfferData(prev => prev ? { ...prev, gallery: [...(offerData.gallery || []), ''] } : null)}
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
              onChange={e => setOfferData(prev => prev ? { ...prev, link: e.target.value } : null)}
              placeholder="https://your-link.com"
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Featured & Rating */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={offerData.featured}
              onChange={(e) => setOfferData(prev => prev ? { ...prev, featured: e.target.checked } : null)}
              className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-purple-900 rounded focus:ring-purple-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-300">Featured Offer</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
            {renderStars(offerData.rating, (newRating) => setOfferData(prev => prev ? { ...prev, rating: newRating } : null))}
          </div>

          {/* Show in Dashboard */}
          <div className="flex items-center justify-between mt-6 p-4 bg-gray-800/30 rounded-xl border border-purple-900/30">
            <div className="flex-1">
              <label htmlFor="showInDashboard" className="text-sm font-medium text-gray-300 block mb-1">
                إظهار في لوحة التحكم
              </label>
              <p className="text-xs text-gray-500">
                عند التفعيل، سيظهر هذا العرض في لوحة التحكم الرئيسية
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOfferData(prev => prev ? { ...prev, showInDashboard: !offerData.showInDashboard } : null)}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                offerData.showInDashboard ? 'bg-green-500' : 'bg-gray-600'
              }`}
              role="switch"
              aria-checked={offerData.showInDashboard}
              aria-labelledby="showInDashboard"
            >
              <span 
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  offerData.showInDashboard ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                <span 
                  className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out ${
                    offerData.showInDashboard ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
                  }`}
                  aria-hidden="true"
                >
                  <span className="text-gray-400 text-xs">✕</span>
                </span>
                <span 
                  className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-100 ease-in ${
                    offerData.showInDashboard ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
                  }`}
                  aria-hidden="true"
                >
                  <span className="text-green-500 text-xs">✓</span>
                </span>
              </span>
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-purple-900/30">
          <button
            type="submit"
            disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="font-semibold">جاري التحديث...</span>
                  <span className="animate-pulse">⏳</span>
              </div>
            ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <span className="text-xl">💾</span>
                  <span className="font-bold">تحديث العرض</span>
                  <span className="text-xl">✨</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-10 transition-opacity duration-75"></div>
          </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditOfferPage;