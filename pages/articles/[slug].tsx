import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Article } from '../../types';

const ArticleDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchArticle(slug);
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(progress);
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch article
      const response = await fetch(`/api/articles/${articleSlug}`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Article fetch error:', response.status, errorData);
        throw new Error(`Article not found (${response.status})`);
      }
      
      const articleData = await response.json();
      console.log('Article data:', articleData);
      setArticle(articleData);

      // Fetch related articles
      try {
        const relatedResponse = await fetch(`/api/articles?category=${articleData.category}&exclude=${articleData.id}&limit=4`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedArticles(Array.isArray(relatedData) ? relatedData : []);
        } else {
          console.error('Failed to fetch related articles:', relatedResponse.status);
          setRelatedArticles([]);
        }
      } catch (relatedErr) {
        console.error('Error fetching related articles:', relatedErr);
        setRelatedArticles([]);
      }

      // Track view
      try {
        await fetch(`/api/articles/${articleSlug}/view`, { method: 'POST' });
      } catch (viewErr) {
        console.error('Failed to track article view:', viewErr);
        // Non-critical error, continue without failing
      }
    } catch (err: any) {
      console.error('Failed to fetch article:', err);
      setError(err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const shareArticle = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';
    const description = article?.summary || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
      tiktok: `https://www.tiktok.com/`, // TikTok doesn't support direct URL sharing
      youtube: `https://www.youtube.com/`, // YouTube doesn't support direct URL sharing
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    };

    if (platform === 'instagram' || platform === 'tiktok' || platform === 'youtube') {
      // For platforms that don't support direct sharing, copy link and show message
      copyToClipboard();
      alert(`Link copied! You can now share it on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
      return;
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Enhanced content processing with better styling
  const processContent = (content: string) => {
    let processedContent = content
      .replace(/<h1>/g, '<h1 class="text-3xl md:text-4xl font-bold mb-6 mt-8 text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" dir="ltr">')
      .replace(/<h2>/g, '<h2 class="text-2xl md:text-3xl font-bold mb-4 mt-8 text-purple-300 border-b border-purple-500/30 pb-2" dir="ltr">')
      .replace(/<h3>/g, '<h3 class="text-xl md:text-2xl font-semibold mb-3 mt-6 text-purple-200" dir="ltr">')
      .replace(/<h4>/g, '<h4 class="text-lg md:text-xl font-semibold mb-3 mt-4 text-purple-200" dir="ltr">')
      .replace(/<h5>/g, '<h5 class="text-base md:text-lg font-semibold mb-2 mt-4 text-purple-200" dir="ltr">')
      .replace(/<h6>/g, '<h6 class="text-sm md:text-base font-semibold mb-2 mt-4 text-purple-200" dir="ltr">')
      .replace(/<p>/g, '<p class="mb-6 leading-relaxed text-gray-200 text-lg" dir="ltr">')
      .replace(/<ul>/g, '<ul class="list-disc list-inside mb-6 space-y-3 text-gray-200 pl-4" dir="ltr">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-6 space-y-3 text-gray-200 pl-4" dir="ltr">')
      .replace(/<li>/g, '<li class="mb-2 text-gray-200 leading-relaxed" dir="ltr">')
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-purple-500 pl-6 my-8 italic text-gray-300 bg-gradient-to-r from-purple-900/20 to-transparent py-6 rounded-r-lg text-lg" dir="ltr">')
      .replace(/<code>/g, '<code class="bg-gray-800 text-purple-300 px-3 py-1 rounded-md text-sm font-mono border border-gray-700">')
      .replace(/<pre>/g, '<pre class="bg-gray-900 text-gray-200 p-6 rounded-xl overflow-x-auto mb-6 border border-gray-700 shadow-lg" dir="ltr">')
      .replace(/<a /g, '<a class="text-purple-400 hover:text-purple-300 underline decoration-purple-400/50 underline-offset-4 transition-all duration-300 hover:decoration-purple-300" target="_blank" rel="noopener noreferrer" ')
      .replace(/<img /g, '<img class="rounded-xl shadow-2xl my-8 max-w-full h-auto border border-purple-500/20" ')
      .replace(/<strong>/g, '<strong class="text-white font-semibold">')
      .replace(/<em>/g, '<em class="text-purple-300">');
    
    return processedContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0B1F] via-[#1A1435] to-[#0F0B1F]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-500/20 border-t-blue-500 animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <div className="text-2xl font-bold text-white mb-2">Loading Article</div>
          <div className="text-gray-400">Please wait while we fetch the content...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0B1F] via-[#1A1435] to-[#0F0B1F]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-8xl mb-6 animate-bounce">📄</div>
          <div className="text-3xl font-bold mb-4 text-white">Article Not Found</div>
          <p className="text-gray-400 mb-8 text-lg leading-relaxed">
            {error || 'The article you\'re looking for doesn\'t exist or may have been moved.'}
          </p>
          <div className="space-y-4">
            <Link
              href="/articles"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Back to Articles
            </Link>
            <div>
              <Link
                href="/"
                className="text-purple-400 hover:text-purple-300 underline transition-colors"
              >
                Or go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "UnlockVault",
      "logo": {
        "@type": "ImageObject",
        "url": "https://unlockvault.xyz/logo.svg"
      }
    },
    "datePublished": article.createdAt,
    "dateModified": (article as any).lastModified || article.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://unlockvault.xyz/articles/${article.slug}`
    }
  };

  return (
    <>
      <Head>
        <title>{article.title} | UnlockVault - Premium Software & Tech Articles</title>
        <meta name="description" content={article.summary} />
        <meta name="keywords" content={`${article.tags.join(', ')}, UnlockVault, premium software, tech articles`} />
        <meta name="author" content={article.author} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={`https://unlockvault.xyz/articles/${article.slug}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:image" content={article.image} />
        <meta property="og:url" content={`https://unlockvault.xyz/articles/${article.slug}`} />
        <meta property="og:site_name" content="UnlockVault" />
        <meta property="article:author" content={article.author} />
        <meta property="article:published_time" content={article.createdAt} />
        <meta property="article:modified_time" content={(article as any).lastModified || article.createdAt} />
        <meta property="article:section" content={article.category} />
        {article.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.summary} />
        <meta name="twitter:image" content={article.image} />
        <meta name="twitter:creator" content="@UnlockVault" />
        <meta name="twitter:site" content="@UnlockVault" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Back Button */}
      <div className={`fixed top-6 left-6 z-40 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Link
          href="/articles"
          className="flex items-center gap-2 px-4 py-3 bg-black/80 backdrop-blur-sm text-white rounded-xl hover:bg-black/90 transition-all duration-300 shadow-lg border border-white/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </Link>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-[#0F0B1F] via-[#1A1435] to-[#0F0B1F] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400" dir="ltr">
            <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link href="/articles" className="hover:text-purple-400 transition-colors">Articles</Link>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-purple-400 truncate">{article.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-12">
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {article.category}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent" dir="ltr">
              {article.title}
            </h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-8" dir="ltr">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {article.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-medium">By {article.author}</div>
                  <div className="text-xs text-gray-500">Content Creator</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                  {formatDate(article.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  {article.views.toLocaleString()} views
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  {getReadingTime(article.content)} min read
                </span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 font-light" dir="ltr">
              {article.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8" dir="ltr">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-sm hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 cursor-default backdrop-blur-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <img
              src={article.image}
              alt={article.title}
              className="relative w-full h-64 md:h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl border border-purple-500/20 group-hover:border-purple-400/40 transition-all duration-300"
            />
          </div>

          {/* Social Share Bar */}
          <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share this article
            </h3>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {/* Facebook */}
              <button
                onClick={() => shareArticle('facebook')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs font-medium">Facebook</span>
              </button>

              {/* X (Twitter) */}
              <button
                onClick={() => shareArticle('x')}
                className="flex flex-col items-center gap-2 p-4 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs font-medium">X</span>
              </button>

              {/* Instagram */}
              <button
                onClick={() => shareArticle('instagram')}
                className="flex flex-col items-center gap-2 p-4 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-300 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-xs font-medium">Instagram</span>
              </button>

              {/* TikTok */}
              <button
                onClick={() => shareArticle('tiktok')}
                className="flex flex-col items-center gap-2 p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span className="text-xs font-medium">TikTok</span>
              </button>

              {/* YouTube */}
              <button
                onClick={() => shareArticle('youtube')}
                className="flex flex-col items-center gap-2 p-4 bg-red-700/20 hover:bg-red-700/30 border border-red-600/30 text-red-300 rounded-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-xs font-medium">YouTube</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 group border ${
                  copied 
                    ? 'bg-green-600/30 border-green-500/30 text-green-300' 
                    : 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30 text-purple-300'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Article Content */}
          <article className="mb-12">
            <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-purple-500/20">
              <div 
                className="prose prose-lg prose-invert max-w-none"
                dir="ltr"
                dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
              />
            </div>
          </article>

          {/* Call-to-Action Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-2xl p-8 text-center border border-purple-500/30 group hover:border-purple-400/50 transition-all duration-300">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💎</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Get Premium Access</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">Unlock exclusive content, premium tools, and advanced features to enhance your experience.</p>
              <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Upgrade Now
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl p-8 text-center border border-blue-500/30 group hover:border-blue-400/50 transition-all duration-300">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Explore Our Tools</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">Discover our comprehensive collection of premium software and development tools.</p>
              <Link 
                href="/tools" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Browse Tools
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Related Articles
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    href={`/articles/${relatedArticle.slug}`}
                    className="block bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105 group"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={relatedArticle.image}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="bg-purple-600/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                          {relatedArticle.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors text-white" dir="ltr">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3" dir="ltr">
                        {relatedArticle.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          {relatedArticle.views}
                        </span>
                        <span>{getReadingTime(relatedArticle.content)} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Articles
              <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetailPage; 