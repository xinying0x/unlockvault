import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SEOHead from '../components/SEOHead';

export default function Custom404() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoHome = () => {
    setIsRedirecting(true);
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center p-4">
      <SEOHead
        title="Page Not Found - UnlockVault"
        description="The page you're looking for doesn't exist. Discover premium tools and apps on UnlockVault."
        keywords={['404', 'page not found', 'error']}
        url="https://unlockvault.com/404"
      />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-bounce">
            404
          </div>
          <div className="text-2xl md:text-3xl text-gray-300 mt-4 animate-fade-in-up">
            🔍 Page Not Found
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 animate-fade-in-up delay-200">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Oops! This page went missing
          </h1>
          <p className="text-lg text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, we'll help you find what you need!
          </p>
        </div>

        {/* Auto-redirect Notice */}
        <div className="mb-8 p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl animate-fade-in-up delay-400">
          <p className="text-purple-300">
            {isRedirecting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                Redirecting to homepage...
              </span>
            ) : (
              <>Redirecting to homepage in <span className="font-bold text-purple-400">{countdown}</span> seconds</>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in-up delay-600">
          <button
            onClick={handleGoHome}
            disabled={isRedirecting}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🏠 Go to Homepage
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            ← Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up delay-800">
          <Link
            href="/search"
            className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔍</div>
            <h3 className="text-white font-semibold mb-1">Search Tools</h3>
            <p className="text-gray-400 text-sm">Find premium tools and apps</p>
          </Link>

          <Link
            href="/apps"
            className="p-4 bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl hover:border-green-400/50 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📱</div>
            <h3 className="text-white font-semibold mb-1">Browse Apps</h3>
            <p className="text-gray-400 text-sm">Discover premium applications</p>
          </Link>

          <Link
            href="/games"
            className="p-4 bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl hover:border-red-400/50 transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎮</div>
            <h3 className="text-white font-semibold mb-1">Browse Games</h3>
            <p className="text-gray-400 text-sm">Explore gaming content</p>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-gray-500 text-sm animate-fade-in-up delay-1000">
          <p>If you believe this is an error, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
} 