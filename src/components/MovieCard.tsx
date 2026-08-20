import React from 'react';
import { Movie } from '../types';
import { Heart, Star, DollarSign, Clock, Film, Sparkles, TrendingUp } from 'lucide-react';

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
  const [imageError, setImageError] = React.useState(false);

  const formattedBudget = movie.budget > 0
    ? `$${(movie.budget / 1000000).toFixed(0)}M`
    : 'N/A';

  const formattedRevenue = movie.revenue > 0
    ? `$${(movie.revenue / 1000000).toFixed(0)}M`
    : 'N/A';

  return (
    <div className="group relative bg-[#141414] rounded-2xl border border-[#262626] hover:border-red-600/40 shadow-xl shadow-black/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-red-600/10 flex flex-col overflow-hidden">
      
      {/* Top Media / Poster Section */}
      <div className="relative aspect-[16/10] w-full bg-[#0B0B0B] overflow-hidden flex items-center justify-center">
        {movie.poster_path && !imageError ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            loading="lazy"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          /* High-spec styled placeholder when no poster is available */
          <div className="w-full h-full bg-gradient-to-br from-[#181818] via-[#141414] to-red-950/20 p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.15),transparent_60%)]" />
            
            <div className="flex items-center justify-between text-neutral-500 z-10">
              <div className="p-1.5 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-[#050505]/80 px-2 py-0.5 rounded-md border border-[#262626]">
                TMDB #{movie.id}
              </span>
            </div>

            <div className="z-10">
              <p className="text-sm font-bold text-white group-hover:text-red-500 transition-colors line-clamp-2 leading-snug font-display">
                {movie.title}
              </p>
              <p className="text-[11px] text-red-400/90 font-medium mt-1">
                {movie.genres.slice(0, 2).join(' • ')}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 z-10 pt-2 border-t border-[#262626] font-mono">
              <span>{movie.release_year}</span>
              <span>{movie.runtime} mins</span>
            </div>
          </div>
        )}

        {/* Overlay Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/50 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          {/* Rating Badge */}
          <div className="flex items-center gap-1 bg-[#050505]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#262626] text-xs font-semibold text-amber-400 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
            <span className="text-[10px] text-neutral-400 font-normal">({movie.vote_count})</span>
          </div>

          {/* Like Heart Button */}
          {onToggleLike && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(movie.id);
              }}
              title={isLiked ? "Unlike movie" : "Like movie & tune taste profile"}
              className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md border transition-all duration-200 ${
                isLiked
                  ? 'bg-[#E50914] text-white border-red-500 shadow-lg shadow-red-600/40 scale-105'
                  : 'bg-[#050505]/80 text-neutral-400 border-[#262626] hover:text-red-400 hover:border-red-500/50 hover:bg-[#181818]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          )}
        </div>

        {/* Match Score Badge if personalized */}
        {matchScore !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="flex items-center gap-1 bg-[#E50914] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-lg shadow-red-600/30 font-mono">
              <Sparkles className="w-3 h-3" />
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

    </div>
  );
};

export const MovieCard = React.memo(MovieCardComponent);
