import React, { useState } from 'react';
import { Movie } from '../../types';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Flame, Sparkles, Clock, Calendar, CheckCircle2, Film } from 'lucide-react';
import { MoviePoster } from './MoviePoster';

interface PosterCardProps {
  movie: Movie;
  isLiked?: boolean;
  onToggleLike?: (movieId: number) => void;
  showProducerDetails?: boolean;
  className?: string;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  movie,
  isLiked = false,
  onToggleLike,
  showProducerDetails = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleLike) {
      if (!isLiked && !shouldReduceMotion) {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      }
      onToggleLike(movie.id);
    }
  };

  const isHit = movie.success === 1;

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.025 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative bg-[#141414] border border-[#262626] hover:border-red-600/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-600/10 flex flex-col justify-between transition-colors ${className}`}
    >
      {/* 1. POSTER IMAGE CONTAINER */}
      <div className="relative w-full overflow-hidden">
        <MoviePoster
          posterPath={movie.poster_path}
          title={movie.title}
          genres={movie.genres}
          releaseYear={movie.release_year}
          aspectRatio="2/3"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-neutral-200 border border-white/10 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </span>

          {/* Like Heart Button */}
          {onToggleLike && (
            <button
              type="button"
              onClick={handleLike}
              className="relative p-2 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-all cursor-pointer"
              title={isLiked ? "Unlike movie" : "Like movie"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  isLiked ? 'text-[#E50914] fill-[#E50914] scale-110' : 'text-neutral-400'
                }`}
              />

              {/* Heart Particle Burst Pop */}
              <AnimatePresence>
                {showHeartBurst && (
                  <>
                    <motion.span
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-full border-2 border-red-500 pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 1.5, y: -16, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none text-red-500 text-xs font-bold font-mono"
                    >
                      +1
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>

        {/* Bottom Poster Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />

        {/* Success / Classification Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span
            className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border shadow-sm ${
              isHit
                ? 'bg-green-950/80 text-green-400 border-green-700/50'
                : 'bg-neutral-900/80 text-neutral-400 border-neutral-700/50'
            }`}
          >
            {isHit ? '✓ Grounded Hit' : 'Moderate'}
          </span>
          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-neutral-500" />
            {movie.release_year}
          </span>
        </div>
      </div>

      {/* 2. CARD METADATA CONTENT */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-white truncate font-display group-hover:text-red-400 transition-colors">
            {movie.title}
          </h4>

          {/* Genres Chips */}
          <div className="flex flex-wrap gap-1 mt-1">
            {movie.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[9px] font-mono text-neutral-400 bg-[#050505] px-1.5 py-0.5 rounded border border-[#262626]">
                {g}
              </span>
            ))}
            {movie.genres.length > 2 && (
              <span className="text-[9px] font-mono text-neutral-500">
                +{movie.genres.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Runtime & Language */}
        <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-500" />
            {movie.runtime}m
          </span>
          <span className="uppercase text-neutral-400">
            {movie.original_language}
          </span>
        </div>

        {/* Producer Extra Metadata (if enabled) */}
        {showProducerDetails && movie.budget > 0 && (
          <div className="pt-1.5 flex items-center justify-between text-[9px] font-mono text-neutral-400 bg-[#050505] p-1.5 rounded-lg border border-[#262626]">
            <span>Budget: ${(movie.budget / 1000000).toFixed(0)}M</span>
            <span>Rev: ${(movie.revenue / 1000000).toFixed(0)}M</span>
          </div>
        )}
      </div>

    </motion.div>
  );
};
