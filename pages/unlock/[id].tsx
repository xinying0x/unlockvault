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
  downloadUrl?: string;  // The actual ModYolo download link (revealed after unlock)
  link?: string; // Main Offer Link from dashboard
  views: number;
  unlocks: number;
  keywords: string[];
  addedAt: string;
  featured?: boolean;
  rating: number;
  version?: string;
  size?: string;
}

interface OGAdOffer {
  name: string;
  description: string;
  link: string;
  network?: string;
  icon?: string;
  ctype?: number;
  payout?: string;
  countries?: string[];
  platforms?: string[];
  os?: string[];
}

type UnlockStep = 'loading' | 'locked' | 'completing' | 'unlocked' | 'error';

const UnlockPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [adOffers, setAdOffers] = useState<OGAdOffer[]>([]);
  const [step, setStep] = useState<UnlockStep>('loading');
  const [selectedAdIndex, setSelectedAdIndex] = useState<number | null>(null);
  const [completedOffers, setCompletedOffers] = useState<Set<number>>(new Set());
  const [requiredCompleted, setRequiredCompleted] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);

  // Generate unique session ID for tracking
  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }, []);

  // Fetch the offer/app details
  const fetchOffer = useCallback(async (offerId: string) => {
    try {
      const res = await fetch(`/api/offers/${offerId}`);
      if (!res.ok) throw new Error('Offer not found');
      const data = await res.json();
      setOffer(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load offer');
      setStep('error');
    }
  }, []);

  // Fetch OGAds offers with session tracking
  const fetchAdOffers = useCallback(async (sid: string) => {
    setLoadingOffers(true);
    try {
      // ctype=15 requests all offer types: 1 (CPI) + 2 (CPA) + 4 (PIN) + 8 (VID)
      const res = await fetch(`/api/ogads/offers?max=6&ctype=15&aff_sub4=${sid}&aff_sub5=${id}`);
      const data = await res.json();
      if (data.success && data.offers && data.offers.length > 0) {
        setAdOffers(data.offers);
        setStep('locked');
      } else {
        // No offers available - fallback to direct unlock
        setStep('unlocked');
        setRequiredCompleted(true);
      }
    } catch {
      setStep('locked');
      setAdOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && typeof id === 'string' && sessionId) {
      fetchOffer(id).then(() => fetchAdOffers(sessionId));
    }
  }, [id, sessionId, fetchOffer, fetchAdOffers]);

  // Handle clicking an ad offer
  const handleOfferClick = (index: number, link: string) => {
    setSelectedAdIndex(index);
    window.open(link, '_blank', 'noopener,noreferrer');
    
    // Start polling the server for postback completion
    if (!isPolling) {
      setIsPolling(true);
    }
  };

  // Poll the postback status
  useEffect(() => {
    if (!isPolling || requiredCompleted) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ogads/status?session=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed') {
            clearInterval(pollInterval);
            setIsPolling(false);
            setRequiredCompleted(true);
            if (selectedAdIndex !== null) {
              setCompletedOffers(prev => new Set(prev).add(selectedAdIndex));
            }
          }
        }
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, sessionId, requiredCompleted, selectedAdIndex]);

  const handleClaimDownload = async () => {
    if (!requiredCompleted) return;
    setStep('completing');

    // Track the unlock
    try {
      await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'incrementUnlocks' }),
      });
    } catch {}

    setTimeout(() => setStep('unlocked'), 1200);
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'game': return '🎮';
      case 'app': return '📱';
      case 'tool': return '🔧';
      default: return '📦';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'game': return 'Game';
      case 'app': return 'App';
      case 'tool': return 'Tool';
      default: return 'Content';
    }
  };

  const getAdTypeLabel = (ctype?: number) => {
    if (!ctype) return 'Survey';
    if (ctype & 1) return 'Install App';
    if (ctype & 2) return 'Complete Task';
    if (ctype & 4) return 'Enter PIN';
    if (ctype & 8) return 'Watch Video';
    return 'Complete Offer';
  };

  const getAdTypeColor = (ctype?: number) => {
    if (!ctype) return 'from-blue-500 to-blue-700';
    if (ctype & 1) return 'from-green-500 to-emerald-700';
    if (ctype & 2) return 'from-purple-500 to-purple-700';
    if (ctype & 4) return 'from-yellow-500 to-orange-600';
    if (ctype & 8) return 'from-red-500 to-red-700';
    return 'from-blue-500 to-blue-700';
  };

  // LOADING STATE
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0D0B1E] via-[#1A0B33] to-[#0D0B1E] text-white">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/20 border-b-pink-500 rounded-full animate-spin animation-delay-300" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-400 text-lg animate-pulse">Loading content...</p>
      </div>
    );
  }

  // ERROR STATE
  if (step === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0D0B1E] via-[#1A0B33] to-[#0D0B1E] text-white px-4">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Content Not Found</h1>
        <p className="text-gray-400 mb-6 text-center">{errorMsg}</p>
        <Link href="/" className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  // UNLOCKED STATE
  if (step === 'unlocked') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0D0B1E] via-[#1A0B33] to-[#0D0B1E] text-white px-4">
        <Head>
          <title>{offer?.title ? `Download ${offer.title}` : 'Download'} | UnlockVault</title>
        </Head>

        <div className="max-w-lg w-full bg-[#1C1535]/80 rounded-3xl border border-green-500/30 p-8 text-center shadow-2xl shadow-green-500/10">
          {/* Success animation */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-green-500/40">
              🔓
            </div>
          </div>

          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Unlocked!
          </h1>
          <p className="text-gray-400 mb-6">
            Your download for <strong className="text-white">{offer?.title}</strong> is ready.
          </p>

          {/* Download button */}
          <a
            href={offer?.link || offer?.downloadUrl || `https://modyolo.com/${offer?.slug || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30 mb-4"
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">⬇️</span>
              Download Now
            </span>
          </a>

          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // LOCKED / COMPLETING STATE
  return (
    <>
      <Head>
        <title>
          {offer ? `Unlock ${offer.title} | UnlockVault` : 'Unlock Content | UnlockVault'}
        </title>
        <meta name="description" content={offer?.description || 'Complete an offer to unlock your download.'} />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0D0B1E] via-[#1A0B33] to-[#0D0B1E] text-white">
        {/* Header */}
        <div className="border-b border-purple-900/30 bg-[#0D0B1E]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🔓 UnlockVault
            </Link>
            <nav className="text-sm text-gray-400 hidden sm:flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              {offer && (
                <>
                  <Link href={`/${offer.type}s`} className="hover:text-white transition-colors capitalize">
                    {getTypeLabel(offer.type)}s
                  </Link>
                  <span>/</span>
                  <span className="text-white truncate max-w-[150px]">{offer.title}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* App Info Card */}
          {offer && (
            <div className="bg-[#1C1535]/60 rounded-2xl border border-purple-900/30 p-6 mb-8 flex gap-5 items-center backdrop-blur-sm">
              <div className="relative flex-shrink-0">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-700/50 shadow-lg shadow-purple-900/30"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-app.png'; }}
                />
                <span className="absolute -bottom-1 -right-1 text-lg">{getTypeIcon(offer.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl font-bold truncate">{offer.title}</h1>
                  {offer.featured && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{offer.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {offer.version && <span>v{offer.version}</span>}
                  {offer.size && <span>📦 {offer.size}</span>}
                  <span className="capitalize">{offer.category}</span>
                  <span>⬇️ {offer.unlocks?.toLocaleString() || 0} downloads</span>
                </div>
              </div>
            </div>
          )}

          {/* Lock Status Banner */}
          <div className="mb-8">
            {!requiredCompleted ? (
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">🔒</div>
                <h2 className="text-lg font-bold text-orange-300 mb-1">Content is Locked</h2>
                <p className="text-gray-400 text-sm">
                  Complete <strong className="text-white">1 offer</strong> below to unlock your free download.
                </p>
              </div>
            ) : step === 'completing' ? (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-5 text-center">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-blue-300 font-semibold">Unlocking your content...</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">✅</div>
                <h2 className="text-lg font-bold text-green-300 mb-3">Offer Completed!</h2>
                <button
                  onClick={handleClaimDownload}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
                >
                  🔓 Claim Your Download
                </button>
              </div>
            )}
          </div>

          {/* Offers Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-purple-600/50" />
              Complete an Offer to Unlock
              <span className="flex-1 h-px bg-purple-600/50" />
            </h3>

            {loadingOffers ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#1C1535]/50 rounded-2xl border border-purple-900/20 p-5 animate-pulse">
                    <div className="w-12 h-12 bg-purple-900/30 rounded-xl mb-3" />
                    <div className="h-4 bg-purple-900/30 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-purple-900/20 rounded mb-3 w-full" />
                    <div className="h-10 bg-purple-900/20 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : adOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adOffers.map((adOffer, index) => {
                  const isCompleted = completedOffers.has(index);
                  const isActive = selectedAdIndex === index && isPolling;

                  return (
                    <div
                      key={index}
                      className={`relative bg-[#1C1535]/60 rounded-2xl border transition-all duration-300 overflow-hidden group ${
                        isCompleted
                          ? 'border-green-500/50 bg-green-500/5'
                          : isActive
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-purple-900/30 hover:border-purple-600/50'
                      }`}
                    >
                      {/* Completed overlay */}
                      {isCompleted && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">
                            ✓ Done
                          </span>
                        </div>
                      )}

                      <div className="p-5">
                        {/* Icon / Type badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold mb-3 bg-gradient-to-r ${getAdTypeColor(adOffer.ctype)} text-white shadow-sm`}>
                          {adOffer.ctype && adOffer.ctype & 1 ? '📱' :
                           adOffer.ctype && adOffer.ctype & 8 ? '🎬' :
                           adOffer.ctype && adOffer.ctype & 4 ? '🔢' : '📋'}
                          {getAdTypeLabel(adOffer.ctype)}
                        </div>

                        <h4 className="font-bold text-white mb-1 line-clamp-1">
                          {adOffer.name}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {adOffer.description || 'Complete this offer to unlock your download.'}
                        </p>

                        {/* Countries */}
                        {adOffer.countries && adOffer.countries.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-3">
                            {adOffer.countries.slice(0, 4).map((c) => (
                              <span key={c} className="text-xs bg-purple-900/30 text-gray-400 px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                          </div>
                        )}

                        {/* CTA Button */}
                        <button
                          onClick={() => !isCompleted && handleOfferClick(index, adOffer.link)}
                          disabled={isCompleted || requiredCompleted}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all transform ${
                            isCompleted
                              ? 'bg-green-500/20 text-green-300 cursor-default'
                              : isActive
                              ? 'bg-yellow-500/20 text-yellow-300 cursor-wait'
                              : requiredCompleted
                              ? 'bg-gray-700/40 text-gray-500 cursor-default'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-900/30 group-hover:shadow-purple-600/20'
                          }`}
                        >
                          {isCompleted ? (
                            '✅ Completed'
                          ) : isActive ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                              Verifying...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span>🚀</span>
                              Start Offer
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // No offers fallback
              <div className="text-center py-12 bg-[#1C1535]/40 rounded-2xl border border-purple-900/20">
                <div className="text-5xl mb-4">😔</div>
                <p className="text-gray-400 mb-4">No offers available in your region right now.</p>
                <button
                  onClick={() => { setRequiredCompleted(true); }}
                  className="px-6 py-3 bg-purple-600/50 hover:bg-purple-600 text-white rounded-xl transition-colors font-semibold text-sm"
                >
                  Continue Anyway
                </button>
              </div>
            )}
          </div>

          {/* Info footer */}
          <p className="text-center text-gray-600 text-xs mt-8">
            By completing an offer, you support free access to this content. Offers are provided by third-party partners.
          </p>
        </div>
      </div>
    </>
  );
};

export default UnlockPage;
