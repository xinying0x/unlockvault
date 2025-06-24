import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/tools', label: 'Tools', icon: '🛠️' },
    { href: '/apps', label: 'Apps', icon: '📱' },
    { href: '/games', label: 'Games', icon: '🎮' },
    { href: '/articles', label: 'Articles', icon: '📄' },
    { href: '/search', label: 'Search', icon: '🔍' }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  // Prevent hydration mismatch by not rendering emojis until mounted
  if (!mounted) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <Link href="/" className="flex items-center space-x-3 group focus:outline-none">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg border border-purple-400/20">
                    <span className="text-xl sm:text-2xl">🔓</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                    UnlockVault
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block leading-tight">
                    Premium Tools
                  </span>
                </div>
              </Link>
              <div className="hidden lg:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-2 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
              <button className="lg:hidden relative w-10 h-10 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center">
                <div className="w-5 h-5 flex flex-col justify-center items-center">
                  <span className="w-4 h-0.5 bg-white"></span>
                  <span className="w-4 h-0.5 bg-white mt-1"></span>
                  <span className="w-4 h-0.5 bg-white mt-1"></span>
                </div>
              </button>
            </div>
          </div>
        </nav>
        <div className="h-16 sm:h-20"></div>
      </>
    );
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl' 
          : 'bg-slate-900/80 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - moved to left */}
            <Link href="/" className="flex items-center space-x-3 group focus:outline-none">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105 border border-purple-400/20">
                  <span className="text-xl sm:text-2xl">🔓</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                  UnlockVault
                </span>
                <span className="text-xs text-gray-400 hidden sm:block leading-tight">
                  Premium Tools
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - moved to right */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group focus:outline-none ${
                    isActiveLink(link.href)
                      ? 'text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                  {!isActiveLink(link.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden relative w-10 h-10 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/50 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-slate-700/50"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span className={`w-4 h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-0.5' : ''
                }`}></span>
                <span className={`w-4 h-0.5 bg-white transition-all duration-300 mt-1 ${
                  isOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`w-4 h-0.5 bg-white transition-all duration-300 mt-1 ${
                  isOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}>
          <div className="bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/50">
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 transform focus:outline-none ${
                    isActiveLink(link.href)
                      ? 'text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800/50 hover:scale-105'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: isOpen ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                </Link>
              ))}
              
              {/* Mobile CTA */}
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <Link
                  href="/search"
                  onClick={closeMenu}
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-center transform hover:scale-105 shadow-lg focus:outline-none group"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-lg">🚀</span>
                    <span className="text-base">Start Exploring</span>
                    <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-ping"></div>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20"></div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar; 