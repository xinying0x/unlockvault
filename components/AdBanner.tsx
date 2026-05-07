import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  position?: 'inline' | 'sidebar' | 'footer';
  className?: string;
}

/**
 * Adsterra Native Banner component — responsive, adapts to all screen sizes.
 * Uses the SocialBar script which is already globally loaded in _document.tsx.
 * This component shows a native-looking sponsored card between content sections.
 */
const AdBanner: React.FC<AdBannerProps> = ({ position = 'inline', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const containerStyles: Record<string, string> = {
    inline: 'w-full my-6',
    sidebar: 'w-full sticky top-20',
    footer: 'w-full mt-8',
  };

  return (
    <div
      ref={containerRef}
      className={`${containerStyles[position]} ${className}`}
      aria-label="Sponsored content"
    >
      {/* Native-styled Sponsored Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#1C1535]/80 to-[#2D1B5A]/60 backdrop-blur-sm p-4 flex items-center gap-4 group hover:border-purple-500/20 transition-all duration-300">
        {/* Sponsored label */}
        <span className="absolute top-2 right-3 text-[10px] text-gray-600 uppercase tracking-widest">
          Sponsored
        </span>

        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-2xl border border-purple-500/20">
          🎮
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-white truncate">
            Get Premium Apps & Games — Free
          </p>
          <p className="text-xs text-gray-400 truncate">
            Unlock exclusive modded content instantly
          </p>
        </div>

        {/* CTA */}
        <a
          href="https://onionclose.com/byi5ype2a9?key=273b2aafb26c4332440b8d5a3677cfe3"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-purple-900/30 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          Try Free →
        </a>
      </div>
    </div>
  );
};

export default AdBanner;
