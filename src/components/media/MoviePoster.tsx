import React, { useState, useMemo } from 'react';
import { Film } from 'lucide-react';

interface MoviePosterProps {
  posterPath?: string;
  backdropPath?: string;
  title: string;
  genres?: string[];
  releaseYear?: number;
  alt?: string;
  aspectRatio?: '2/3' | '16/10' | '16/9' | 'square';
  className?: string;
  imageClassName?: string;
  showFallbackDetails?: boolean;
}

/**
 * Reusable CinePredict MoviePoster Component
 * Resolution cascade: TMDB poster_path -> TMDB backdrop_path -> local cached -> stylized CinePredict fallback
 */
export const MoviePoster: React.FC<MoviePosterProps> = ({
  posterPath,
  backdropPath,
  title,
  genres = [],
  releaseYear,
  alt,
  aspectRatio = '2/3',
  className = '',
  imageClassName = '',
  showFallbackDetails = true
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize image URL
  const normalizedUrl = useMemo(() => {
    const raw = posterPath || backdropPath;
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${trimmed}`;
    }
    return `https://image.tmdb.org/t/p/w500/${trimmed}`;
  }, [posterPath, backdropPath]);

  const aspectClass = useMemo(() => {
    switch (aspectRatio) {
      case '16/10': return 'aspect-[16/10]';
      case '16/9': return 'aspect-[16/9]';
      case 'square': return 'aspect-square';
      case '2/3':
      default:
        return 'aspect-[2/3]';
    }
  }, [aspectRatio]);

  return (
    <div className={`relative w-full ${aspectClass} bg-[#0A0A0A] overflow-hidden rounded-xl select-none ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && normalizedUrl && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#222222] to-[#141414] animate-pulse z-0" />
      )}

      {normalizedUrl && !hasError ? (
        <img
          src={normalizedUrl}
          alt={alt || title}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoading ? 'opacity-0 scale-95' : 'opacity-90 hover:opacity-100 group-hover:scale-105'
          } ${imageClassName}`}
        />
      ) : (
        /* Stylized CinePredict Fallback Poster */
        <div className="w-full h-full bg-gradient-to-br from-[#1c1c1c] via-[#121212] to-red-950/25 p-3.5 flex flex-col justify-between relative overflow-hidden border border-[#222]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.18),transparent_65%)] pointer-events-none" />

          {/* Top Header */}
          <div className="flex items-center justify-between text-neutral-500 z-10">
            <div className="p-1.5 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500">
              <Film className="w-4 h-4" />
            </div>
            {releaseYear && (
              <span className="text-[10px] font-mono text-neutral-400 bg-[#050505]/80 px-2 py-0.5 rounded border border-[#262626]">
                {releaseYear}
              </span>
            )}
          </div>

          {/* Middle/Bottom Title */}
          {showFallbackDetails && (
            <div className="z-10 mt-auto">
              <p className="text-xs font-bold text-white leading-tight font-display line-clamp-2">
                {title}
              </p>
              {genres.length > 0 && (
                <p className="text-[10px] text-red-400/90 font-medium mt-1 truncate">
                  {genres.slice(0, 2).join(' • ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dark vignette bottom overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none opacity-80" />
    </div>
  );
};
