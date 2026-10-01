import React, { useState, useEffect } from 'react';
import { Movie, UserProfile, ConceptBattle } from '../types';
import { MovieCard } from './MovieCard';
import { ReelRow } from './media/ReelRow';
import { PosterCard } from './media/PosterCard';
import { AudienceLabViewer } from './audience/AudienceLabViewer';
import { LiveCinemaHub } from './live/LiveCinemaHub';
import { Reveal } from './motion/Reveal';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Compass,
  Gem,
  Flame,
  Heart,
  Search,
  Filter,
  Film,
  TrendingUp,
  RefreshCw,
  Vote,
  FilterX,
  ArrowRight,
  CheckCircle2,
  BarChart2,
  SlidersHorizontal,
  AlertTriangle
} from 'lucide-react';

interface ViewerDashboardProps {
  user: UserProfile;
  movies: Movie[];
  conceptBattle: ConceptBattle | null;
  onToggleLike: (movieId: number) => void;
  onGetPersonalizedFeed: (likedIds: number[]) => Promise<any[]>;
  onGetTopSimilar: (referenceId: number) => Promise<any[]>;
  onGetHiddenGems: (genre?: string) => Promise<Movie[]>;
  onGetTrending: () => Promise<any[]>;
  onVoteConcept: (choice: 'A' | 'B') => Promise<ConceptBattle>;
}

