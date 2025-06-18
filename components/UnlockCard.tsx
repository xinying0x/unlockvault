import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface UnlockCardProps {
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  views?: number;
  unlocks?: number;
  category?: string;
  featured?: boolean;
  rating?: number;
  offerSlug: string;
  type?: 'tool' | 'app' | 'game';
}

export default function UnlockCard({
  image,
  title,
  description,
  buttonText,
  buttonHref,
  views = 0,
  unlocks = 0,
  category,
  featured = false,
  rating = 4.5,
  offerSlug,
  type
}: UnlockCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">⭐</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">⭐</span>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-600">⭐</span>);
    }

    return stars;
  };

  const handleUnlockClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Attempting to increment unlocks for slug: ${offerSlug}`);
    try {
      const response = await fetch(`/api/offers/${offerSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'incrementUnlocks' }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Unlock count incremented successfully!', data);
      } else {
        const errorData = await response.json();
        console.error('Failed to increment unlock count:', response.status, errorData);
        // Optionally, show a toast or error message to the user
      }
    } catch (error) {
      console.error('Error during fetch for unlock count:', error);
    }
    router.push(buttonHref);
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    // If clicking on the button, let the button handler take care of it
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Otherwise, handle the card click
    console.log(`Card clicked, navigating to: ${buttonHref}`);
    router.push(buttonHref);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer flex flex-col h-full"
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
          ⭐ Featured
        </div>
      )}

      {/* Category Badge */}
      {category && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-purple-500/30">
          {category}
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-700/50 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-sm">Image not available</div>
              </div>
            </div>
          ) : (
            <img
              src={image}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span>👁️</span>
                  <span>{formatNumber(views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔓</span>
                  <span>{formatNumber(unlocks)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(rating).slice(0, 3)}
                <span className="text-xs ml-1">{rating}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Content - Flex grow to fill space */}
      <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-3 group-hover:text-gray-300 transition-colors duration-300 flex-grow">
            {description}
          </p>

          {/* Stats Row - Always at bottom of content */}
          <div className="flex items-center justify-between text-sm mt-auto">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="flex items-center gap-1">
                <span className="text-blue-400">👁️</span>
                <span>{formatNumber(views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-400">🔓</span>
                <span>{formatNumber(unlocks)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {renderStars(rating).slice(0, 3)}
              <span className="text-xs text-gray-400 ml-1">{rating}</span>
            </div>
          </div>
        </div>

      {/* Action Button - Always at bottom */}
      <div className="mt-auto">
        <button
          onClick={handleUnlockClick}
          className="group/btn relative w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold py-3 px-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 overflow-hidden"
        >
          {/* Button Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          
          {/* Button Content */}
          <span className="relative z-10 flex items-center gap-2">
            {buttonText}
            <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">
              🚀
            </span>
          </span>

          {/* Shine Effect */}
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-pulse transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
    </div>
  );
} 