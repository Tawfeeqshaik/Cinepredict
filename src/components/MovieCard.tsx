import React, { useState } from 'react';
import { Movie } from '../types';
import { Heart, Star, DollarSign, Clock, Film, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MoviePoster } from './media/MoviePoster';

interface MovieCardProps {
  movie: Movie;
  isLiked?: boolean;
  onToggleLike?: (movieId: number) => void;
  reason?: string;
  matchScore?: number;
  showProducerDetails?: boolean;
}

export const MovieCardComponent: React.FC<MovieCardProps> = ({
  movie,
  isLiked = false,
  onToggleLike,
  reason,
  matchScore,
  showProducerDetails = false
}) => {
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

  const formattedBudget = movie.budget > 0
    ? `$${(movie.budget / 1000000).toFixed(0)}M`
    : 'N/A';

  const formattedRevenue = movie.revenue > 0
    ? `$${(movie.revenue / 1000000).toFixed(0)}M`
    : 'N/A';

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-[#141414]/90 backdrop-blur-md rounded-2xl border border-[#262626] hover:border-red-600/50 shadow-xl shadow-black/80 transition-colors flex flex-col overflow-hidden"
    >
      
      {/* Top Media / Poster Section */}
      <div className="relative w-full overflow-hidden">
        <MoviePoster
          posterPath={movie.poster_path}
          title={movie.title}
          genres={movie.genres}
          releaseYear={movie.release_year}
          aspectRatio="16/10"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {/* Rating Badge */}
          <div className="flex items-center gap-1 bg-[#050505]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#262626] text-xs font-semibold text-amber-400 shadow-md pointer-events-none">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
            <span className="text-[10px] text-neutral-400 font-normal">({movie.vote_count})</span>
          </div>

          {/* Like Heart Button with Particle Burst */}
          {onToggleLike && (
            <button
              type="button"
              onClick={handleLike}
              title={isLiked ? "Unlike movie" : "Like movie & tune taste profile"}
              className={`relative p-2 rounded-xl backdrop-blur-md border transition-all duration-200 cursor-pointer ${
                isLiked
                  ? 'bg-[#E50914] text-white border-red-500 shadow-lg shadow-red-600/40 scale-105'
                  : 'bg-[#050505]/80 text-neutral-400 border-[#262626] hover:text-red-400 hover:border-red-500/50 hover:bg-[#181818]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />

              <AnimatePresence>
                {showHeartBurst && (
                  <>
                    <motion.span
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 rounded-xl border-2 border-red-500 pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 1.4, y: -16, opacity: 0 }}
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

        {/* Match Score Badge if personalized */}
        {matchScore !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="flex items-center gap-1 bg-[#E50914] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-lg shadow-red-600/30 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              {matchScore}% Match
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Header Title & Year */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-white group-hover:text-red-500 transition-colors line-clamp-1 font-display">
              {movie.title}
            </h3>
            <span className="text-xs font-mono text-neutral-400 flex-shrink-0 bg-[#181818] px-2 py-0.5 rounded border border-[#262626]">
              {movie.release_year}
            </span>
          </div>

          {/* Genres Pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genres.slice(0, 3).map((g, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#181818] text-neutral-300 border border-[#262626]"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Overview text snippet */}
          <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
            {movie.overview}
          </p>
        </div>

        {/* Recommended Reason Callout (if provided) */}
        {reason && (
          <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-[11px] text-red-300 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">{reason}</p>
          </div>
        )}

        {/* Producer Analytics Row */}
        {showProducerDetails && (
          <div className="pt-2.5 border-t border-[#262626] grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-400">
            <div className="bg-[#050505] p-1.5 rounded-lg border border-[#262626]">
              <p className="text-neutral-500 font-mono">Budget</p>
              <p className="font-semibold text-neutral-200 mt-0.5">{formattedBudget}</p>
            </div>
            <div className="bg-[#050505] p-1.5 rounded-lg border border-[#262626]">
              <p className="text-neutral-500 font-mono">Revenue</p>
              <p className="font-semibold text-red-400 mt-0.5">{formattedRevenue}</p>
            </div>
            <div className="bg-[#050505] p-1.5 rounded-lg border border-[#262626]">
              <p className="text-neutral-500 font-mono">Pop Score</p>
              <p className="font-semibold text-neutral-300 mt-0.5">{movie.popularity.toFixed(0)}</p>
            </div>
          </div>
        )}

      </div>

    </motion.div>
  );
};

export const MovieCard = React.memo(MovieCardComponent);
