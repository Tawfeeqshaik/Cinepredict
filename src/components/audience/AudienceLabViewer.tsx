import React, { useState, useEffect } from 'react';
import { AudienceConceptTest, AudienceValidationAnalytics, UserProfile } from '../../types';
import { apiGetAudienceTests, apiVoteAudienceTest, apiGetAudienceAnalytics } from '../../services/api_client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Heart,
  Sparkles,
  Star,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Film,
  Clock,
  DollarSign,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface AudienceLabViewerProps {
  user: UserProfile;
}

export const AudienceLabViewer: React.FC<AudienceLabViewerProps> = ({ user }) => {
  const [tests, setTests] = useState<AudienceConceptTest[]>([]);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Voting form state for active test
  const [wouldWatch, setWouldWatch] = useState<'definitely' | 'maybe' | 'probably_not'>('definitely');
  const [interestLevel, setInterestLevel] = useState<number>(4);
  const [genreAppeal, setGenreAppeal] = useState<number>(4);
  const [expectedQuality, setExpectedQuality] = useState<number>(4);
  const [wouldRecommend, setWouldRecommend] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [feedbackText, setFeedbackText] = useState('');
  const [choiceAB, setChoiceAB] = useState<'A' | 'B'>('A');

  // Status
  const [votedTestIds, setVotedTestIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [recentAnalytics, setRecentAnalytics] = useState<Record<string, AudienceValidationAnalytics>>({});

  useEffect(() => {
    async function loadTests() {
      try {
        const fetched = await apiGetAudienceTests();
        setTests(fetched);
      } catch (err) {
        console.error('Failed to load audience tests for viewer:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  const currentTest = tests[activeTestIndex];

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTest || submitting) return;

    setSubmitting(true);
    try {
      const votePayload = {
        viewerUsername: user.username,
        wouldWatch,
        interestLevel,
        genreAppeal,
        expectedQuality,
        wouldRecommend,
        feedbackText: feedbackText.trim() || undefined,
        choiceAB: currentTest.isABTest || currentTest.decisionTest ? choiceAB : undefined,
        preferredGenre: currentTest.genres[0] || 'Science Fiction'
      };

      const result = await apiVoteAudienceTest(currentTest.id, votePayload);
      if (result.success) {
        setVotedTestIds([...votedTestIds, currentTest.id]);
        setRecentAnalytics({
          ...recentAnalytics,
          [currentTest.id]: result.analytics
        });
      }
    } catch (err) {
      console.error('Failed to submit viewer response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-[#141414] border border-[#262626] rounded-3xl animate-pulse">
        <Vote className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-bold text-white">Loading Audience Lab Concepts...</p>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="p-8 text-center bg-[#141414] border border-[#262626] rounded-3xl space-y-3">
        <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Concepts Currently in Audience Lab</h3>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          Producers will publish new original movie premises and A/B creative tests here for audience feedback.
        </p>
      </div>
    );
  }

  const hasVoted = votedTestIds.includes(currentTest?.id || '');
  const testAnalytics = recentAnalytics[currentTest?.id || ''];

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. VIEWER AUDIENCE LAB HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141414] p-6 rounded-3xl border border-[#262626] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                Audience Decision Lab
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[9px] font-mono">
                {tests.length} Active Concepts
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Vote on Upcoming Film Concepts
            </h2>
            <p className="text-xs text-neutral-400">
              Your votes directly guide filmmakers on story premises, runtime pacing, and titles before production starts.
            </p>
          </div>
        </div>

        {/* Concept Carousel Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {tests.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveTestIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTestIndex === idx
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'bg-[#050505] text-neutral-400 hover:text-white border border-[#262626]'
              }`}
            >
              {votedTestIds.includes(t.id) && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
              <span>Concept #{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. ACTIVE CONCEPT CARD & INDEPENDENT VOTING PANEL */}
      {currentTest && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Cinematic Concept Showcase Card (Col 6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#141414] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
              
              {/* Concept Artwork Header */}
              <div className="relative aspect-[16/9] w-full bg-[#050505] overflow-hidden">
                <img
                  src={currentTest.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'}
                  alt={currentTest.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/60 pointer-events-none" />
                
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-xl text-[10px] font-mono text-red-400 border border-red-900/40">
                    Producer: {currentTest.producerUsername}
                  </span>
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-xl text-[10px] font-mono text-neutral-300 border border-[#262626]">
                    {currentTest.releasePeriod}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {currentTest.genres.map((g, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-950/80 text-red-400 rounded-md text-[10px] font-mono border border-red-800/60">
                        {g}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-extrabold text-white font-display leading-tight">{currentTest.title}</h3>
                </div>
              </div>

              {/* Concept Synopsis & Creative Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1">Story Logline</p>
                  <p className="text-sm text-neutral-200 leading-relaxed font-sans">{currentTest.synopsis}</p>
                </div>

                {/* Key Metrics Strip (Independent - No Model Probability Shown) */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#262626] text-center text-xs">
                  <div className="p-2.5 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-500">RUNTIME</p>
                    <p className="font-bold text-white mt-0.5">{currentTest.runtime} mins</p>
                  </div>
                  <div className="p-2.5 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-500">SCALE</p>
                    <p className="font-bold text-red-400 mt-0.5">${(currentTest.targetBudget / 1000000).toFixed(0)}M Budget</p>
                  </div>
                  <div className="p-2.5 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-500">DIRECTOR</p>
                    <p className="font-bold text-neutral-200 mt-0.5 truncate">{currentTest.director || 'Studio Lead'}</p>
                  </div>
                </div>

                {/* Privacy disclaimer */}
                <p className="text-[10px] text-neutral-500 font-mono text-center">
                  🔒 Anonymous viewer responses are aggregated for market validation.
                </p>
              </div>

            </div>
          </div>

          {/* Right: Interactive Structured Voting Experience (Col 6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Vote className="w-4 h-4 text-red-500" />
                  <span>Audience Feedback Form</span>
                </h3>
                {hasVoted && (
                  <span className="px-3 py-1 bg-green-950 text-green-400 border border-green-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vote Recorded
                  </span>
                )}
              </div>

              {!hasVoted ? (
                <form onSubmit={handleVoteSubmit} className="space-y-5 text-xs">
                  
                  {/* Question 1: Would you watch this? */}
                  <div className="space-y-2">
                    <label className="block font-mono text-neutral-300 uppercase tracking-wider font-bold">
                      1. Would you watch this movie? *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setWouldWatch('definitely')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          wouldWatch === 'definitely'
                            ? 'bg-[#E50914] text-white border-red-500 font-bold shadow-lg shadow-red-600/30 scale-102'
                            : 'bg-[#050505] text-neutral-300 border-[#262626] hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-base">❤️</span>
                        <span className="text-[11px]">Definitely</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWouldWatch('maybe')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          wouldWatch === 'maybe'
                            ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-lg scale-102'
                            : 'bg-[#050505] text-neutral-300 border-[#262626] hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-base">🤔</span>
                        <span className="text-[11px]">Maybe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWouldWatch('probably_not')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          wouldWatch === 'probably_not'
                            ? 'bg-neutral-800 text-white border-neutral-600 font-bold scale-102'
                            : 'bg-[#050505] text-neutral-300 border-[#262626] hover:border-neutral-700'
                        }`}
                      >
                        <span className="text-base">❌</span>
                        <span className="text-[11px]">Probably Not</span>
                      </button>
                    </div>
                  </div>

                  {/* Question 2: Overall Interest Level (1-5) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-mono text-neutral-300 uppercase tracking-wider font-bold">
                        2. Interest Level:
                      </label>
                      <span className="font-mono text-red-400 font-bold">{interestLevel} / 5 Stars</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setInterestLevel(star)}
                          className={`flex-1 py-2.5 rounded-xl border text-center font-mono font-bold transition-all cursor-pointer ${
                            interestLevel >= star
                              ? 'bg-[#E50914] text-white border-red-500 shadow-md'
                              : 'bg-[#050505] text-neutral-500 border-[#262626]'
                          }`}
                        >
                          ★ {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* A/B Variation Choice if A/B Test */}
                  {currentTest.isABTest && currentTest.variationB && (
                    <div className="space-y-2 p-3.5 bg-[#050505] rounded-2xl border border-[#262626]">
                      <label className="block font-mono text-red-400 uppercase tracking-wider font-bold">
                        A/B Creative Choice: Which version do you prefer?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setChoiceAB('A')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            choiceAB === 'A'
                              ? 'bg-red-950/60 border-red-600 text-white font-bold'
                              : 'bg-[#141414] border-[#262626] text-neutral-400'
                          }`}
                        >
                          <p className="text-[11px] font-mono text-red-400">OPTION A</p>
                          <p className="text-xs text-white font-semibold mt-0.5">{currentTest.title} ({currentTest.runtime}m)</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setChoiceAB('B')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            choiceAB === 'B'
                              ? 'bg-red-950/60 border-red-600 text-white font-bold'
                              : 'bg-[#141414] border-[#262626] text-neutral-400'
                          }`}
                        >
                          <p className="text-[11px] font-mono text-red-400">OPTION B</p>
                          <p className="text-xs text-white font-semibold mt-0.5">{currentTest.variationB.title} ({currentTest.variationB.runtime}m)</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Decision Lab Choice if Decision Test */}
                  {currentTest.decisionTest && (
                    <div className="space-y-2 p-3.5 bg-[#050505] rounded-2xl border border-[#262626]">
                      <label className="block font-mono text-red-400 uppercase tracking-wider font-bold">
                        {currentTest.decisionTest.questionTitle}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setChoiceAB('A')}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            choiceAB === 'A'
                              ? 'bg-red-950/60 border-red-600 text-white font-bold'
                              : 'bg-[#141414] border-[#262626] text-neutral-400'
                          }`}
                        >
                          <span className="text-xs text-white">{currentTest.decisionTest.optionA}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChoiceAB('B')}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            choiceAB === 'B'
                              ? 'bg-red-950/60 border-red-600 text-white font-bold'
                              : 'bg-[#141414] border-[#262626] text-neutral-400'
                          }`}
                        >
                          <span className="text-xs text-white">{currentTest.decisionTest.optionB}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Optional Feedback */}
                  <div className="space-y-1">
                    <label className="block font-mono text-neutral-400 uppercase">
                      What would make you more interested? (Optional)
                    </label>
                    <input
                      type="text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="e.g. Needs more practical stunts or darker tone..."
                      className="w-full p-2.5 bg-[#050505] border border-[#262626] rounded-xl text-white focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#E50914] hover:bg-[#B20710] text-white font-extrabold rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {submitting ? (
                      <span>Recording Vote...</span>
                    ) : (
                      <>
                        <span>Submit Audience Feedback</span>
                        <Vote className="w-4 h-4" />
                      </>
                    )}
                  </button>

                </form>
              ) : (
                /* Post-Vote Confirmation & Community Pulse */
                <div className="space-y-5 text-center py-4">
                  <div className="w-14 h-14 bg-green-600/20 border border-green-600/40 text-green-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-600/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Thank You for Your Feedback!</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Your vote has been recorded anonymously into the concept validation loop.
                    </p>
                  </div>

                  {testAnalytics && (
                    <div className="p-4 bg-[#050505] border border-[#262626] rounded-2xl space-y-3 text-left">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                        Live Community Sentiment ({testAnalytics.totalResponses} Votes)
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-[#141414] rounded-xl">
                          <p className="text-[10px] text-neutral-400">Definitely</p>
                          <p className="font-bold text-white mt-0.5">{testAnalytics.definitelyPercentage}%</p>
                        </div>
                        <div className="p-2 bg-[#141414] rounded-xl">
                          <p className="text-[10px] text-neutral-400">Average</p>
                          <p className="font-bold text-red-400 mt-0.5">{testAnalytics.avgInterestScore}/5</p>
                        </div>
                        <div className="p-2 bg-[#141414] rounded-xl">
                          <p className="text-[10px] text-neutral-400">Audience Score</p>
                          <p className="font-bold text-green-400 mt-0.5">{testAnalytics.audienceInterestPercentage}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (activeTestIndex < tests.length - 1) {
                        setActiveTestIndex(activeTestIndex + 1);
                      } else {
                        setActiveTestIndex(0);
                      }
                    }}
                    className="px-6 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] text-neutral-200 border border-[#262626] font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Vote on Next Concept →
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
