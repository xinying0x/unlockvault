import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ResponsiveCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  type: 'tool' | 'app' | 'game';
  rating?: number;
  buttonText: string;
  buttonHref: string;
  views: number;
  unlocks: number;
  featured?: boolean;
  compact?: boolean;
  addedAt?: string;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  description,
  image,
  category,
  type,
  rating = 5,
  buttonText,
  buttonHref,
  views,
  unlocks,
  featured = false,
  compact = false,
  addedAt
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const typeColors = {
    tool: 'from-blue-500 to-cyan-600',
    app: 'from-green-500 to-emerald-600',
    game: 'from-purple-500 to-pink-600'
  };

  const typeIcons = {
    tool: '🛠️',
    app: '📱',
    game: '🎮'
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  return (
    <div className={`group relative w-full ${compact ? 'max-w-xs' : 'max-w-sm'} mx-auto`}>
      {/* Card Container - Make entire card clickable */}
      <Link href={buttonHref} className="block w-full">
        <div className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer ${compact ? 'min-h-[400px] flex flex-col' : 'flex flex-col'}`}>
        
          {/* Featured Badge */}
          {featured && (
            <div className={`absolute ${compact ? 'top-2 left-2' : 'top-3 left-3'} z-20`}>
              <div className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-white ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'} rounded-full font-bold shadow-lg`}>
                ⭐ Featured
              </div>
            </div>
          )}

          {/* Type Badge */}
          <div className={`absolute ${compact ? 'top-2 right-2' : 'top-3 right-3'} z-20`}>
            <div className={`bg-gradient-to-r ${typeColors[type]} text-white ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'} rounded-full font-bold shadow-lg flex items-center gap-1`}>
              <span>{typeIcons[type]}</span>
              <span className="capitalize">{type}</span>
            </div>
          </div>

          {/* Image Container */}
          <div className={`relative ${compact ? 'h-32' : 'h-48 sm:h-56'} overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800`}>
            {!imageError ? (
              <>
                <Image
                  src={image}
                  alt={title}
                  fill
                  className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={featured}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center ${compact ? 'text-4xl' : 'text-6xl'}`}>
                {typeIcons[type]}
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Content */}
          <div className={`${compact ? 'p-3 flex-1 flex flex-col' : 'p-4 sm:p-6 flex-1 flex flex-col'}`}>
            {/* Content Section */}
            <div className={`${compact ? 'space-y-2 flex-1' : 'space-y-4 flex-1'}`}>
              {/* Category */}
              <div className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                {category}
              </div>

              {/* Title */}
              <h3 className={`${compact ? 'text-sm' : 'text-lg sm:text-xl'} font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors duration-300`}>
                {title}
              </h3>

              {/* Description */}
              <p className={`text-sm text-gray-300 ${compact ? 'line-clamp-2' : 'line-clamp-3'} leading-relaxed`}>
                {description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`${compact ? 'text-xs' : 'text-sm'} ${
                        i < rating ? 'text-yellow-400' : 'text-gray-600'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">({rating}/5)</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    👁️ {views > 999 ? `${(views/1000).toFixed(1)}k` : views}
                  </span>
                  <span className="flex items-center gap-1">
                    ⬇️ {unlocks > 999 ? `${(unlocks/1000).toFixed(1)}k` : unlocks}
                  </span>
                </div>
                {addedAt && (
                  <span className="flex items-center gap-1">
                    🕒 {formatTimeAgo(addedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button - Always at bottom */}
            <div className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold ${compact ? 'py-2 px-4 text-sm mt-3' : 'py-3 px-6 mt-4'} rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}>
              <span className="flex items-center justify-center gap-2">
                <span>{buttonText}</span>
                <span className={compact ? 'text-sm' : 'text-lg'}>🚀</span>
              </span>
            </div>
          </div>

          {/* Hover Effect Border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </Link>
    </div>
  );
};

export default ResponsiveCard; 