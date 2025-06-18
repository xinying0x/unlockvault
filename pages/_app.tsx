import '../styles/globals.css';
import '../styles/navbar.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../components/ToastProvider';
import { useToast } from '../components/ToastProvider';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';
import ErrorBoundary from '../components/ErrorBoundary';
import { logger } from '../lib/logger';

function MyApp({ Component, pageProps }: AppProps) {
  const [isVPN, setIsVPN] = useState(false);
  const [loadingVPN, setLoadingVPN] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  // Adblock detection logic
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  useEffect(() => {
    const detectAdBlock = async () => {
      const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      try {
        const response = await fetch(new Request(testUrl, { method: 'HEAD', mode: 'no-cors' }));
        // If response is not ok, or if it throws, it might be an adblocker
        // This is a heuristic, not foolproof
        if (!response.ok) {
          setAdBlockDetected(true);
        }
      } catch (e) {
        setAdBlockDetected(true);
      }
    };
    detectAdBlock();
  }, []);

  // Track visit logic
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adBlock: adBlockDetected }),
        });
        logger.debug('Visit tracked successfully');
      } catch (error) {
        logger.error('Error tracking visit', error);
      }
    };

    // Only track visit once per page load
    trackVisit();
  }, [adBlockDetected]); // Rerun if adBlockDetected status changes

  useEffect(() => {
    // Remove VPN check due to API blocking and for deployment readiness
    setLoadingVPN(false);
    setIsVPN(false);

    // Old checkVPN function (commented out/removed):
    // const checkVPN = async () => {
    //   try {
    //     const response = await fetch('https://ip-api.com/json');
    //     const data = await response.json();
    //     if (data.proxy === true || data.vpn === true || data.hosting === true) {
    //       setIsVPN(true);
    //       addToast({
    //         type: 'error',
    //         title: 'VPN/Proxy Detected',
    //         message: 'Please disable your VPN or proxy to access the site.'
    //       });
    //     } else {
    //       setIsVPN(false);
    //     }
    //   } catch (error) {
    //     console.error('VPN detection error:', error);
    //     // Fallback: assume no VPN if check fails
    //     setIsVPN(false);
    //   } finally {
    //     setLoadingVPN(false);
    //   }
    // };
    // checkVPN();
  }, []);

  // Redirect logic for VPN users
  useEffect(() => {
    if (!loadingVPN && isVPN && router.pathname !== '/vpn-blocked') {
      router.replace('/vpn-blocked');
    } else if (!loadingVPN && !isVPN && router.pathname === '/vpn-blocked') {
      router.replace('/');
    }
  }, [loadingVPN, isVPN, router]);

  // Loading state for page transitions
  useEffect(() => {
    const handleStart = (url: string) => {
      // إذا كان التوجيه إلى لوحة التحكم، لا تظهر حالة التحميل
      if (url.includes('/admin-xyz123/dashboard')) {
        return;
      }
      setLoading(true);
    };
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <DefaultSeo {...SEO} />
          <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E]">
            {/* Progress Bar */}
            <ProgressBar />
            
            {/* Show Navbar on all pages except VPN blocked and admin pages */}
            {router.pathname !== '/vpn-blocked' && !router.pathname.startsWith('/admin-xyz123') && (
              <div className="relative">
                <Navbar />
              </div>
            )}
            
            {/* Enhanced Loading Overlay - Don't show for admin dashboard */}
            {loading && !router.pathname.includes('/admin-xyz123/dashboard') && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8 text-white text-center shadow-2xl max-w-sm mx-4">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Loading...
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Please wait while we prepare your content</p>
                </div>
              </div>
            )}
            
            {/* Enhanced Scroll to Top Button */}
            {showScroll && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
                aria-label="Scroll to top"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            )}
            
            <Component {...pageProps} />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp; 