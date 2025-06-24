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

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      fetchArticle(slug);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch article
      const response = await fetch(`/api/articles/${articleSlug}`);
      if (!response.ok) {
        throw new Error('Article not found');
      }
      const articleData = await response.json();
      setArticle(articleData);

      // Fetch related articles
      const relatedResponse = await fetch(`/api/articles?category=${articleData.category}&exclude=${articleData.id}&limit=3`);
      const relatedData = await relatedResponse.json();
      setRelatedArticles(relatedData);

      // Track view
      await fetch(`/api/articles/${articleSlug}/view`, { method: 'POST' });
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

  const shareArticle = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Enhanced content processing to handle custom links and styling
  const processContent = (content: string) => {
    // Add LTR direction and enhanced styling
    let processedContent = content
      .replace(/<h([1-6])>/g, '<h$1 class="text-2xl md:text-3xl font-bold mb-4 mt-8 text-purple-300" dir="ltr">')
      .replace(/<h([1-6]) /g, '<h$1 class="text-2xl md:text-3xl font-bold mb-4 mt-8 text-purple-300" dir="ltr" ')
      .replace(/<p>/g, '<p class="mb-4 leading-relaxed text-gray-200" dir="ltr">')
      .replace(/<p /g, '<p class="mb-4 leading-relaxed text-gray-200" dir="ltr" ')
      .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2 text-gray-200" dir="ltr">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2 text-gray-200" dir="ltr">')
      .replace(/<li>/g, '<li class="mb-2 text-gray-200" dir="ltr">')
      .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-purple-500 pl-6 my-6 italic text-gray-300 bg-purple-900/20 py-4 rounded-r-lg" dir="ltr">')
      .replace(/<code>/g, '<code class="bg-gray-800 text-purple-300 px-2 py-1 rounded text-sm font-mono">')
      .replace(/<pre>/g, '<pre class="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-700" dir="ltr">')
      .replace(/<a /g, '<a class="text-purple-400 hover:text-purple-300 underline transition-colors" target="_blank" rel="noopener noreferrer" ')
      .replace(/<img /g, '<img class="rounded-lg shadow-lg my-6 max-w-full h-auto" ');
    
    return processedContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <div className="text-xl font-semibold">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-2xl font-bold mb-2">Article Not Found</div>
          <p className="text-gray-400 mb-6">{error || 'The article you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/articles"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] text-white">
      <Head>
        <title>{article.title} | UnlockVault</title>
        <meta name="description" content={article.summary} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:image" content={article.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400" dir="ltr">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-white transition-colors">Articles</Link>
          <span>/</span>
          <span className="text-white truncate">{article.title}</span>
        </nav>

        {/* Article Header */}
        <div className="mb-8">
          <div className="mb-4">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {article.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" dir="ltr">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6" dir="ltr">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              By {article.author}
            </span>
            <span>•</span>
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
          </div>

          <p className="text-xl text-gray-300 leading-relaxed mb-8" dir="ltr">
            {article.summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8" dir="ltr">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-600/50 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article Image */}
        <div className="mb-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Article Content */}
        <div className="bg-[#232046]/80 rounded-2xl shadow-2xl p-8 border border-purple-900/30 mb-8">
          <div 
            className="prose prose-lg prose-invert max-w-none"
            dir="ltr"
            dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
          />
        </div>

        {/* Custom Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-3">💎</div>
            <h3 className="text-xl font-bold mb-3">Get Premium Access</h3>
            <p className="text-sm text-gray-200 mb-4">Unlock exclusive content and premium features</p>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-xl font-bold mb-3">Explore Our Tools</h3>
            <p className="text-sm text-gray-200 mb-4">Discover our collection of premium tools</p>
            <Link href="/tools" className="inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse Tools
            </Link>
          </div>
        </div>

        {/* Enhanced Share Section */}
        <div className="bg-[#232046]/60 rounded-2xl p-6 mb-8 border border-purple-900/30">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share this article
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => shareArticle('twitter')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span className="hidden sm:inline">Twitter</span>
            </button>
            
            <button
              onClick={() => shareArticle('facebook')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="hidden sm:inline">Facebook</span>
            </button>
            
            <button
              onClick={() => shareArticle('linkedin')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="hidden sm:inline">LinkedIn</span>
            </button>
            
            <button
              onClick={copyToClipboard}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Related Articles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/articles/${relatedArticle.slug}`}
                  className="block bg-[#232046]/60 rounded-xl overflow-hidden border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors" dir="ltr">
                      {relatedArticle.title}
                    </h4>
                    <p className="text-sm text-gray-400 line-clamp-2" dir="ltr">
                      {relatedArticle.summary}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{relatedArticle.category}</span>
                      <span>{relatedArticle.views} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage; 