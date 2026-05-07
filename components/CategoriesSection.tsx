import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from './ToastProvider';

interface Category {
  name: string;
  icon: string;
  count: number;
  color: string;
  description: string;
  href: string;
}

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
  rating?: number;
}

const categoryMetadata: {
  [key: string]: {
    icon: string;
    color: string;
    description: string;
    basePath: 'tools' | 'apps' | 'games';
  };
} = {
  'Design & Graphics': { icon: '🎨', color: 'from-pink-500 to-rose-600', description: 'Creative tools for designers', basePath: 'tools' },
  'Video & Audio': { icon: '🎬', color: 'from-purple-500 to-violet-600', description: 'Professional media editing', basePath: 'tools' },
  'Productivity': { icon: '⚡', color: 'from-blue-500 to-cyan-600', description: 'Boost your workflow', basePath: 'tools' },
  'Development': { icon: '💻', color: 'from-green-500 to-emerald-600', description: 'Coding and development tools', basePath: 'tools' },
  'Gaming': { icon: '🎮', color: 'from-red-500 to-orange-600', description: 'Game hacks and mods', basePath: 'games' },
  'Business': { icon: '💼', color: 'from-indigo-500 to-blue-600', description: 'Professional business tools', basePath: 'tools' },
  'AI & Machine Learning': { icon: '🤖', color: 'from-yellow-500 to-amber-600', description: 'Artificial intelligence tools', basePath: 'tools' },
  'Security': { icon: '🛡️', color: 'from-gray-500 to-slate-600', description: 'Privacy and security tools', basePath: 'tools' },
  'default': { icon: '📦', color: 'from-gray-500 to-slate-600', description: 'Various tools and apps', basePath: 'tools' },
};

export default function CategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('categories-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/offers');
      const allOffers: Offer[] = await response.json();

      const categoryCounts = allOffers.reduce((acc, offer) => {
        const categoryName = offer.category || 'Other';
        const categoryType = offer.type;
        
        if (!acc[categoryName]) {
          acc[categoryName] = { count: 0, types: new Set() };
        }
        acc[categoryName].count++;
        acc[categoryName].types.add(categoryType);
        return acc;
      }, {} as { [key: string]: { count: number; types: Set<'tool' | 'app' | 'game'> } });

      const sortedCategoryNames = Object.keys(categoryCounts).sort();

      const categoriesToDisplay: Category[] = sortedCategoryNames.map(name => {
        const metadata = categoryMetadata[name] || categoryMetadata.default;
        const types = categoryCounts[name].types;

        let href = `/tools?category=${name.toLowerCase().replace(/\s+/g, '-')}`;
        if (types.has('game') && types.size === 1) {
          href = '/games';
        } else if (types.has('app') && types.size === 1) {
          href = '/apps';
        } else if (types.has('tool') && types.size === 1) {
          href = `/tools?category=${name.toLowerCase().replace(/\s+/g, '-')}`;
        } else if (metadata.basePath) {
          // Fallback to metadata's basePath if mixed types or specific path is defined
          href = `/${metadata.basePath}?category=${name.toLowerCase().replace(/\s+/g, '-')}`;
        }

        return {
          name: name,
          icon: metadata.icon,
          count: categoryCounts[name].count,
          color: metadata.color,
          description: metadata.description,
          href: href,
        };
      });

      setDynamicCategories(categoriesToDisplay);
      setLoading(false);

    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setLoading(false);
      addToast({
        type: 'error',
        title: 'Category Load Error',
        message: 'Could not load categories. Please try again.'
      });
    }
  };

  // Remove hardcoded categories array
  const categories = dynamicCategories;

  if (loading) {
    return (
      <section id="categories-section" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-indigo-900/10"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Categories...</h2>
          <p className="text-gray-400">Please wait while we fetch the latest categories.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="categories-section" className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-indigo-900/10"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-1000 ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
          }`}>
            Explore Categories
          </h2>
          <p className={`text-xl text-gray-300 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
          }`}>
            Discover premium tools and apps across different categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={category.href}
              className={`group relative block transition-all duration-700 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="relative h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {category.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                      {category.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-purple-400">📦</span>
                      <span className="text-lg font-semibold text-white">{category.count}</span>
                      <span className="text-sm text-gray-400">tools</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                      <span className="text-sm font-medium">Explore</span>
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl`}></div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500"></div>
              </div>

              {/* Floating Info Card */}
              {hoveredCategory === category.name && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-20 bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 shadow-2xl animate-fade-in-down">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-white font-semibold text-sm">{category.name}</div>
                    <div className="text-purple-400 text-xs">{category.count} premium tools</div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-500/30"></div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-800 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-block p-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl backdrop-blur-sm border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-300 mb-6">
              Browse our complete collection of premium tools and apps
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/scan-qr"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105"
              >
                Scan QR Code 📷
              </Link>
              <Link
                href="/apps"
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105"
              >
                Explore Apps 📱
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 