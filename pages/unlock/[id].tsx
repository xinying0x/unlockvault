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
  gallery?: string[] | string;
  features?: string[];
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
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [generatingShortlink, setGeneratingShortlink] = useState(false);
  const [unlockMethod, setUnlockMethod] = useState<'shortlink' | 'cpa'>('shortlink');

  // Generate unique session ID for tracking
  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }, []);

  // Check if returning from Shrtfly link
  useEffect(() => {
    if (router.query.verified === 'true') {
      setStep('unlocked');
      setRequiredCompleted(true);
    }
  }, [router.query.verified]);

  // Generate Shrtfly shortlink
  useEffect(() => {
    const generateShortlink = async () => {
      if (!id || typeof window === 'undefined') return;
      
      try {
        setGeneratingShortlink(true);
        // The URL we want them to return to after completing Shrtfly
        const returnUrl = `${window.location.origin}/unlock/${id}?verified=true`;
        
        const res = await fetch('/api/shrtfly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: returnUrl })
        });
        
        if (res.ok) {
          const data = await res.json();
          setShortUrl(data.shortUrl);
        }
      } catch (err) {
        console.error('Failed to generate shortlink:', err);
      } finally {
        setGeneratingShortlink(false);
      }
    };

    if (id && step !== 'unlocked' && !shortUrl) {
      generateShortlink();
    }
  }, [id, step, shortUrl]);

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
    if (!ctype) return 'Quick Task';
    if (ctype & 1) return 'Quick Install';
    if (ctype & 2) return 'Quick Task';
    if (ctype & 4) return 'Quick Verification';
    if (ctype & 8) return 'Quick Video';
    return 'Quick Task';
  };

  const getAdTypeColor = (ctype?: number) => {
    if (!ctype) return 'from-blue-500 to-blue-700';
    if (ctype & 1) return 'from-green-500 to-emerald-700';
    if (ctype & 2) return 'from-purple-500 to-purple-700';
    if (ctype & 4) return 'from-yellow-500 to-orange-600';
    if (ctype & 8) return 'from-red-500 to-red-700';
    return 'from-blue-500 to-blue-700';
  };

  const getOfferBackground = () => {
    if (!offer?.image) return undefined;
    return {
      backgroundImage: `linear-gradient(135deg, rgba(5, 4, 15, 0.92), rgba(24, 12, 46, 0.82)), url("${offer.image}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  };

  const offerDetails = [
    { label: 'Type', value: getTypeLabel(offer?.type) },
    { label: 'Category', value: offer?.category },
    { label: 'Rating', value: offer?.rating ? `${offer.rating}/5` : undefined },
    { label: 'Unlocks', value: offer?.unlocks !== undefined ? offer.unlocks.toLocaleString() : undefined },
    { label: 'Version', value: offer?.version },
    { label: 'Size', value: offer?.size },
  ].filter((item) => item.value);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0B1E] text-white px-4 py-10" style={getOfferBackground()}>
        <Head>
          <title>{offer?.title ? `Download ${offer.title}` : 'Download'} | UnlockVault</title>
        </Head>

        <div className="max-w-xl w-full bg-[#100C20]/85 backdrop-blur-xl rounded-3xl border border-green-400/30 p-6 sm:p-8 text-center shadow-2xl shadow-green-500/10">
          {offer && (
            <div className="mb-6 flex items-center gap-4 text-left">
              <img
                src={offer.image}
                alt={offer.title}
                className="h-20 w-20 rounded-2xl object-cover border border-white/15 shadow-lg"
              />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-green-300">Download ready</p>
                <h1 className="text-2xl font-black text-white truncate">{offer.title}</h1>
                <p className="text-sm text-gray-400 capitalize">{getTypeLabel(offer.type)} • {offer.category}</p>
              </div>
            </div>
          )}

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
            className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30 mb-3"
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">⬇️</span>
              Download Now
            </span>
          </a>

          {/* DirectLink Mirror button */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <a
            href="https://onionclose.com/byi5ype2a9?key=273b2aafb26c4332440b8d5a3677cfe3"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-semibold text-sm rounded-2xl transition-all mb-4"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🔗</span>
              Mirror Download (Alternative Link)
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
        <meta name="description" content={offer?.description || 'Complete a quick verification to unlock your download.'} />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-[#0D0B1E] text-white" style={getOfferBackground()}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_34%),linear-gradient(180deg,rgba(6,5,18,0.35),rgba(6,5,18,0.95))]">
        {/* Header */}
        <div className="border-b border-purple-900/30 bg-[#0D0B1E]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
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

        <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          {offer && (
            <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch mb-8">
              <div className="flex flex-col justify-center py-4">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-purple-100 backdrop-blur">
                  <span>{getTypeIcon(offer.type)}</span>
                  <span>{getTypeLabel(offer.type)} unlock page</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white">
                  Unlock {offer.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base sm:text-lg text-gray-200 leading-relaxed">
                  {offer.description}
                </p>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
                  {offerDetails.map((detail) => (
                    <div key={detail.label} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400">{detail.label}</p>
                      <p className="mt-1 text-sm font-bold text-white truncate">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-white/15 bg-black/30 shadow-2xl shadow-purple-950/30">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute left-5 right-5 bottom-5 rounded-2xl border border-white/10 bg-black/55 p-5 backdrop-blur-md">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 text-3xl ring-1 ring-white/15">
                      {getTypeIcon(offer.type)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-black text-white">{offer.title}</h2>
                      <p className="text-sm text-gray-300">Complete one quick verification to access your download.</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${requiredCompleted ? 'w-full bg-green-400' : selectedAdIndex !== null ? 'w-2/3 bg-blue-400' : 'w-1/3 bg-purple-400'} transition-all duration-700`} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-300">
                    <span>Locked</span>
                    <span>Verify</span>
                    <span>Download</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Lock Status Banner */}
          <div className="mb-8">
            {!requiredCompleted ? (
              <div className="bg-[#100C20]/80 border border-purple-400/25 rounded-3xl p-6 text-center shadow-2xl shadow-purple-950/20 backdrop-blur-xl">
                <svg className="w-12 h-12 text-purple-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h2 className="text-2xl font-black text-white mb-2">Your download is locked</h2>
                <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                  Choose one of the two methods below to unlock <strong className="text-white">{offer?.title || 'your content'}</strong>: the quick shortlink (recommended) or a free verification task.
                </p>
              </div>
            ) : step === 'completing' ? (
              <div className="bg-[#1C1535]/60 border border-blue-500/20 rounded-2xl p-6 text-center shadow-lg">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-blue-300 font-medium">Verifying your session...</p>
              </div>
            ) : (
              <div className="bg-[#1C1535]/60 border border-green-500/20 rounded-2xl p-6 text-center shadow-lg">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-4">Verification Successful</h2>
                <button
                  onClick={handleClaimDownload}
                  className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-all"
                >
                  Proceed to Download
                </button>
              </div>
            )}
          </div>

          {/* Method Selector - Two Options */}
          <section>
            <div className="text-center mb-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-2">
                Choose Your Unlock Method
              </h3>
              <p className="text-gray-500 text-xs">Pick whichever option works best for you</p>
            </div>

            {/* Tab Selector */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative grid grid-cols-2 gap-2 p-1.5 bg-[#100C20]/80 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl">
                <button
                  onClick={() => setUnlockMethod('shortlink')}
                  disabled={requiredCompleted}
                  className={`relative z-10 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    unlockMethod === 'shortlink'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-900/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span>Quick Shortlink</span>
                  </span>
                  <span className={`block text-[10px] font-normal mt-0.5 ${unlockMethod === 'shortlink' ? 'text-indigo-100' : 'text-gray-500'}`}>
                    Fastest · ~30 sec
                  </span>
                </button>
                <button
                  onClick={() => setUnlockMethod('cpa')}
                  disabled={requiredCompleted}
                  className={`relative z-10 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    unlockMethod === 'cpa'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">🎁</span>
                    <span>Quick Tasks</span>
                  </span>
                  <span className={`block text-[10px] font-normal mt-0.5 ${unlockMethod === 'cpa' ? 'text-pink-100' : 'text-gray-500'}`}>
                    {adOffers.length > 0 ? `${adOffers.length} available` : 'Quick &amp; easy'}
                  </span>
                </button>
              </div>
            </div>

            {/* Method 1: Shortlink */}
            {unlockMethod === 'shortlink' && (
              <div className="max-w-2xl mx-auto mb-8 animate-[fadeIn_0.3s_ease-out]">
                <div className={`relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-[#0F1B3A]/90 via-[#100C20]/90 to-[#0A1A2E]/90 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl ${requiredCompleted ? 'opacity-50 pointer-events-none' : ''}`}>
                  {/* Decorative glow */}
                  <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

                  <div className="relative z-10">
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-3xl shadow-lg shadow-indigo-900/50">
                        ⚡
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-300">
                            Recommended
                          </span>
                        </div>
                        <h4 className="text-2xl font-black text-white leading-tight">Quick Shortlink</h4>
                        <p className="text-sm text-gray-400">Fastest path to download</p>
                      </div>
                    </div>

                    {/* Steps */}
                    <ol className="mb-6 space-y-2.5 text-sm">
                      {[
                        { n: 1, t: 'Click "Visit Shortlink" below' },
                        { n: 2, t: 'Wait 5 seconds and tap "Skip Ad" / "Continue"' },
                        { n: 3, t: 'You\'ll be redirected back here automatically' },
                      ].map((s) => (
                        <li key={s.n} className="flex items-start gap-3 text-gray-200">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
                            {s.n}
                          </span>
                          <span>{s.t}</span>
                        </li>
                      ))}
                    </ol>

                    <a
                      href={shortUrl || '#'}
                      onClick={(e) => {
                        if (!shortUrl || requiredCompleted) e.preventDefault();
                      }}
                      className={`group flex w-full items-center justify-center gap-3 rounded-2xl py-4 px-6 font-bold text-base transition-all ${
                        generatingShortlink || !shortUrl
                          ? 'bg-white/5 text-gray-500 cursor-wait'
                          : requiredCompleted
                          ? 'bg-white/5 text-gray-500 cursor-default'
                          : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-xl shadow-indigo-950/40 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {generatingShortlink || !shortUrl ? (
                        <>
                          <span className="h-5 w-5 border-2 border-gray-500/30 border-t-gray-400 rounded-full animate-spin" />
                          Generating Secure Link...
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🔗</span>
                          Visit Shortlink &amp; Unlock
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </>
                      )}
                    </a>

                    <p className="mt-4 text-center text-xs text-gray-500">
                      🔒 Safe &amp; verified by Shrtfly · No registration required
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Method 2: Quick Tasks */}
            {unlockMethod === 'cpa' && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                {loadingOffers ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={`skeleton-${i}`} className="bg-[#1C1535]/50 rounded-2xl border border-purple-900/20 p-5 animate-pulse">
                        <div className="w-14 h-14 bg-purple-900/30 rounded-xl mb-3" />
                        <div className="h-4 bg-purple-900/30 rounded mb-2 w-3/4" />
                        <div className="h-3 bg-purple-900/20 rounded mb-3 w-full" />
                        <div className="h-10 bg-purple-900/20 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : adOffers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {adOffers.map((adOffer, index) => {
                      const isCompleted = completedOffers.has(index);
                      const isActive = selectedAdIndex === index && isPolling;

                      return (
                        <div
                          key={`offer-${index}`}
                          className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 backdrop-blur-xl ${
                            isCompleted
                              ? 'border-green-500/40 bg-gradient-to-br from-green-950/40 to-[#100C20]/85 shadow-xl shadow-green-950/30'
                              : isActive
                              ? 'border-blue-500/40 bg-gradient-to-br from-blue-950/40 to-[#100C20]/85 shadow-xl shadow-blue-950/30'
                              : 'border-white/10 bg-gradient-to-br from-[#1A1233]/85 to-[#100C20]/85 shadow-xl hover:border-purple-400/30 hover:shadow-purple-950/40 hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Top accent bar */}
                          <div className={`h-1 w-full bg-gradient-to-r ${
                            isCompleted ? 'from-green-500 to-emerald-500' :
                            isActive ? 'from-blue-500 to-cyan-500' :
                            getAdTypeColor(adOffer.ctype)
                          }`} />

                          {/* Status badge */}
                          {(isCompleted || isActive) && (
                            <div className="absolute top-4 right-4 z-10">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                isCompleted
                                  ? 'bg-green-500/20 text-green-300 ring-1 ring-green-400/30'
                                  : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30'
                              }`}>
                                {isCompleted ? '✓ Verified' : '⏳ Pending'}
                              </span>
                            </div>
                          )}

                          <div className="p-5 flex flex-col h-full">
                            {/* Header */}
                            <div className="mb-4 flex items-start gap-3">
                              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getAdTypeColor(adOffer.ctype)} text-white shadow-lg ring-1 ring-white/20 overflow-hidden`}>
                                {adOffer.icon ? (
                                  <img src={adOffer.icon} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-xl font-black">{index + 1}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-300 mb-0.5">
                                  {getAdTypeLabel(adOffer.ctype)}
                                </p>
                                <h4 className="font-black text-white leading-tight line-clamp-2 text-base">
                                  {adOffer.name}
                                </h4>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="flex-1 mb-4">
                              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                {adOffer.description || 'Follow the instructions in the new tab, then return here for verification.'}
                              </p>
                              {/* Payout/Network hidden for visitor privacy */}
                            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                                {adOffer.platforms?.slice(0, 2).map((platform) => (
                                  <span key={platform} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-gray-400">{platform}</span>
                                ))}
                              </div>
                            </div>

                            {/* CTA */}
                            <button
                              onClick={() => !isCompleted && handleOfferClick(index, adOffer.link)}
                              disabled={isCompleted || requiredCompleted}
                              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                                isCompleted
                                  ? 'bg-green-500/10 text-green-400 ring-1 ring-green-400/20 cursor-default'
                                  : isActive
                                  ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20 cursor-wait'
                                  : requiredCompleted
                                  ? 'bg-white/5 text-gray-500 cursor-default'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-950/40 group-hover:shadow-purple-900/50'
                              }`}
                            >
                              {isCompleted ? (
                                <span className="flex items-center justify-center gap-2">✓ Completed</span>
                              ) : isActive ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                  Verifying...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  Start Task
                                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto text-center py-10 px-6 bg-[#15102A]/80 rounded-3xl border border-white/10 backdrop-blur-xl">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-white font-bold mb-2">No verification tasks available right now</p>
                    <p className="text-gray-400 text-sm mb-5">No tasks are currently available in your region.</p>
                    <button
                      onClick={() => setUnlockMethod('shortlink')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/30"
                    >
                      <span>⚡</span>
                      Use Quick Shortlink instead
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Info footer */}
          <p className="text-center text-gray-600 text-xs mt-8">
            This verification step helps us provide high-quality content and protect against abuse.
          </p>
        </main>
        </div>
      </div>
    </>
  );
};

export default UnlockPage;
