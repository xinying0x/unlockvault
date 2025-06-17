import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import SearchBar from './SearchBar';

const navLinks = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/tools', label: 'Tools', icon: '🔧' },
  { href: '/apps', label: 'Apps', icon: '📱' },
  { href: '/games', label: 'Games', icon: '🎮' },
];

const NavbarImproved: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Hide admin links on login page
  const isAdminLoginPage = router.pathname.startsWith('/admin-xyz123/login');

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#18122B]/95 backdrop-blur-md border-b border-purple-900/50 shadow-lg' 
          : 'bg-[#18122B]/80 backdrop-blur-sm'
      }`}>
        {/* Container with responsive padding */}
        <div className="max-w-8xl mx-auto px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-12">
          {/* Main navbar content with responsive height */}
          <div className="flex items-center justify-between h-11 xs:h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 2xl:h-24 w-full">
            
            {/* Logo - Responsive sizing */}
            <div className="flex items-center flex-shrink-0 min-w-0">
              <Link href="/" className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 group">
                <span className="text-purple-400 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl group-hover:scale-110 transition-transform duration-200">
                  🔓
                </span>
                <span className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold tracking-tight group-hover:text-purple-300 transition-colors duration-200 truncate">
                  UnlockVault
                </span>
              </Link>
            </div>

            {/* Desktop Search - Center with responsive width */}
            <div className="hidden lg:flex flex-1 justify-center mx-2 lg:mx-4 xl:mx-6 2xl:mx-10 max-w-xs lg:max-w-sm xl:max-w-md 2xl:max-w-xl">
              <SearchBar placeholder="Search for tools, apps, games..." />
            </div>

            {/* Desktop Navigation - Responsive spacing */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 2xl:gap-6">
              {/* Navigation Links */}
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-base transition-all duration-200 whitespace-nowrap hover:scale-105 ${
                    router.pathname === link.href
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 z-10'
                      : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              {/* Admin Links */}
              {user && !isAdminLoginPage && (
                <>
                  <Link
                    href="/admin-xyz123/dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-base transition-all duration-200 whitespace-nowrap hover:scale-105 ${
                      router.pathname === '/admin-xyz123/dashboard'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 z-10'
                        : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                    }`}
                  >
                    <span className="text-lg">📊</span>
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-base transition-all duration-200 whitespace-nowrap hover:scale-105 ${
                      router.pathname === '/admin-xyz123/dashboard'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 z-10'
                        : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                    }`}
                  >
                    <span className="text-lg">🚪</span>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            {/* Tablet Navigation - Icon only */}
            <div className="hidden md:flex lg:hidden items-center space-x-1">
              {navLinks.slice(0, 4).reverse().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium transition-all duration-200 hover:scale-110 ${
                    router.pathname === link.href
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                      : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                  }`}
                  title={link.label}
                >
                  <span className="text-sm md:text-base">{link.icon}</span>
                </Link>
              ))}
              
              {/* Admin Links for Tablet */}
              {user && !isAdminLoginPage && (
                <>
                  <div className="w-px h-5 bg-purple-500/30 mx-1"></div>
                  <Link
                    href="/admin-xyz123/dashboard"
                    className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium transition-all duration-200 hover:scale-110 ${
                      router.pathname === '/admin-xyz123/dashboard'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                        : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                    }`}
                    title="Dashboard"
                  >
                    <span className="text-sm md:text-base">📊</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-red-600/20 transition-all duration-200 hover:scale-110"
                    title="Logout"
                  >
                    <span className="text-sm md:text-base">🚪</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Responsive sizing */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center transition-all duration-200 hover:bg-purple-600/30 hover:scale-110"
                aria-label="Toggle menu"
              >
                <div className="relative w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4">
                  <span className={`absolute block w-3 xs:w-3.5 sm:w-4 h-0.5 bg-white transition-all duration-300 ${
                    mobileMenuOpen ? 'rotate-45 top-1.5' : 'top-0.5'
                  }`}></span>
                  <span className={`absolute block w-3 xs:w-3.5 sm:w-4 h-0.5 bg-white transition-all duration-300 top-1.5 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`absolute block w-3 xs:w-3.5 sm:w-4 h-0.5 bg-white transition-all duration-300 ${
                    mobileMenuOpen ? '-rotate-45 top-1.5' : 'top-2.5'
                  }`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <div 
            ref={menuRef}
            className="fixed top-0 right-0 h-full w-56 xs:w-60 sm:w-64 max-w-[85vw] bg-gradient-to-b from-[#18122B] to-[#2D1B5A] shadow-2xl transform transition-transform duration-300 ease-out border-l border-purple-500/20"
          >
            {/* Mobile Menu Header */}
            <div className="p-2 xs:p-2.5 sm:p-3 border-b border-purple-900/30">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-1.5 group" onClick={() => setMobileMenuOpen(false)}>
                  <span className="text-purple-400 text-lg">🔓</span>
                  <span className="text-white text-sm font-bold tracking-tight group-hover:text-purple-300 transition-colors duration-200">
                    UnlockVault
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/20"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="p-2 xs:p-2.5 sm:p-3 border-b border-purple-900/30">
              <SearchBar placeholder="Search for tools, apps, games..." />
            </div>

            {/* Mobile Menu Links */}
            <div className="p-2 xs:p-2.5 sm:p-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    router.pathname === link.href
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              {/* Admin Links in Mobile Menu */}
              {user && !isAdminLoginPage && (
                <>
                  <div className="h-px bg-purple-900/30 my-2"></div>
                  <Link
                    href="/admin-xyz123/dashboard"
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      router.pathname === '/admin-xyz123/dashboard'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">📊</span>
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-red-600/20 text-left"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-2 xs:p-2.5 sm:p-3 border-t border-purple-900/30">
              <div className="text-center text-gray-400 text-xs">
                <p>© 2024 UnlockVault</p>
                <p className="mt-0.5">Unlock the world of digital entertainment</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarImproved; 