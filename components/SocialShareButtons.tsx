import { useState, useEffect } from 'react';

interface SocialSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  whatsapp: string;
  telegram: string;
  email: string;
  website: string;
}

interface SocialShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ title, url, description = '' }) => {
  const [socialSettings, setSocialSettings] = useState<SocialSettings | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSocialSettings();
  }, []);

  const fetchSocialSettings = async () => {
    try {
      const response = await fetch('/api/social-settings');
      if (response.ok) {
        const settings = await response.json();
        setSocialSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching social settings:', error);
    }
  };

  const shareArticle = (platform: string) => {
    if (!socialSettings) return;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/${socialSettings.whatsapp}?text=${encodeURIComponent(`${title} - ${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      email: `mailto:${socialSettings.email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`
    };

    // For platforms with direct URLs
    if (platform === 'instagram' || platform === 'tiktok' || platform === 'youtube') {
      const directUrl = socialSettings[platform as keyof SocialSettings];
      if (directUrl) {
        window.open(directUrl, '_blank');
      } else {
        copyToClipboard();
        alert(`Link copied! You can now share it on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
      }
      return;
    }

    // For platforms with custom URLs from settings
    if (platform === 'website' && socialSettings.website) {
      window.open(socialSettings.website, '_blank');
      return;
    }

    // For standard sharing platforms
    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const socialPlatforms = [
    {
      key: 'facebook',
      label: 'Facebook',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30 text-blue-300'
    },
    {
      key: 'twitter',
      label: 'X',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-gray-600/20 hover:bg-gray-600/30 border-gray-500/30 text-gray-300'
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/30 text-pink-300'
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      color: 'bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-300'
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: 'bg-red-700/20 hover:bg-red-700/30 border-red-600/30 text-red-300'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'bg-blue-700/20 hover:bg-blue-700/30 border-blue-600/30 text-blue-300'
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
        </svg>
      ),
      color: 'bg-green-600/20 hover:bg-green-600/30 border-green-500/30 text-green-300'
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30 text-blue-300'
    }
  ];

  if (!socialSettings) {
    return (
      <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div className="text-center text-gray-400">Loading social links...</div>
      </div>
    );
  }

  // Filter platforms that have URLs set
  const availablePlatforms = socialPlatforms.filter(platform => 
    socialSettings[platform.key as keyof SocialSettings]
  );

  return (
    <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        Share this article
      </h3>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {availablePlatforms.map((platform) => (
          <button
            key={platform.key}
            onClick={() => shareArticle(platform.key)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 group border ${platform.color}`}
          >
            {platform.icon}
            <span className="text-xs font-medium">{platform.label}</span>
          </button>
        ))}

        {/* Always show copy link button */}
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
  );
};

export default SocialShareButtons; 