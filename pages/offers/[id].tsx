import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Offer {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  lockerLinks: { [key: string]: string };
  link?: string; // Main offer link
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  rating: number;
  features?: string[]; // For games/tools that might have specific features
  status?: 'active' | 'inactive' | 'draft' | 'archived'; // Add status
  gallery?: string[];
}

const OfferDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [offer, setOffer] = useState<Offer | null>(null);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [countryCode, setCountryCode] = useState('us');
  const [isVpn, setIsVpn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchOffer(id);
    }
  }, [id]);

  const fetchOffer = async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('No data received');
      }

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

      setOffer({ ...data, lockerLinks: data.lockerLinks || {} });
    } catch (err: any) {
      console.error('Failed to fetch offer:', err);
      setError(err.message || 'Failed to load data. Please try again later.');
      setOffer(null);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced gallery navigation functions
  const nextImage = useCallback(() => {
    if (!offer?.gallery || !Array.isArray(offer.gallery) || offer.gallery.length === 0) return;
    setImageLoading(true);
    setGalleryIndex((prevIndex) => (prevIndex + 1) % offer.gallery!.length);
  }, [offer?.gallery]);

  const prevImage = useCallback(() => {
    if (!offer?.gallery || !Array.isArray(offer.gallery) || offer.gallery.length === 0) return;
    setImageLoading(true);
    setGalleryIndex((prevIndex) => (prevIndex - 1 + offer.gallery!.length) % offer.gallery!.length);
  }, [offer?.gallery]);

  const goToImage = useCallback((index: number) => {
    if (!offer?.gallery || !Array.isArray(offer.gallery) || offer.gallery.length === 0) return;
    setImageLoading(true);
    setGalleryIndex(index);
  }, [offer?.gallery]);

  // Touch/Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    
    const isLeftSwipe = deltaX > 50 && Math.abs(deltaY) < 100;
    const isRightSwipe = deltaX < -50 && Math.abs(deltaY) < 100;
    const isDownSwipe = deltaY < -100 && Math.abs(deltaX) < 100; // التمرير للأسفل

    if (isDownSwipe) {
      // إغلاق المعرض عند التمرير للأسفل
      setGalleryModalOpen(false);
    } else if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!galleryModalOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
      case 'Escape':
        e.preventDefault();
        setGalleryModalOpen(false);
        break;
      case ' ':
        e.preventDefault();
        nextImage();
        break;
    }
  }, [galleryModalOpen, prevImage, nextImage]);

  // Mouse wheel navigation
  const handleWheelNavigation = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // إذا كان التمرير للأسفل بقوة، أغلق المعرض
    if (e.deltaY > 100) {
      setGalleryModalOpen(false);
      return;
    }
    
    if (e.deltaY > 0) {
      nextImage();
    } else {
      prevImage();
    }
  };

  useEffect(() => {
    if (galleryModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setShowInstructions(true);
      
      // إخفاء التعليمات بعد 5 ثوانٍ
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 5000);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
        clearTimeout(timer);
      };
    }
  }, [galleryModalOpen, handleKeyDown]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Check VPN/Country
  useEffect(() => {
    const checkLocation = async () => {
      try {
        const response = await fetch('https://ipwho.is/?fields=country_code,security');
        const data = await response.json();
        setCountryCode(data.country_code?.toLowerCase() || 'us');
        setIsVpn(Boolean(data.security?.vpn));
      } catch (error) {
        console.error('Failed to fetch location:', error);
        setCountryCode('us');
      }
    };
    checkLocation();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const getCpaLink = () => {
    // First check for lockerLinks (country-specific)
    if (offer?.lockerLinks && Object.keys(offer.lockerLinks).length > 0) {
      const countryLink = offer.lockerLinks[countryCode.toUpperCase()];
      if (countryLink) return countryLink;
      
      const firstLink = Object.values(offer.lockerLinks)[0];
      return firstLink;
    }
    
    // Fallback to main link field
    if (offer?.link && offer.link.trim() !== '') {
      return offer.link;
    }
    
    return 'https://example.com/default-locker';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-2xl font-bold mb-2">Error</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <div className="text-2xl font-bold mb-2">Content not found</div>
          <p className="text-gray-400">The content you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const getButtonText = (type: string) => {
    switch (type) {
      case 'game': return 'Get Game';
      case 'app': return 'Get App';
      case 'tool': return 'Get Tool';
      default: return 'Get Content';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white relative">
      <Head>
        <title>{offer.title} | UnlockVault</title>
        <meta name="description" content={offer.description} />
        <meta name="keywords" content={offer.keywords.join(', ')} />
        <meta property="og:title" content={offer.title} />
        <meta property="og:description" content={offer.description} />
        <meta property="og:image" content={offer.image} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-end">
          
                     {/* Breadcrumb */}
           <nav className="hidden md:flex items-center gap-2 text-sm text-gray-400">
             <Link href="/" className="hover:text-white transition-colors">
               Home
             </Link>
             <span>/</span>
             <Link 
               href={`/${offer?.type === 'tool' ? 'tools' : offer?.type === 'app' ? 'apps' : 'games'}`} 
               className="hover:text-white transition-colors"
             >
               {offer?.type === 'tool' ? 'Tools' : offer?.type === 'app' ? 'Apps' : 'Games'}
             </Link>
             <span>/</span>
             <span className="text-white">{offer?.title}</span>
           </nav>
        </div>
        
        <div className="bg-[#232046]/80 rounded-2xl shadow-2xl p-8 border border-purple-900/30">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full max-w-sm mx-auto rounded-xl shadow-lg border border-purple-900 cursor-pointer transition-transform duration-300 hover:scale-105 mb-4"
                onClick={() => {
                  if (offer.gallery && Array.isArray(offer.gallery) && offer.gallery.length > 0) {
                    setGalleryIndex(0);
                    setGalleryModalOpen(true);
                  }
                }}
              />
              
              {/* Gallery Section - Enhanced */}
              {offer.gallery && Array.isArray(offer.gallery) && offer.gallery.length > 0 && (
                <div className="relative w-full overflow-x-auto flex gap-3 pb-2 scrollbar-thin scrollbar-thumb-purple-700/50 scrollbar-track-transparent">
                  {offer.gallery.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery image ${idx+1}`}
                      className="h-20 w-auto rounded-lg shadow-md border border-purple-900/50 object-cover transition-all duration-300 hover:scale-105 hover:border-purple-400 bg-gray-800 cursor-pointer flex-shrink-0"
                      onClick={() => { setGalleryIndex(idx); setGalleryModalOpen(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
              <p className="text-gray-300 mb-6">{offer.description}</p>
              
              {/* Publication Date */}
              {offer.addedAt && (
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                  <span>🕒</span>
                  <span>Published: {new Date(offer.addedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#18122B]/50 rounded-lg p-3 text-center border border-gray-700/50">
                  <div className="text-lg font-bold text-blue-400">{offer.views?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Views</div>
                </div>
                <div className="bg-[#18122B]/50 rounded-lg p-3 text-center border border-gray-700/50">
                  <div className="text-lg font-bold text-green-400">{offer.unlocks?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Downloads</div>
                </div>
                <div className="bg-[#18122B]/50 rounded-lg p-3 text-center border border-gray-700/50">
                  <div className="text-lg font-bold text-yellow-400">{offer.rating?.toFixed(1) || 'N/A'} / 5</div>
                  <div className="text-sm text-gray-400">Rating</div>
                </div>
                <div className="bg-[#18122B]/50 rounded-lg p-3 text-center border border-gray-700/50">
                  <div className="text-lg font-bold text-purple-400">{offer.category}</div>
                  <div className="text-sm text-gray-400">Category</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {offer.keywords.map((keyword) => (
                  <span key={keyword} className="bg-purple-700/50 text-white px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>

              {offer.featured && (
                <span className="inline-block bg-yellow-600/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-medium mb-6">
                  ⭐ Featured
                </span>
              )}

              {/* Unlock Button */}
              <Link
                href={`/unlock/${offer.slug}`}
                onClick={async () => {
                  // Track unlock event
                  try {
                    await fetch('/api/track-visit', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        offerId: offer.id,
                        action: 'unlock',
                        timestamp: new Date().toISOString(),
                      }),
                    });
                    
                    // Update local unlock count
                    setOffer(prev => prev ? { ...prev, unlocks: prev.unlocks + 1 } : null);
                  } catch (error) {
                    console.error('Failed to track unlock:', error);
                  }
                }}
                className="block w-full py-4 px-6 text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-xl">🔓</span>
                  <span>{getButtonText(offer.type)}</span>
                  <span className="text-xl animate-pulse">✨</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>

              {/* VPN Warning */}
              {isVpn && (
                <div className="mt-4 p-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-sm text-center">
                  VPN/Proxy detected. Some features may not be available.
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Modal/Gallery */}
          {galleryModalOpen && offer.gallery && Array.isArray(offer.gallery) && offer.gallery.length > 0 && (
            <div 
              className="fixed inset-0 z-50 bg-black/90 gallery-modal"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheelNavigation}
              onClick={() => setGalleryModalOpen(false)}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 rounded-full text-white text-2xl font-bold gallery-nav-btn flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryModalOpen(false);
                }}
                aria-label="Close Gallery"
              >
                ×
              </button>

              {/* Previous Button */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 rounded-full text-white text-2xl font-bold gallery-nav-btn flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Previous Image"
              >
                ‹
              </button>

              {/* Image Container */}
              <div className="flex items-center justify-center w-full h-full p-4">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              <img
                src={offer.gallery[galleryIndex]}
                  alt={`Gallery image ${galleryIndex + 1}`}
                  className="max-h-full max-w-full rounded-xl shadow-2xl border-2 border-purple-500/30 object-contain"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Next Button */}
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/50 rounded-full text-white text-2xl font-bold gallery-nav-btn flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next Image"
              >
                ›
              </button>

              {/* Image Counter */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm gallery-counter">
                {galleryIndex + 1} / {offer.gallery.length}
              </div>

              {/* Instructions for mobile */}
              {showInstructions && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-90 sm:hidden animate-pulse transition-opacity duration-500">
                  👇 Swipe down to close
                </div>
              )}

              {/* Instructions for desktop */}
              {showInstructions && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-90 hidden sm:block animate-pulse transition-opacity duration-500">
                  🖱️ Click outside or scroll down to close
                </div>
              )}

              {/* Thumbnail Navigation */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-lg overflow-x-auto px-4 py-2 bg-black/30 rounded-full backdrop-blur-sm">
                {offer.gallery.map((img, i) => (
                  <button
                    key={i}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 gallery-thumbnail ${
                      i === galleryIndex 
                        ? 'border-purple-400 active' 
                        : 'border-gray-500/50 hover:border-purple-300'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(i);
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Back Button */}
      
    </div>
  );
};

export default OfferDetailPage;