export const ViewerDashboard: React.FC<ViewerDashboardProps> = ({
  user,
  movies,
  conceptBattle: initialConceptBattle,
  onToggleLike,
  onGetPersonalizedFeed,
  onGetTopSimilar,
  onGetHiddenGems,
  onGetTrending,
  onVoteConcept
}) => {
  // Concept Battle state
  const [battle, setBattle] = useState<ConceptBattle | null>(initialConceptBattle);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    setBattle(initialConceptBattle);
  }, [initialConceptBattle]);

  // Feed states
  const [forYouFeed, setForYouFeed] = useState<any[]>([]);
  const [loadingForYou, setLoadingForYou] = useState(true);

  // Discover Similar states
  const [selectedRefMovieId, setSelectedRefMovieId] = useState<number>(movies[0]?.id || 27205);
  const [similarRecs, setSimilarRecs] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Hidden Gems states
  const [gemGenre, setGemGenre] = useState<string>('All');
  const [hiddenGems, setHiddenGems] = useState<Movie[]>([]);

  // Trending states
  const [trendingGenres, setTrendingGenres] = useState<any[]>([]);

  // Search filter, genre filter, language filter, accessibility filter, sort & pagination for Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'popularity' | 'rating' | 'budget' | 'revenue' | 'newest'>('popularity');
  const [visibleCount, setVisibleCount] = useState(24);

  // Debounce search query to prevent heavy recalculations on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch / Refresh For You Feed whenever likedMovieIds changes
  useEffect(() => {
    let isMounted = true;
    setLoadingForYou(true);
    onGetPersonalizedFeed(user.likedMovieIds).then(feed => {
      if (isMounted) {
        setForYouFeed(feed);
        setLoadingForYou(false);
      }
    }).catch(err => {
      if (isMounted) setLoadingForYou(false);
    });
    return () => { isMounted = false; };
  }, [user.likedMovieIds]);

  // Fetch Similar Movies when ref movie changes
  useEffect(() => {
    let isMounted = true;
    setLoadingSimilar(true);
    onGetTopSimilar(selectedRefMovieId).then(recs => {
      if (isMounted) {
        setSimilarRecs(recs);
        setLoadingSimilar(false);
      }
    }).catch(err => {
      if (isMounted) setLoadingSimilar(false);
    });
    return () => { isMounted = false; };
  }, [selectedRefMovieId, movies]);

  // Fetch Hidden Gems when genre filter changes
  useEffect(() => {
    let isMounted = true;
    onGetHiddenGems(gemGenre).then(gems => {
      if (isMounted) setHiddenGems(gems);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [gemGenre]);

  // Fetch Trending Genres
  useEffect(() => {
    let isMounted = true;
    onGetTrending().then(trends => {
      if (isMounted) setTrendingGenres(trends);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const genresList = [
    'All', 'Action', 'Adventure', 'Science Fiction', 'Fantasy', 'Drama',
    'Comedy', 'Thriller', 'Horror', 'Animation', 'Romance', 'Crime', 'Documentary'
  ];

  const languagesList = [
    { code: 'All', label: 'All Languages' },
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (Bollywood)' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' }
  ];

  // Filtered & Sorted Catalog Memo
  const filteredCatalog = React.useMemo(() => {
    if (!movies || movies.length === 0) return [];
    let list = [...movies];

    if (selectedGenre && selectedGenre !== 'All') {
      const gLower = selectedGenre.toLowerCase();
      list = list.filter(m => m.genres && m.genres.some(g => g.toLowerCase() === gLower));
    }

    if (selectedLanguage && selectedLanguage !== 'All') {
      list = list.filter(m => m.original_language === selectedLanguage);
    }

    if (accessibilityOnly) {
      list = list.filter(m => m.original_language !== 'en' || (m.vote_count > 500));
    }

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.genres && m.genres.some(g => g.toLowerCase().includes(q))) ||
        (m.cast && m.cast.some(c => c.toLowerCase().includes(q)))
      );
    }

    if (selectedSort === 'popularity') {
      list.sort((a, b) => b.popularity - a.popularity);
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => b.vote_average - a.vote_average);
    } else if (selectedSort === 'budget') {
      list.sort((a, b) => b.budget - a.budget);
    } else if (selectedSort === 'revenue') {
      list.sort((a, b) => b.revenue - a.revenue);
    } else if (selectedSort === 'newest') {
      list.sort((a, b) => b.release_year - a.release_year);
    }

    return list;
  }, [movies, selectedGenre, selectedLanguage, accessibilityOnly, debouncedSearchQuery, selectedSort]);

  const handleVote = async (choice: 'A' | 'B') => {
    if (voting) return;
    setVoting(true);
    try {
      const updated = await onVoteConcept(choice);
      setBattle(updated);
      setHasVoted(true);
    } finally {
      setVoting(false);
    }
  };

  // Compute taste profile from liked movies
  const tasteProfile = React.useMemo(() => {
    const likedMovies = movies.filter(m => user.likedMovieIds.includes(m.id));
    if (likedMovies.length === 0) return null;

    const genreCounts: Record<string, number> = {};
    const langCounts: Record<string, number> = {};
    likedMovies.forEach(m => {
      (m.genres || []).forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
      langCounts[m.original_language] = (langCounts[m.original_language] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([g]) => g);
    const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';
    const avgRating = likedMovies.reduce((sum, m) => sum + m.vote_average, 0) / likedMovies.length;
    return { topGenres, topLang, avgRating, count: likedMovies.length };
  }, [movies, user.likedMovieIds]);

  // Regional discovery rows
  const regionalRows = React.useMemo(() => {
    const langs = [
      { code: 'hi', label: 'Hindi (Bollywood)' },
      { code: 'ta', label: 'Tamil Cinema' },
      { code: 'te', label: 'Telugu Cinema' },
      { code: 'fr', label: 'French Cinema' },
      { code: 'es', label: 'Spanish Cinema' },
      { code: 'en', label: 'English' }
    ];
    return langs.map(l => ({
      ...l,
      movies: movies
        .filter(m => m.original_language === l.code && m.vote_count >= 50)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 8)
    })).filter(r => r.movies.length >= 2);
  }, [movies]);

  // Accessible content (multi-lingual, non-English with substantial vote count)
  const accessibleMovies = React.useMemo(() => {
    return movies
      .filter(m => m.original_language !== 'en' && m.vote_count >= 200 && m.vote_average >= 6.5)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 12);
  }, [movies]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedSort('popularity');
  };

  // Math for battle scores
  const totalVotes = battle ? battle.conceptA.votes + battle.conceptB.votes : 0;
  const ratioA = totalVotes > 0 ? (battle?.conceptA.votes || 0) / totalVotes : 0.5;
  const ratioB = totalVotes > 0 ? (battle?.conceptB.votes || 0) / totalVotes : 0.5;

  const blendedA = battle ? (0.6 * battle.conceptA.modelAProbability) + (0.4 * ratioA) : 0;
  const blendedB = battle ? (0.6 * battle.conceptB.modelAProbability) + (0.4 * ratioB) : 0;

  // Signal conflict calculation
  const isSignalConflictA = battle ? Math.abs(battle.conceptA.modelAProbability - ratioA) > 0.18 : false;

  return (
    <div className="space-y-10 pb-16 font-sans">

      {/* 0. TASTE PROFILE CARD */}
      {tasteProfile ? (
        <div id="for-you-section" className="bg-[#141414] border border-[#262626] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Your Taste Vector Profile</p>
              <h3 className="text-base font-extrabold text-white font-display">
                {tasteProfile.count} Liked Film{tasteProfile.count > 1 ? 's' : ''} • Avg Rating {tasteProfile.avgRating.toFixed(1)} ★
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {tasteProfile.topGenres.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded-lg bg-[#050505] border border-[#262626] text-[10px] font-mono text-neutral-300">{g}</span>
                ))}
                <span className="px-2 py-0.5 rounded-lg bg-red-950 border border-red-800 text-[10px] font-mono text-red-300">
                  {tasteProfile.topLang === 'en' ? 'English' : tasteProfile.topLang === 'hi' ? 'Hindi' : tasteProfile.topLang === 'ta' ? 'Tamil' : tasteProfile.topLang.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 font-mono max-w-xs italic hidden sm:block">
            Content-based vector alignment using TF-IDF cosine similarity across genre, keyword, and cast features.
          </p>
        </div>
      ) : (
        <div id="for-you-section" className="bg-[#141414] border border-[#262626] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-[#262626] text-neutral-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white font-display">Build Your Taste Profile</p>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">Like movies below to activate personalized recommendations powered by content-based vector matching.</p>
          </div>
        </div>
      )}

      {/* AUDIENCE LAB VIEWER VOTING & CONCEPT DECISION SECTION */}
      <section id="audience-lab-section">
        <AudienceLabViewer user={user} />
      </section>

      {/* LIVE CINEMA INTELLIGENCE STREAM */}
      <section id="live-cinema-section">
        <LiveCinemaHub user={user} onToggleLike={onToggleLike} />
      </section>

      {/* 1. PRODUCER CONCEPT BATTLE CARD */}
      {battle && (
        <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                  Live Audience Decision Loop
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                  Producer Concept Battle — Which Would You Watch?
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-400 bg-[#050505] px-3 py-1 rounded-xl border border-[#262626]">
                {totalVotes} Audience Votes
              </span>
            </div>
          </div>

          {/* Low sample disclaimer */}
          {totalVotes < 10 && (
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-400 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong className="text-amber-300">Early Sample Warning:</strong> Only {totalVotes} audience vote{totalVotes !== 1 ? 's' : ''} recorded. Vote ratio data is not statistically reliable until at least 10 responses are collected. Blended scores may shift significantly with additional votes.
              </span>
            </div>
          )}

          {/* Signal Conflict Alert if ML & Audience Disagree */}
          {isSignalConflictA && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p>
                <strong>Signal Discrepancy Detected:</strong> Historical ML model predicts {(battle.conceptA.modelAProbability * 100).toFixed(0)}% performance for Concept A, while live audience votes show {(ratioA * 100).toFixed(0)}% preference.
              </p>
            </div>
          )}

          {/* Battle Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Concept A */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
              blendedA >= blendedB
                ? 'bg-[#181818] border-red-600/40 shadow-lg shadow-red-600/10'
                : 'bg-[#050505] border-[#262626]'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider">Concept A</span>
                  {blendedA >= blendedB && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E50914] text-white">
                      Leading Score
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-white font-display">{battle.conceptA.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{battle.conceptA.logline}</p>
                
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                  <span className="bg-[#050505] px-2 py-1 rounded border border-[#262626]">
                    Budget: ${(battle.conceptA.budget / 1000000).toFixed(0)}M
                  </span>
                  <span className="bg-[#050505] px-2 py-1 rounded border border-[#262626]">
                    Genres: {battle.conceptA.genres.join(', ')}
                  </span>
                </div>
              </div>

              {/* Transparent Score Breakdown */}
              <div className="pt-4 border-t border-[#262626] space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-[#050505] p-2 rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-neutral-400">ML Prob (60%)</p>
                    <p className="font-bold text-white mt-0.5">{(battle.conceptA.modelAProbability * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-[#050505] p-2 rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-neutral-400">Vote Ratio (40%)</p>
                    <p className="font-bold text-red-400 mt-0.5">{(ratioA * 100).toFixed(0)}%</p>
                    {totalVotes < 10 && <p className="text-[9px] text-neutral-500 mt-0.5">low sample</p>}
                  </div>
                  <div className="bg-[#050505] p-2 rounded-xl border border-red-600/30">
                    <p className="text-[10px] text-red-400 font-bold">Blended Score</p>
                    <p className="font-extrabold text-white mt-0.5">{(blendedA * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <button
                  onClick={() => handleVote('A')}
                  disabled={voting || hasVoted}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    hasVoted
                      ? 'bg-[#181818] text-neutral-400 cursor-not-allowed border border-[#262626]'
                      : 'bg-[#E50914] text-white hover:bg-[#B20710] shadow-md shadow-red-600/30'
                  }`}
                >
                  {hasVoted ? 'Vote Submitted' : 'Vote Concept A'}
                </button>
              </div>
            </div>

            {/* Concept B */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
              blendedB > blendedA
                ? 'bg-[#181818] border-red-600/40 shadow-lg shadow-red-600/10'
                : 'bg-[#050505] border-[#262626]'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider">Concept B</span>
                  {blendedB > blendedA && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E50914] text-white">
                      Leading Score
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-white font-display">{battle.conceptB.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{battle.conceptB.logline}</p>

                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400">
                  <span className="bg-[#050505] px-2 py-1 rounded border border-[#262626]">
                    Budget: ${(battle.conceptB.budget / 1000000).toFixed(0)}M
                  </span>
                  <span className="bg-[#050505] px-2 py-1 rounded border border-[#262626]">
                    Genres: {battle.conceptB.genres.join(', ')}
                  </span>
                </div>
              </div>

              {/* Transparent Score Breakdown */}
              <div className="pt-4 border-t border-[#262626] space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-[#050505] p-2 rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-neutral-400">ML Prob (60%)</p>
                    <p className="font-bold text-white mt-0.5">{(battle.conceptB.modelAProbability * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-[#050505] p-2 rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-neutral-400">Vote Ratio (40%)</p>
                    <p className="font-bold text-red-400 mt-0.5">{(ratioB * 100).toFixed(0)}%</p>
                    {totalVotes < 10 && <p className="text-[9px] text-neutral-500 mt-0.5">low sample</p>}
                  </div>
                  <div className="bg-[#050505] p-2 rounded-xl border border-red-600/30">
                    <p className="text-[10px] text-red-400 font-bold">Blended Score</p>
                    <p className="font-extrabold text-white mt-0.5">{(blendedB * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <button
                  onClick={() => handleVote('B')}
                  disabled={voting || hasVoted}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    hasVoted
                      ? 'bg-[#181818] text-neutral-400 cursor-not-allowed border border-[#262626]'
                      : 'bg-[#E50914] text-white hover:bg-[#B20710] shadow-md shadow-red-600/30'
                  }`}
                >
                  {hasVoted ? 'Vote Submitted' : 'Vote Concept B'}
                </button>
              </div>
            </div>

          </div>

          {/* Battle footnote */}
          <p className="text-center text-[10px] text-neutral-500 font-mono">
            Blended Score = 60% × ML Historical Probability + 40% × Live Audience Vote Ratio.
            {totalVotes < 10 && ' Insufficient audience data — scores will stabilize as more votes are collected.'}
          </p>

        </div>
      )}

      {/* 2. PERSONALIZED FEED ("FOR YOU" — TASTE VECTOR ENGINE) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight font-display">For You — Personalized Feed</h2>
              <p className="text-xs text-neutral-400">Content-based vector alignment matching your liked film profiles</p>
            </div>
          </div>

          <span className="text-xs font-mono text-neutral-400 bg-[#141414] px-3 py-1 rounded-xl border border-[#262626]">
            {(user?.likedMovieIds || []).length} Liked Movies Active
          </span>
        </div>

        {loadingForYou ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-[#141414] border border-[#262626] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : forYouFeed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forYouFeed.slice(0, 8).map(item => {
              const movieObj = item.movie || item;
              if (!movieObj || !movieObj.id) return null;
              return (
                <MovieCard
                  key={movieObj.id}
                  movie={movieObj}
                  isLiked={(user?.likedMovieIds || []).includes(movieObj.id)}
                  onToggleLike={onToggleLike}
                  reason={item.reason || item.match?.reasonText}
                  matchScore={item.matchScore || item.match?.matchScore}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-8 text-center">
            <Sparkles className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Like movies to activate your personalized feed</p>
            <p className="text-xs text-neutral-400 mt-1">Your recommendations will appear here based on genre, cast, and keyword alignment.</p>
          </div>
        )}
      </section>

      {/* 3. DISCOVER SIMILAR MOVIES & TRENDING GENRES */}
      <div id="discover-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Discover Similar Movies */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#141414] p-4 rounded-2xl border border-[#262626]">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-white font-display">Discover Similar Titles</h2>
            </div>

            {/* Reference Movie Picker Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400 font-mono">Reference:</label>
              <select
                value={selectedRefMovieId}
                onChange={(e) => setSelectedRefMovieId(Number(e.target.value))}
                className="bg-[#050505] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 max-w-xs truncate font-medium"
              >
                {(movies || []).slice(0, 40).map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.release_year})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingSimilar ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-[#141414] border border-[#262626] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarRecs.slice(0, 6).map(item => {
                const movieObj = item.movie || item;
                if (!movieObj || !movieObj.id) return null;
                return (
                  <MovieCard
                    key={movieObj.id}
                    movie={movieObj}
                    isLiked={(user?.likedMovieIds || []).includes(movieObj.id)}
                    onToggleLike={onToggleLike}
                    reason={item.reason || item.match?.reasonText}
                    matchScore={item.matchScore || item.match?.matchScore}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Trending Genres Sidebar Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
              <Flame className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-white font-display">Trending Genres</h2>
            </div>

            <div className="space-y-3">
              {trendingGenres.map((t, idx) => {
                const popScore = Number(t.score ?? t.avgPopularity ?? 0);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-neutral-200">{t.genre}</span>
                      <span className="font-mono text-red-400 font-bold">Pop: {popScore.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-[#262626]">
                      <div
                        className="bg-[#E50914] h-full rounded-full animate-bar-fill"
                        style={{ '--fill-width': `${Math.min(100, popScore * 2.2)}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 4. HIDDEN GEMS SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight font-display">Hidden Gems</h2>
              <p className="text-xs text-neutral-400">High-rating titles (&ge; 7.0) with lower commercial marketing exposure</p>
            </div>
          </div>

          {/* Quick Genre Filter Pills for Hidden Gems */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
            {['All', 'Science Fiction', 'Action', 'Drama', 'Thriller', 'Comedy'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGemGenre(g)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  gemGenre === g
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hiddenGems.slice(0, 4).map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isLiked={user.likedMovieIds.includes(movie.id)}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      </section>

      {/* 5. REGIONAL DISCOVERY — Cinema By Language */}
      {regionalRows.length > 0 && (
        <section id="regional-section" className="space-y-6 pt-6 border-t border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
              <Film className="w-4 h-4 reel-spin" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight font-display">Regional Cinema Discovery</h2>
              <p className="text-xs text-neutral-400">Explore top-rated titles from world cinema — within the available TMDB dataset</p>
            </div>
          </div>

          <div className="space-y-8">
            {regionalRows.map(row => (
              <ReelRow
                key={row.code}
                title={row.label}
                subtitle={`Top-rated ${row.label} cinema selections from the TMDB 5,000 dataset`}
                badge={`${row.movies.length} TITLES`}
              >
                {row.movies.map(movie => (
                  <div key={movie.id} className="snap-start flex-shrink-0 w-44 sm:w-56">
                    <PosterCard
                      movie={movie}
                      isLiked={user.likedMovieIds.includes(movie.id)}
                      onToggleLike={onToggleLike}
                    />
                  </div>
                ))}
              </ReelRow>
            ))}
          </div>
        </section>
      )}

      {/* 6. ACCESSIBLE CONTENT SECTION */}
      {accessibleMovies.length > 0 && (
        <section id="accessible-section" className="space-y-4 pt-6 border-t border-[#262626]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-display">Accessible Content</h2>
                <p className="text-xs text-neutral-400">
                  Multi-lingual titles with strong audience engagement (&ge; 200 votes, rating &ge; 6.5)
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-[#141414] border border-[#262626] rounded-xl text-[10px] font-mono text-neutral-400">
              Within available TMDB metadata • Accessibility data derived from language availability
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accessibleMovies.slice(0, 8).map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isLiked={user.likedMovieIds.includes(movie.id)}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. EXPLORE ALL TMDB TITLES (WITH SEARCH, FILTER, SORT, SKELETON & EMPTY STATE) */}
      <section id="explore-section" className="space-y-6 pt-6 border-t border-[#262626]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight font-display">Explore All TMDB Titles</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Search and filter the complete dataset of 4,800+ films</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, cast, or genre..."
                className="bg-[#141414] border border-[#262626] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 w-64 transition-all"
              />
            </div>

            {/* Genre Dropdown */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-red-600"
            >
              {genresList.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
              ))}
            </select>

            {/* Language Dropdown */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-red-600"
            >
              {languagesList.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

            {/* CineAccess Filter Pill */}
            <button
              type="button"
              onClick={() => setAccessibilityOnly(!accessibilityOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                accessibilityOnly
                  ? 'bg-[#E50914] text-white border-red-500 shadow-md'
                  : 'bg-[#141414] text-neutral-400 border-[#262626] hover:text-white'
              }`}
            >
              CineAccess Multi-Lingual
            </button>

            {/* Sort Selector Dropdown */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-red-600"
            >
              <option value="popularity">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="budget">Sort: Highest Budget</option>
              <option value="revenue">Sort: Highest Revenue</option>
              <option value="newest">Sort: Release Year</option>
            </select>
          </div>
        </div>

        {/* Quick Genre Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {genresList.slice(0, 9).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* RESULTS GRID / LOADING SKELETON / EMPTY STATE */}
        {filteredCatalog.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCatalog.slice(0, visibleCount).map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isLiked={user.likedMovieIds.includes(movie.id)}
                  onToggleLike={onToggleLike}
                  showProducerDetails={true}
                />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredCatalog.length && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 24)}
                  className="px-6 py-2.5 rounded-xl bg-[#141414] hover:bg-[#181818] text-neutral-200 border border-[#262626] font-bold text-xs transition-all shadow-md"
                >
                  Load More Titles ({filteredCatalog.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          /* Proper Empty State Card */
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <FilterX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">No movies match your filters</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Try clearing your search query or selecting a different genre filter.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#E50914] text-white hover:bg-[#B20710] rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

      </section>

    </div>
  );
};
