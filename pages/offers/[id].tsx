import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchOffer(id);
    }
  }, [id]);

  const fetchOffer = async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/offers/${offerId}`);
      if (response.ok) {
        const data = await response.json();
        setOffer({ ...data, lockerLinks: data.lockerLinks || {} });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Offer not found');
        setOffer(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch offer:', err);
      if (err instanceof TypeError) {
        console.error("This might be a network error or CORS issue.");
      } else if (err instanceof SyntaxError) {
        console.error("This is likely a JSON parsing error. Check the API response format.");
      }
      
      let errorMessage = 'Failed to load offer data. Please try again later.';
      if (err.message) {
        errorMessage += ` (Details: ${err.message})`;
      }
      setError(errorMessage);
      setOffer(null);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Check VPN/Country
  useEffect(() => {
    fetch('https://ip-api.com/json')
      .then((res) => res.json())
      .then((data) => {
        setCountryCode(data.countryCode?.toLowerCase() || 'us');
        setIsVpn(Boolean(data.proxy || data.hosting));
      })
      .catch(() => {
        setCountryCode('us');
      });
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const getCpaLink = () => {
    if (offer?.lockerLinks && Object.keys(offer.lockerLinks).length > 0) {
      const countryLink = offer.lockerLinks[countryCode.toUpperCase()];
      if (countryLink) return countryLink;
      
      const firstLink = Object.values(offer.lockerLinks)[0];
      return firstLink;
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
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <div className="text-2xl font-bold mb-2">Offer not found</div>
          <p className="text-gray-400">The offer you're looking for doesn't exist.</p>
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
      case 'game': return 'Get Hack';
      case 'app': return 'Download App 📱';
      case 'tool': return 'Unlock Tool 🛠️';
      default: return 'Unlock Now 🔓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
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
        <div className="bg-[#232046]/80 rounded-2xl shadow-2xl p-8 border border-purple-900/30">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full max-w-sm mx-auto rounded-xl shadow-lg border border-purple-900"
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
              <p className="text-gray-300 mb-6">{offer.description}</p>
              
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
                  ⭐ Featured Offer
                </span>
              )}

              {/* CPA Unlock Button */}
              {timer > 0 ? (
                <button
                  onClick={() => window.open(getCpaLink(), '_blank')}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-xl hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {getButtonText(offer.type)} ({formatTime(timer)})
                  <span className="ml-2 text-yellow-300"></span>
                </button>
              ) : (
                <button
                  onClick={() => window.open(getCpaLink(), '_blank')}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-xl hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {getButtonText(offer.type)}
                  <span className="ml-2 text-yellow-300">✅</span>
                </button>
              )}

              {/* VPN Warning */}
              {isVpn && (
                <div className="mt-4 p-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-sm text-center">
                  VPN/Proxy detected. Some offers may not be available.
                </div>
              )}
            </div>
          </div>

          {/* Gallery Section */}
          {offer.gallery && offer.gallery.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-purple-300 mb-6">Gallery</h2>
              <div className="relative w-full overflow-x-auto flex gap-6 pb-4 scrollbar-thin scrollbar-thumb-purple-700/50 scrollbar-track-transparent">
                {offer.gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Gallery image ${idx+1}`}
                    className="h-56 w-auto rounded-2xl shadow-lg border-2 border-purple-900/30 object-cover transition-transform duration-300 hover:scale-105 bg-gray-800 cursor-pointer"
                    onClick={() => { setGalleryIndex(idx); setGalleryModalOpen(true); }}
                  />
                ))}
              </div>
              {/* Modal/Slider */}
              {galleryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <button
                    className="absolute top-6 right-8 text-white text-3xl font-bold hover:text-purple-400 transition"
                    onClick={() => setGalleryModalOpen(false)}
                  >
                    ×
                  </button>
                  <button
                    className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-purple-400 transition px-2"
                    onClick={() => setGalleryIndex((galleryIndex - 1 + offer.gallery.length) % offer.gallery.length)}
                  >
                    ‹
                  </button>
                  <img
                    src={offer.gallery[galleryIndex]}
                    alt={`Gallery image ${galleryIndex+1}`}
                    className="max-h-[80vh] max-w-[90vw] rounded-2xl shadow-2xl border-4 border-purple-700/50 object-contain animate-fade-in"
                  />
                  <button
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-purple-400 transition px-2"
                    onClick={() => setGalleryIndex((galleryIndex + 1) % offer.gallery.length)}
                  >
                    ›
                  </button>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {offer.gallery.map((_, i) => (
                      <button
                        key={i}
                        className={`w-3 h-3 rounded-full ${i === galleryIndex ? 'bg-purple-500' : 'bg-gray-500/50'} border-2 border-white`}
                        onClick={() => setGalleryIndex(i)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;