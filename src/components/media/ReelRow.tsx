import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReelRowProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ReelRow: React.FC<ReelRowProps> = ({
  title,
  subtitle,
  badge,
  icon,
  children,
  className = ''
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollPosition, 350);
    }
  };

  return (
    <div className={`space-y-4 relative group ${className}`}>
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            {badge && (
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest bg-red-600/10 border border-red-600/30 px-2 py-0.5 rounded-md">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-xl font-extrabold text-white font-display mt-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Desktop Arrow Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-xl border border-[#262626] bg-[#141414] text-white transition-all ${
              canScrollLeft ? 'hover:bg-[#E50914] hover:border-[#E50914] cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-xl border border-[#262626] bg-[#141414] text-white transition-all ${
              canScrollRight ? 'hover:bg-[#E50914] hover:border-[#E50914] cursor-pointer' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reel Scroll Container */}
      <div className="relative">
        {/* Left Fade Scrim */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
        )}

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          onScroll={checkScrollPosition}
          className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {children}
        </div>

        {/* Right Fade Scrim */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />
        )}
      </div>

    </div>
  );
};
