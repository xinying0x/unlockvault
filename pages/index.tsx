import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import UnlockCard from '../components/UnlockCard';
import { initGA, trackPageView, trackTrafficSource } from '../lib/analytics';
import { advancedBotDetection } from '../lib/botProtection';

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
      }
      
      // Fetch articles
      const articlesResponse = await fetch('/api/articles?limit=4');
      if (articlesResponse.ok) {
        const articles = await articlesResponse.json();
        setLatestArticles(articles);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
      <SEOHead />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="relative z-10 text-center max-w-6xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <div className="inline-block p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-full mb-6 backdrop-blur-sm border border-purple-500/30">
                <span className="text-6xl animate-bounce">🔓</span>
              </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
                Unlock Premium Tools & Apps for Free
              </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover premium games, apps, tools, and exclusive content. Your gateway to unlimited possibilities.
              </p>
            </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/search"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="text-lg">🚀</span>
              <span className="text-lg">Start Exploring</span>
              <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-ping"></div>
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 border border-gray-600/50 hover:border-gray-500/50"
            >
              <span className="text-lg">📄</span>
              <span className="text-lg">Read Articles</span>
            </Link>
                </div>
              </div>
      </section>

      {/* Latest Games Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              🎮 Latest Games
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the newest and most exciting games added to our collection
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

      {/* Latest Apps Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              📱 Apps & Programs
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Essential applications and programs to boost your productivity
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Apps
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
                </Link>
          </div>
          </div>
        </section>

      {/* Latest Tools Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              🛠️ Professional Tools
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced tools and utilities for professionals and enthusiasts
            </p>
                </div>
          
          {latestTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {latestTools.map((tool) => (
                <UnlockCard 
                  key={tool.id} 
                  image={tool.image}
                  title={tool.title}
                  description={tool.description}
                  buttonText="Get Tool"
                  buttonHref={`/offers/${tool.slug}`}
                  views={tool.views}
                  unlocks={tool.unlocks}
                  category={tool.category}
                  featured={tool.featured}
                  rating={tool.rating}
                  offerSlug={tool.slug}
                  type={tool.type}
                  addedAt={tool.addedAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛠️</div>
              <p className="text-gray-400">No tools available at the moment</p>
            </div>
          )}
          
          <div className="text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Tools
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              📄 Latest Articles
              </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stay updated with the latest insights, tutorials, and tech news
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

      {/* Newsletter/CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl p-12 border border-purple-500/30 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Ready to Unlock Your Potential?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already discovered the power of premium tools and content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="text-lg">🔍</span>
                <span>Search & Discover</span>
              </Link>
              <Link
                href="/games"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 border border-gray-600/50"
              >
                <span className="text-lg">🎮</span>
                <span>Browse Games</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 