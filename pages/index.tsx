import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import CategoriesSection from '../components/CategoriesSection';
import SEOHead from '../components/SEOHead';
import UnlockCard from '../components/UnlockCard';
import EnhancedButton from '../components/EnhancedButton';
import CountdownTimer from '../components/CountdownTimer';
import LazyImage from '../components/LazyImage';
import SecurityIndicators from '../components/SecurityIndicators';
import Image from 'next/image';
import { initGA, trackPageView, trackTrafficSource, trackHumanActivity } from '../lib/analytics';
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

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  createdAt: string;
  status: 'active' | 'pending' | 'rejected';
}

interface CounterProps {
  end: number;
  duration: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, duration, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div ref={counterRef} className="text-3xl md:text-4xl font-bold">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

const HomePage: React.FC = () => {
  const toolsRef = useRef<HTMLDivElement>(null);
  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    totalUnlocks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [useDummyStats, setUseDummyStats] = useState(false);
  const [botDetected, setBotDetected] = useState(false);
  const [countdownTime, setCountdownTime] = useState(3600); // 1 hour special offer

  const handleScrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize Analytics and Bot Protection
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
    trackPageView(window.location.href, 'UnlockVault - Premium Tools & Apps');
    trackTrafficSource();
    
    // Initialize Human Activity Tracking
    trackHumanActivity();
    
    // Advanced Bot Detection
    advancedBotDetection().then(result => {
      setBotDetected(result.isBot);
      if (result.isBot) {
        console.warn('Bot detected:', result.reasons);
      }
    });
  }, []);

  // Fetch featured offers and stats from API
  useEffect(() => {
    fetchFeaturedOffers();
    fetchSettingsAndStats();
    fetchTestimonials();
  }, []);

  // Testimonials carousel
  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  const fetchSettingsAndStats = async () => {
    try {
      const settingsResponse = await fetch('/api/admin/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setUseDummyStats(settingsData.useDummyStats);
        
        if (settingsData.useDummyStats) {
          // Use dummy stats
          setStats({
            totalViews: 1500000 + Math.floor(Math.random() * 100000), // Example dummy data
            uniqueVisitors: 250000 + Math.floor(Math.random() * 50000),
            totalUnlocks: 800000 + Math.floor(Math.random() * 50000),
          });
          // For featured offers length for Premium Tools stat
          // We will fetch featured offers as usual, but just for count
        } else {
          // Fetch real stats
          const statsResponse = await fetch('/api/stats');
          const statsData = await statsResponse.json();
          setStats({
            totalViews: statsData.totalViews,
            uniqueVisitors: statsData.totalVisitors || statsData.uniqueIPs || statsData.uniqueVisitors,
            totalUnlocks: statsData.totalUnlocks,
          });
        }
      } else {
        console.error('Failed to fetch settings:', await settingsResponse.json());
        // Fallback to real stats if settings cannot be fetched
        fetchStats();
      }
    } catch (error) {
      console.error("Error fetching settings or stats:", error);
      // Fallback to real stats if an error occurs
      fetchStats();
    } finally {
      setLoading(false); // Set loading to false after stats are determined
    }
  };

  // Keep fetchStats for fallback or direct use if needed elsewhere
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats({
        totalViews: data.totalViews,
        uniqueVisitors: data.totalVisitors || data.uniqueIPs || data.uniqueVisitors,
        totalUnlocks: data.totalUnlocks,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchFeaturedOffers = async () => {
    try {
      const response = await fetch('/api/offers');
      const data = await response.json();
      
      // Filter only featured offers
      const featured = data.filter((offer: Offer) => offer.featured === true);
      
      // Sort by newest first
      const sorted = featured.sort((a: Offer, b: Offer) => {
        const dateA = new Date(a.addedAt || '2024-01-01').getTime();
        const dateB = new Date(b.addedAt || '2024-01-01').getTime();
        return dateB - dateA;
      });
      
      setFeaturedOffers(sorted);
      // setLoading(false); // Moved to fetchSettingsAndStats
    } catch (error) {
      setFeaturedOffers([]);
      // setLoading(false); // Moved to fetchSettingsAndStats
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials'); // Public API for active testimonials
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      } else {
        console.error('Failed to fetch testimonials:', await response.json());
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    }
  };

  const features = [
    {
      icon: "🛡️",
      title: "100% Secure",
      description: "All tools are tested and verified for safety",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: "⚡",
      title: "Instant Access",
      description: "Get your unlocked tools in seconds",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: "🔄",
      title: "Regular Updates",
      description: "New content added daily",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: "💎",
      title: "Premium Quality",
      description: "Only the best and latest releases",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  return (
    <div className="relative bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white flex flex-col min-h-screen">
      <SEOHead
        title="UnlockVault - Free Premium Tools & Apps"
        description="Access premium tools, cracked apps, game hacks, and AI tools for free. Join thousands of users unlocking their potential with UnlockVault."
        keywords={['premium tools', 'cracked apps', 'game hacks', 'AI tools', 'free software', 'unlock vault']}
        url="https://unlockvault.xyz"
      />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="relative z-10 text-center max-w-6xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <div className="inline-block p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-full mb-6 backdrop-blur-sm border border-purple-500/30">
                <span className="text-6xl animate-bounce">🔓</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-tight animate-fade-in-up">
                Unlock Premium Tools & Apps for Free
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                Get cracked apps, game hacks, and AI tools without any cost. Join thousands of users unlocking their potential.
              </p>
            </div>

            {/* Stats Section */}
            <div className="w-full max-w-4xl mx-auto mb-12 animate-fade-in-up delay-400">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                <div className="text-center p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl backdrop-blur-sm border border-purple-500/30 hover:scale-105 transition-transform duration-300 min-w-0">
                  <div className="break-words text-2xl sm:text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={Number.isFinite(stats.uniqueVisitors) ? stats.uniqueVisitors : 1} duration={2000} suffix="+" />
                  </div>
                  <div className="text-sm text-gray-400 mt-2 whitespace-normal break-words">Active Users</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 rounded-2xl backdrop-blur-sm border border-indigo-500/30 hover:scale-105 transition-transform duration-300 min-w-0">
                  <div className="break-words text-2xl sm:text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={featuredOffers.length} duration={2000} suffix="+" />
                  </div>
                  <div className="text-sm text-gray-400 mt-2 whitespace-normal break-words">Premium Tools</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-2xl backdrop-blur-sm border border-pink-500/30 hover:scale-105 transition-transform duration-300 min-w-0">
                  <div className="break-words text-2xl sm:text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={stats.totalUnlocks} duration={2000} suffix="+" />
                  </div>
                  <div className="text-sm text-gray-400 mt-2 whitespace-normal break-words">Downloads</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-600">
              <EnhancedButton
                href="/search"
                type="primary"
                size="lg"
                glowEffect={true}
                pulseEffect={false}
                icon={<span>🚀</span>}
                className="animate-fade-in-up delay-700"
              >
                Start Exploring
              </EnhancedButton>
              <EnhancedButton
                href="#tools"
                type="secondary"
                size="lg"
                glowEffect={true}
                icon={<span>💡</span>}
                onClick={handleScrollToTools}
                className="animate-fade-in-up delay-800"
              >
                How It Works
              </EnhancedButton>
            </div>
          </div>
        </section>

        {/* Featured Offers Section */}
        <section ref={toolsRef} className="py-20 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🌟 Featured Premium Tools
            </h2>
            {loading ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-gray-400">Loading awesome tools...</p>
              </div>
            ) : featuredOffers.length === 0 ? (
              <p className="text-center text-gray-400 text-lg">No featured offers found at the moment. Check back soon!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredOffers.map((offer, index) => (
                  <div
                    key={offer.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <UnlockCard
                      title={offer.title}
                      description={offer.description}
                      image={offer.image}
                      category={offer.category}
                      type={offer.type}
                      rating={offer.rating}
                      buttonText={offer.type === 'tool' ? 'Unlock Tool' : offer.type === 'app' ? 'Download App' : 'Download Game'}
                      buttonHref={`/offers/${offer.slug}`}
                      offerSlug={offer.slug}
                      views={offer.views}
                      unlocks={offer.unlocks}
                      featured={true}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {featuredOffers.length > 0 && (
              <div className="text-center mt-12">
                <Link 
                  href="/search"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                >
                  <span>View All Tools</span>
                  <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Special Offer Countdown */}
        <section className="py-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <CountdownTimer
              duration={countdownTime}
              title="🎯 Special Access Pass - Limited Time!"
              subtitle="Unlock premium tools with exclusive access"
              type="offer"
              size="lg"
              glowEffect={true}
              pulseOnLowTime={true}
              onComplete={() => setCountdownTime(7200)} // Reset to 2 hours
              className="mx-auto"
            />
          </div>
        </section>

        {/* Security & Trust Section */}
        <section className="py-16 px-4 relative z-10 bg-gradient-to-br from-gray-900/30 to-purple-900/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              🛡️ Your Security is Our Priority
            </h2>
            <SecurityIndicators 
              showSSL={true}
              showTrustBadges={true}
              className="max-w-3xl mx-auto"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Why Choose UnlockVault?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#2D1B5A]/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg text-center border border-purple-900/30 hover:scale-105 transition-transform duration-300 transform-gpu animate-fade-in-up"
                  style={{ animationDelay: `${index * 100 + 1000}ms` }}
                >
                  <div className={`text-5xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="py-20 px-4 relative z-10 bg-gradient-to-br from-[#18122B] via-[#2D1B5A]/50 to-[#1A1A2E]">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-extrabold mb-12 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                What Our Users Say
              </h2>
              <div className="relative min-h-[250px]">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentTestimonialIndex ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <div className="bg-[#2D1B5A]/50 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-purple-900/30 mx-4 md:mx-0">
                      <p className="text-xl md:text-2xl text-gray-300 italic mb-6">"{testimonial.text}"</p>
                      <div className="flex items-center justify-center mb-4">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={64}
                          height={64}
                          className="rounded-full mr-4 object-cover border-2 border-purple-500 flex-shrink-0 block"
                        />
                        <div>
                          <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                          <div className="flex justify-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {testimonials.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center mt-4">
                  {testimonials.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 w-2 mx-1 rounded-full cursor-pointer transition-colors ${
                        index === currentTestimonialIndex ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                      onClick={() => setCurrentTestimonialIndex(index)}
                    ></span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-purple-900/30 py-8 px-4 text-center text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto">
          <p>&copy; {new Date().getFullYear()} UnlockVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 