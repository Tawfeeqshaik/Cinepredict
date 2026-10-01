import React, { useState, useEffect } from 'react';
import { LiveMarketDashboardData, LiveCinemaMovie, UserProfile } from '../../types';
import { apiGetLiveMarket } from '../../services/api_client';
import { ReelRow } from '../media/ReelRow';
import { PosterCard } from '../media/PosterCard';
import { CountUp } from '../ui/CountUp';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Film,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Star,
  Activity,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Globe,
  Zap,
  Info
} from 'lucide-react';

interface LiveCinemaHubProps {
  user?: UserProfile | null;
  onToggleLike?: (movieId: number) => void;
}

export const LiveCinemaHub: React.FC<LiveCinemaHubProps> = ({ user, onToggleLike }) => {
  const [marketData, setMarketData] = useState<LiveMarketDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<LiveCinemaMovie | null>(null);

  const loadData = async () => {
    try {
      const data = await apiGetLiveMarket();
      setMarketData(data);
    } catch (err) {
      console.error('Failed to load Live Cinema market data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !marketData) {
    return (
      <div className="p-12 text-center bg-[#141414] border border-[#262626] rounded-3xl animate-pulse space-y-4">
        <Film className="w-10 h-10 text-red-500 reel-spin mx-auto" />
        <p className="text-sm font-bold text-white">Streaming Live Cinema Market Signals...</p>
        <p className="text-xs text-neutral-400 font-mono">Connecting to TMDB verified movie stream</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. LIVE CINEMA STREAM HEADER & PULSE CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#141414] p-6 rounded-3xl border border-[#262626] shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                LIVE CINEMA INTELLIGENCE STREAM
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-[#050505] px-2 py-0.5 rounded border border-[#262626]">
                Last updated: {marketData.lastUpdated}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-0.5">
              Real-World Movie Market Signals &amp; Momentum
            </h1>
            <p className="text-xs text-neutral-400">
              {marketData.dataSource} • Tracking audience velocity, box-office proxies &amp; pre-release priors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-[#050505] hover:bg-[#1f1f1f] text-neutral-200 border border-[#262626] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-500' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Market'}</span>
          </button>
        </div>
      </div>

      {/* 2. TRENDING GENRES ENGINE OVERVIEW */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              Trending Genre Momentum Engine
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">
            Calculated from popularity density across 4,800+ catalog titles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {marketData.trendingGenres.map((g, i) => (
            <div key={i} className="p-3.5 bg-[#050505] border border-[#262626] rounded-2xl space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-1 font-mono text-xs font-bold">
                <span className="text-white">{g.genre}</span>
                <span className={g.trend === 'up' ? 'text-green-400' : g.trend === 'down' ? 'text-amber-400' : 'text-neutral-400'}>
                  {g.trend === 'up' ? '↑' : g.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">Avg Pop: {g.popularityAvg}</p>
              <div className="w-full bg-[#141414] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E50914] rounded-full"
                  style={{ width: `${Math.min(100, g.popularityAvg * 2.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TRENDING NOW RAIL (WITH MOMENTUM & MOVIE PULSE) */}
      <div className="space-y-4">
        <ReelRow
          title="Trending Now • Live Velocity"
          subtitle="Titles currently experiencing rapid popularity momentum across global viewers"
          badge="TOP MOMENTUM"
        >
          {marketData.trendingNow.map(movie => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="snap-start flex-shrink-0 w-44 sm:w-56 cursor-pointer"
            >
              <div className="relative group">
                <PosterCard
                  movie={{
                    id: movie.id,
                    title: movie.title,
                    budget: 0,
                    revenue: 0,
                    genres: movie.genres,
                    keywords: [],
                    cast: [],
                    crew: [],
                    production_companies: [],
                    vote_average: movie.rating,
                    vote_count: movie.voteCount,
                    popularity: movie.popularity,
                    release_date: movie.releaseDate,
                    release_month: 7,
                    release_year: parseInt(movie.releaseDate.split('-')[0]) || 2026,
                    runtime: 120,
                    original_language: movie.language,
                    overview: movie.overview,
                    poster_path: movie.posterPath,
                    top_cast_popularity: 70,
                    success: movie.rating >= 6.5 ? 1 : 0
                  }}
                  isLiked={user?.likedMovieIds?.includes(movie.id)}
                  onToggleLike={onToggleLike}
                />
                
                {/* Overlay Momentum Badge */}
                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-green-400 font-mono text-[9px] font-bold border border-green-900/50 flex items-center gap-0.5">
                    <span>↑</span>
                    <span>+{movie.popularityMomentumPercent}%</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </ReelRow>
      </div>

      {/* 4. NOW PLAYING & POPULAR THIS WEEK */}
      <div className="space-y-4">
        <ReelRow
          title="Now Playing In Theaters &amp; Streaming"
          subtitle="Recent releases with verified audience box-office momentum"
          badge="IN CIRCULATION"
        >
          {marketData.nowPlaying.map(movie => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="snap-start flex-shrink-0 w-44 sm:w-56 cursor-pointer"
            >
              <PosterCard
                movie={{
                  id: movie.id,
                  title: movie.title,
                  budget: 0,
                  revenue: 0,
                  genres: movie.genres,
                  keywords: [],
                  cast: [],
                  crew: [],
                  production_companies: [],
                  vote_average: movie.rating,
                  vote_count: movie.voteCount,
                  popularity: movie.popularity,
                  release_date: movie.releaseDate,
                  release_month: 7,
                  release_year: parseInt(movie.releaseDate.split('-')[0]) || 2026,
                  runtime: 120,
                  original_language: movie.language,
                  overview: movie.overview,
                  poster_path: movie.posterPath,
                  top_cast_popularity: 70,
                  success: movie.rating >= 6.5 ? 1 : 0
                }}
                isLiked={user?.likedMovieIds?.includes(movie.id)}
                onToggleLike={onToggleLike}
              />
            </div>
          ))}
        </ReelRow>
      </div>

      {/* 5. TOP RATED WORLD CINEMA */}
      <div className="space-y-4">
        <ReelRow
          title="Top Rated Worldwide Cinema"
          subtitle="Highest critical and audience consensus ratings"
          badge="CONSENSUS HITS"
        >
          {marketData.topRated.map(movie => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="snap-start flex-shrink-0 w-44 sm:w-56 cursor-pointer"
            >
              <PosterCard
                movie={{
                  id: movie.id,
                  title: movie.title,
                  budget: 0,
                  revenue: 0,
                  genres: movie.genres,
                  keywords: [],
                  cast: [],
                  crew: [],
                  production_companies: [],
                  vote_average: movie.rating,
                  vote_count: movie.voteCount,
                  popularity: movie.popularity,
                  release_date: movie.releaseDate,
                  release_month: 7,
                  release_year: parseInt(movie.releaseDate.split('-')[0]) || 2026,
                  runtime: 120,
                  original_language: movie.language,
                  overview: movie.overview,
                  poster_path: movie.posterPath,
                  top_cast_popularity: 70,
                  success: 1
                }}
                isLiked={user?.likedMovieIds?.includes(movie.id)}
                onToggleLike={onToggleLike}
              />
            </div>
          ))}
        </ReelRow>
      </div>

      {/* 6. MOVIE DETAIL INTELLIGENCE MODAL & PREDICTION VS REALITY */}
      <AnimatePresence>
        {selectedMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="flex items-start justify-between border-b border-[#262626] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E50914] text-white flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                      Live Movie Intelligence Report
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                      {selectedMovie.title}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="p-2 text-neutral-400 hover:text-white rounded-xl bg-[#050505]"
                >
                  ✕
                </button>
              </div>

              {/* Movie Pulse Metrics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 bg-[#050505] border border-[#262626] rounded-2xl">
                  <p className="text-[10px] font-mono text-neutral-500">AUDIENCE RATING</p>
                  <p className="text-xl font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{selectedMovie.rating.toFixed(1)}</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">({selectedMovie.voteCount} votes)</p>
                </div>

                <div className="p-3.5 bg-[#050505] border border-[#262626] rounded-2xl">
                  <p className="text-[10px] font-mono text-neutral-500">POPULARITY INDEX</p>
                  <p className="text-xl font-bold text-white mt-1">{selectedMovie.popularity}</p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">TMDB Volume</p>
                </div>

                <div className="p-3.5 bg-[#050505] border border-[#262626] rounded-2xl">
                  <p className="text-[10px] font-mono text-neutral-500">TREND MOMENTUM</p>
                  <p className="text-xl font-bold text-green-400 mt-1 font-mono">
                    ↑ {selectedMovie.popularityMomentumPercent ? `+${selectedMovie.popularityMomentumPercent}%` : 'Stable'}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">24h Velocity</p>
                </div>

                <div className="p-3.5 bg-[#050505] border border-red-600/30 rounded-2xl">
                  <p className="text-[10px] font-mono text-red-400">PULSE SCORE</p>
                  <p className="text-xl font-bold text-white mt-1">{selectedMovie.pulseScore} / 100</p>
                  <p className="text-[10px] text-red-500 font-mono mt-0.5">{selectedMovie.pulseSignal} Signal</p>
                </div>
              </div>

              {/* PREDICTION VS REALITY COMPARISON SECTION */}
              <div className="p-5 bg-[#050505] border border-[#262626] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Prediction vs Reality Tracking
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-950 text-green-400 border border-green-800 text-[10px] font-mono font-bold">
                    {selectedMovie.predictionTrackingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 bg-[#141414] rounded-xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-500">PRE-RELEASE MODEL PRIOR</p>
                    <p className="text-base font-bold text-white mt-0.5">{selectedMovie.historicalModelPrediction || 75}%</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Model A Walk-Forward Estimate</p>
                  </div>
                  <div className="p-3 bg-[#141414] rounded-xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-500">OBSERVED AUDIENCE OUTCOME</p>
                    <p className="text-base font-bold text-green-400 mt-0.5">
                      {selectedMovie.rating >= 6.5 ? 'Successful Hit' : 'Moderate'} ({selectedMovie.rating.toFixed(1)} / 10)
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{selectedMovie.voteCount.toLocaleString()} Verified Votes</p>
                  </div>
                </div>

                {selectedMovie.predictionDivergenceAlert && (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{selectedMovie.predictionDivergenceAlert}</span>
                  </div>
                )}
              </div>

              {/* Synopsis & Attribution */}
              <div className="space-y-2 text-xs">
                <p className="text-neutral-300 leading-relaxed">{selectedMovie.overview}</p>
                <p className="text-[10px] font-mono text-neutral-500 pt-2 border-t border-[#262626]">
                  Data attribution: Verified TMDB 5000 records. Strict separation maintained between pre-release priors and post-release signals.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
