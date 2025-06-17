import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';

interface OfferData {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  keywords: string[];
  lockerLinks: { [key: string]: string };
  featured: boolean;
  rating: number;
  customCategory: string;
  status: 'active' | 'draft' | 'archived';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      setOfferData({ ...data, lockerLinks: JSON.parse(data.lockerLinks || '{}') });
      // Add any custom categories from the fetched offer to the categories list
      if (data.category && !categories.includes(data.category)) {
        setCategories(prev => [...prev, data.category]);
      }
    } catch (error: any) {
      setMessage(`Failed to load offer: ${error.message}`);
      setMessageType('error');
    }
  };

  // Sidebar Navigation Items
  const sidebarItems = [
    { name: 'Dashboard', icon: '📊', href: '/admin-xyz123/dashboard' },
    { name: 'Add New Offer', icon: '➕', href: '/admin-xyz123/new' },
    { name: 'Manage Offers', icon: '📝', href: '/admin-xyz123/manage', active: true },
    { name: 'Security', icon: '🛡️', href: '/admin-xyz123/security' },
    { name: 'View Site', icon: '🌐', href: '/', external: true }
  ];

  const lockerServices = [
    { name: 'LinkVertise', key: 'linkvertise' },
    { name: 'Shorte.st', key: 'shortest' },
    { name: 'AdFly', key: 'adfly' },
    { name: 'Ouo.io', key: 'ouo' },
    { name: 'Fc.lc', key: 'fclc' }
  ];

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

  const handleLockerLinkChange = (service: string, url: string) => {
    setOfferData(prev => prev ? {
      ...prev,
      lockerLinks: {
        ...prev.lockerLinks,
        [service]: url
      }
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
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-2xl transition-all duration-200 hover:scale-110 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-600'
            }`}
          >
            ⭐
          </button>
        ))}
        <span className="ml-2 text-gray-300 text-sm">({rating}/5)</span>
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

    if (Object.keys(offerData.lockerLinks).length === 0) {
      setMessage('Please add at least one locker link');
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
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-purple-500/30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-2xl">🔓</span>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            item.external ? (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-purple-600/20 transition-all duration-300"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
                <span className="ml-auto text-xs">↗</span>
              </a>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  item.active
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-purple-500/30 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-xl">🔓</span>
            <span className="text-lg font-bold text-white">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Edit Offer: {offerData.title}</h1>

            {message && (
              <div className={`mb-6 p-4 rounded-xl ${messageType === 'success' ? 'bg-green-600/20 border border-green-500/30 text-green-300' : 'bg-red-600/20 border border-red-500/30 text-red-300'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-[#2D1B5A]/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-900/30">
              {/* Basic Info */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-purple-300">تفاصيل العرض الأساسية</h2>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">العنوان</label>
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">الوصف</label>
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
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">رابط الصورة</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">النوع</label>
                  <select
                    id="type"
                    value={offerData.type}
                    onChange={(e) => setOfferData(prev => prev ? { ...prev, type: e.target.value as 'tool' | 'app' | 'game' } : null)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="tool">أداة</option>
                    <option value="app">تطبيق</option>
                    <option value="game">لعبة</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">الحالة</label>
                  <select
                    id="status"
                    value={offerData.status}
                    onChange={(e) => setOfferData(prev => prev ? { ...prev, status: e.target.value as 'active' | 'draft' | 'archived' } : null)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="active">نشط</option>
                    <option value="draft">مسودة</option>
                    <option value="archived">أرشفة</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">الفئة</label>
                <select
                  id="category"
                  value={offerData.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'custom') {
                      setShowCustomCategory(true);
                      setOfferData(prev => prev ? { ...prev, category: '' } : null);
                    } else {
                      setShowCustomCategory(false);
                      setOfferData(prev => prev ? { ...prev, category: value } : null);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">اختر فئة</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="custom">+ إضافة فئة مخصصة</option>
                </select>
                {showCustomCategory && (
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      value={offerData.customCategory}
                      onChange={(e) => setOfferData(prev => prev ? { ...prev, customCategory: e.target.value } : null)}
                      placeholder="أدخل فئة مخصصة جديدة"
                      className="flex-1 px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                    >
                      إضافة
                    </button>
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-purple-300">الكلمات المفتاحية</h2>
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
                    placeholder="أدخل كلمة مفتاحية واضغط Enter"
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    إضافة
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

              {/* Locker Links */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-purple-300">روابط القفل</h2>
                <p className="text-gray-400 text-sm mb-4">أدخل الروابط لكل خدمة قفل. يجب أن يكون هناك رابط واحد على الأقل.</p>
                {lockerServices.map(service => (
                  <div key={service.key} className="mb-4">
                    <label htmlFor={service.key} className="block text-sm font-medium text-gray-300 mb-2">
                      {service.name} Link
                    </label>
                    <input
                      type="url"
                      id={service.key}
                      value={offerData.lockerLinks[service.key] || ''}
                      onChange={(e) => handleLockerLinkChange(service.key, e.target.value)}
                      placeholder={`أدخل رابط ${service.name}`}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-purple-900/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Featured & Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={offerData.featured}
                    onChange={(e) => setOfferData(prev => prev ? { ...prev, featured: e.target.checked } : null)}
                    className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-purple-900 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-300">عرض مميز</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">التقييم</label>
                  {renderStars(offerData.rating, (newRating) => setOfferData(prev => prev ? { ...prev, rating: newRating } : null))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#18122B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري التحديث...
                  </div>
                ) : (
                  'تحديث العرض'
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditOfferPage; 