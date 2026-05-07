import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import SEOHead from '../components/SEOHead';
import UnlockCard from '../components/UnlockCard';
import AdBanner from '../components/AdBanner';
import { initGA, trackPageView, trackTrafficSource } from '../lib/analytics';
import { advancedBotDetection } from '../lib/botProtection';
import { getHomepageStructuredData } from '../lib/structuredData';

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
}

interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
}

const HomePage: React.FC = () => {
  const [latestGames, setLatestGames] = useState<Offer[]>([]);
  const [latestApps, setLatestApps] = useState<Offer[]>([]);
  const [latestTools, setLatestTools] = useState<Offer[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [totalOffers, setTotalOffers] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);

  // Initialize Analytics and Bot Protection
  useEffect(() => {
    initGA();
    trackPageView(window.location.href, 'UnlockVault - Premium Tools & Apps');
    trackTrafficSource();
    
    advancedBotDetection().then(result => {
      if (result.isBot) {
        console.warn('Bot detected:', result.reasons);
      }
    });

    // Back to top scroll listener
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch all content
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch offers
      const offersResponse = await fetch('/api/offers');
      if (offersResponse.ok) {
        const offers = await offersResponse.json();
        
        // Filter and sort by type and date
        const sortedOffers = offers.sort((a: Offer, b: Offer) => {
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        });
        
        const games = sortedOffers.filter((offer: Offer) => offer.type === 'game').slice(0, 6);
        const apps = sortedOffers.filter((offer: Offer) => offer.type === 'app').slice(0, 6);
        const tools = sortedOffers.filter((offer: Offer) => offer.type === 'tool').slice(0, 6);
        
        setLatestGames(games);
        setLatestApps(apps);
        setLatestTools(tools);
        setTotalOffers(offers.length);
      }
      
      // Fetch articles
      const articlesResponse = await fetch('/api/articles?limit=4');
      if (articlesResponse.ok) {
        const articles = await articlesResponse.json();
        const arr = Array.isArray(articles) ? articles : articles.articles || [];
        setLatestArticles(arr.slice(0, 4));
        setTotalArticles(arr.length);
      }
      
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading UnlockVault...</div>
        </div>
      </div>
    );
  }

  // Generate structured data
  const structuredDataList = getHomepageStructuredData();

  return (
    <>
      <Head>
        <title>UnlockVault - Premium Software, Games, Apps & Digital Tools | Unlock Vault</title>
        <meta name="description" content="UnlockVault - Discover and download premium software, games, applications, and digital tools for free. Unlock premium content with UnlockVault. Your trusted source for professional software, gaming, and productivity solutions." />
        <meta name="keywords" content="UnlockVault, unlock vault, unlockv, premium software, free games download, applications, digital tools, productivity software, development tools, creative software, gaming software, tech tools, software solutions, unlock premium, vault software, premium vault, unlock premium content, software vault, premium tools unlock, vault apps, unlock software free, premium unlock tools" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://unlockvault.xyz" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="UnlockVault - Premium Software & Digital Tools | Unlock Vault" />
        <meta property="og:description" content="UnlockVault - Discover premium software, games, applications, and digital tools. Get access to professional software, latest games, productivity apps, and development tools. Unlock premium content for free." />
        <meta property="og:url" content="https://unlockvault.xyz" />
        <meta property="og:site_name" content="UnlockVault" />
        <meta property="og:image" content="https://unlockvault.xyz/logo.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="UnlockVault - Premium Software & Digital Tools" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@UnlockVault" />
        <meta name="twitter:creator" content="@UnlockVault" />
        <meta name="twitter:title" content="UnlockVault - Premium Software & Digital Tools" />
        <meta name="twitter:description" content="Discover premium software, games, applications, and digital tools. Your gateway to unlimited possibilities." />
        <meta name="twitter:image" content="https://unlockvault.xyz/images/og-image.jpg" />
        
        {/* Structured Data */}
        {structuredDataList.map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <link rel="alternate" type="application/rss+xml" title="UnlockVault RSS Feed" href="https://unlockvault.xyz/rss.xml" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="relative z-10 text-center max-w-5xl mx-auto">

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-medium mb-8 tracking-wide">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              Free — No account required
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              Modded Apps &amp; Games,{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                unlocked.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Scan a QR code or browse our catalog to get premium apps, games, and tools — no subscription needed.
            </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/scan-qr"
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-900/30"
            >
              Scan a QR Code
            </Link>
            <Link
              href="/games"
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              Browse Games
            </Link>
            <Link
              href="/apps"
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              Browse Apps
            </Link>
          </div>

          {/* Live Stats Counter */}
          {totalOffers > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{totalOffers}+</div>
                <div className="text-xs text-gray-500 mt-1">Premium Offers</div>
              </div>
              <div className="w-px h-10 bg-white/10 self-center" />
              <div className="text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{totalArticles}+</div>
                <div className="text-xs text-gray-500 mt-1">Articles</div>
              </div>
              <div className="w-px h-10 bg-white/10 self-center" />
              <div className="text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">100%</div>
                <div className="text-xs text-gray-500 mt-1">Free</div>
              </div>
              <div className="w-px h-10 bg-white/10 self-center" />
              <div className="text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">⚡</div>
                <div className="text-xs text-gray-500 mt-1">Instant Unlock</div>
              </div>
            </div>
          )}
          </div>
        </section>

      {/* Latest Games Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Latest Games
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              New modded games added to the collection
            </p>
          </div>
          
          {latestGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {latestGames.map((game) => (
                <UnlockCard 
                  key={game.id} 
                  image={game.image}
                  title={game.title}
                  description={game.description}
                  buttonText="Get Game"
                  buttonHref={`/offers/${game.slug}`}
                  views={game.views}
                  unlocks={game.unlocks}
                  category={game.category}
                  featured={game.featured}
                  rating={game.rating}
                  offerSlug={game.slug}
                  type={game.type}
                  addedAt={game.addedAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-gray-400">No games available at the moment</p>
            </div>
          )}
          
          <div className="text-center">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Games
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Banner between Games and Apps */}
      <div className="max-w-4xl mx-auto px-4">
        <AdBanner position="inline" />
      </div>

      {/* Latest Apps Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Apps &amp; Programs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Premium apps unlocked, ready to install
            </p>
          </div>
          
          {latestApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {latestApps.map((app) => (
                <UnlockCard
                  key={app.id} 
                  image={app.image}
                  title={app.title}
                  description={app.description}
                  buttonText="Get App"
                  buttonHref={`/offers/${app.slug}`}
                  views={app.views}
                  unlocks={app.unlocks}
                  category={app.category}
                  featured={app.featured}
                  rating={app.rating}
                  offerSlug={app.slug}
                  type={app.type}
                  addedAt={app.addedAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-400">No apps available at the moment</p>
            </div>
          )}
            
          <div className="text-center">
            <Link
              href="/apps"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
            >
              View All Apps
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>


      {/* Latest Articles Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Latest Articles
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Guides, tutorials, and updates from the team
            </p>
          </div>
          
          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="block bg-[#232046]/60 rounded-2xl overflow-hidden border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                          </div>
                        </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors" dir="ltr">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4" dir="ltr">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.author}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        {article.views}
                      </span>
                    </div>
                  </div>
                </Link>
                ))}
              </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-400">No articles available at the moment</p>
                </div>
              )}
          
          <div className="text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Read All Articles
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none"
          aria-label="Back to top"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
    </>
  );
};

export default HomePage; 