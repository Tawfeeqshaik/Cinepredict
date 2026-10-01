import React, { useState, useEffect } from 'react';
import {
  AudienceConceptTest,
  AudienceValidationAnalytics,
  ProducerTrackedProject,
  ConceptVersionRecord
} from '../../types';
import {
  apiGetAudienceTests,
  apiCreateAudienceTest,
  apiGetAudienceAnalytics,
  apiGetProducerProjects,
  apiSaveProducerProject
} from '../../services/api_client';
import { CountUp } from '../ui/CountUp';
import { Reveal } from '../motion/Reveal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  Layers,
  BarChart3,
  Sliders,
  Film,
  Users,
  ShieldCheck,
  Zap,
  RotateCcw,
  MessageSquare
} from 'lucide-react';

interface AudienceLabProducerProps {
  onOpenWhatIf?: (conceptData: { title: string; budget: number; runtime: number; genres: string[]; releaseMonth: number }) => void;
}

export const AudienceLabProducer: React.FC<AudienceLabProducerProps> = ({ onOpenWhatIf }) => {
  const [tests, setTests] = useState<AudienceConceptTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AudienceValidationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  // Projects store
  const [projects, setProjects] = useState<ProducerTrackedProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newGenres, setNewGenres] = useState<string[]>(['Science Fiction', 'Action']);
  const [newRuntime, setNewRuntime] = useState<number>(128);
  const [newBudget, setNewBudget] = useState<number>(85000000);
  const [newLanguage, setNewLanguage] = useState('en');
  const [newReleasePeriod, setNewReleasePeriod] = useState('Summer 2026');
  const [newDirector, setNewDirector] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  
  // A/B Test toggle
  const [isABTest, setIsABTest] = useState(false);
  const [varBTitle, setVarBTitle] = useState('');
  const [varBSynopsis, setVarBSynopsis] = useState('');
  const [varBRuntime, setVarBRuntime] = useState<number>(115);
  const [varBBudget, setVarBBudget] = useState<number>(75000000);
  const [varBGenres, setVarBGenres] = useState<string[]>(['Science Fiction', 'Action', 'Thriller']);

  // Decision Lab toggle
  const [isDecisionTest, setIsDecisionTest] = useState(false);
  const [decisionType, setDecisionType] = useState<'title' | 'poster' | 'runtime' | 'positioning'>('title');
  const [decisionQ, setDecisionQ] = useState('Which title has stronger theatrical appeal?');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedTests, fetchedProjects] = await Promise.all([
        apiGetAudienceTests(),
        apiGetProducerProjects()
      ]);
      setTests(fetchedTests);
      setProjects(fetchedProjects);
      if (fetchedTests.length > 0 && !selectedTestId) {
        setSelectedTestId(fetchedTests[0].id);
        const an = await apiGetAudienceAnalytics(fetchedTests[0].id);
        setAnalytics(an);
      }
      if (fetchedProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(fetchedProjects[0].id);
      }
    } catch (err) {
      console.error('Failed to load Audience Lab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectTest = async (id: string) => {
    setSelectedTestId(id);
    try {
      const an = await apiGetAudienceAnalytics(id);
      setAnalytics(an);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSynopsis.trim()) return;

    try {
      const testPayload: any = {
        title: newTitle,
        synopsis: newSynopsis,
        genres: newGenres,
        runtime: newRuntime,
        targetBudget: newBudget,
        language: newLanguage,
        releasePeriod: newReleasePeriod,
        director: newDirector,
        posterUrl: newPosterUrl || undefined,
        isABTest
      };

      if (isABTest) {
        testPayload.variationB = {
          title: varBTitle || `${newTitle} (Variation B)`,
          synopsis: varBSynopsis || newSynopsis,
          genres: varBGenres,
          runtime: varBRuntime,
          targetBudget: varBBudget
        };
      }

      if (isDecisionTest) {
        testPayload.decisionTest = {
          testType: decisionType,
          questionTitle: decisionQ,
          optionA: optionA || 'Option A',
          optionB: optionB || 'Option B'
        };
      }

      const created = await apiCreateAudienceTest(testPayload);
      setIsCreatingTest(false);
      await loadData();
      if (created) {
        handleSelectTest(created.id);
      }
    } catch (err) {
      console.error('Failed to create test:', err);
    }
  };

  const activeTest = tests.find(t => t.id === selectedTestId);
  const activeProject = projects.find(p => p.id === selectedProjectId);

  const availableGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Mystery',
    'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. SIGNATURE PREDICTION LOOP EXPLANATION HERO */}
      <div className="relative bg-[#141414]/90 backdrop-blur-xl border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 border-b border-[#262626] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-mono font-bold uppercase tracking-wider">
              <Vote className="w-3.5 h-3.5 animate-pulse" />
              <span>Audience Lab • Producer Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Test Concepts With Real Viewers Before Production
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Validate original premises, test A/B creative variants, resolve audience signal divergence, and connect feedback directly into the What-If Success Optimizer.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsCreatingTest(true)}
            className="px-5 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Concept Test</span>
          </motion.button>
        </div>

        {/* Closed Loop Visual Indicator */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px] font-mono">
          {[
            { step: '1. PREDICT', label: 'Historical Prior', icon: BarChart3 },
            { step: '2. TEST', label: 'Publish to Lab', icon: Vote },
            { step: '3. LISTEN', label: 'Audience Votes', icon: Users },
            { step: '4. OPTIMIZE', label: 'What-If Loop', icon: Sliders },
            { step: '5. RELEASE', label: 'Market Debut', icon: Film },
            { step: '6. TRACK', label: 'Live Signals', icon: TrendingUp },
            { step: '7. LEARN', label: 'Outcome Audit', icon: ShieldCheck }
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 bg-[#050505]/80 border border-[#262626] rounded-xl flex flex-col items-center gap-1">
              <item.icon className="w-3.5 h-3.5 text-red-500" />
              <span className="font-bold text-white">{item.step}</span>
              <span className="text-neutral-500 text-[9px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ACTIVE CONCEPT TESTS SELECTOR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider whitespace-nowrap pl-1">
          Active Tests:
        </span>
        {tests.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelectTest(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              selectedTestId === t.id
                ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
                : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
            }`}
          >
            <span>{t.title}</span>
            {t.isABTest && <span className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">A/B</span>}
            {t.decisionTest && <span className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-mono">Decision</span>}
          </button>
        ))}
      </div>

      {/* 3. SIGNATURE "MODEL ↔ AUDIENCE" CARD & VALIDATION ANALYTICS */}
      {analytics && activeTest && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Signature Card (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SIGNATURE MODEL ↔ AUDIENCE COMPARISON CARD */}
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
                    <GitCompare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                      Signature Intelligence Metric
                    </span>
                    <h2 className="text-xl font-extrabold text-white font-display">
                      Model ↔ Audience Divergence
                    </h2>
                  </div>
                </div>

                <span className="text-xs font-mono text-neutral-400 bg-[#050505] px-3 py-1 rounded-xl border border-[#262626]">
                  {analytics.totalResponses} Verified Responses
                </span>
              </div>

              {/* Core 3-Way Metrics Block */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-[#050505] border border-[#262626] rounded-2xl">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">Historical Model</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                    <CountUp value={analytics.modelAProbability} suffix="%" />
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Pre-Release Prior</p>
                </div>

                <div className="p-4 bg-[#050505] border border-red-600/30 rounded-2xl">
                  <p className="text-[10px] font-mono text-red-400 font-bold uppercase">Audience Interest</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-red-400 mt-1 font-display">
                    <CountUp value={analytics.audienceInterestPercentage} suffix="%" />
                  </p>
                  <p className="text-[10px] text-red-500/80 font-mono mt-0.5">Live Viewer Signal</p>
                </div>

                <div className="p-4 bg-[#050505] border border-[#262626] rounded-2xl">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">Divergence Delta</p>
                  <p className={`text-2xl sm:text-3xl font-extrabold mt-1 font-display ${
                    analytics.divergencePoints >= 0 ? 'text-green-400' : 'text-amber-400'
                  }`}>
                    {analytics.divergencePoints >= 0 ? `+${analytics.divergencePoints}` : analytics.divergencePoints} pts
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Model vs Audience</p>
                </div>
              </div>

              {/* Neutral Evidence-Based Interpretation */}
              <div className="p-4 bg-[#050505] border border-[#262626] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span>INTELLIGENCE INTERPRETATION:</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {analytics.divergenceInterpretation}
                </p>
              </div>

              {/* Sample Reliability Alert */}
              {analytics.sampleReliabilityWarning && (
                <div className="p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-2xl text-xs text-amber-300 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{analytics.sampleReliabilityWarning}</span>
                </div>
              )}

              {/* Structured Vote Breakdown */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Audience Conversion Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-neutral-400 text-[10px]">Definitely Watch</p>
                    <p className="text-base font-bold text-white mt-1">{analytics.definitelyPercentage}%</p>
                  </div>
                  <div className="p-3 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-neutral-400 text-[10px]">Maybe</p>
                    <p className="text-base font-bold text-neutral-300 mt-1">{analytics.maybePercentage}%</p>
                  </div>
                  <div className="p-3 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-neutral-400 text-[10px]">Probably Not</p>
                    <p className="text-base font-bold text-neutral-400 mt-1">{analytics.probablyNotPercentage}%</p>
                  </div>
                </div>
              </div>

            </div>

            {/* A/B TEST COMPARISON CARD (IF A/B TEST) */}
            {analytics.abTestComparison && activeTest.variationB && (
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center font-bold">
                      A/B
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">Concept A/B Test Results</h3>
                      <p className="text-xs text-neutral-400">Independent viewer voting &amp; historical model comparison</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/40 rounded-xl text-xs font-mono font-bold">
                    Winner: Option {analytics.abTestComparison.winner} (+{analytics.abTestComparison.deltaPoints} pts)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A */}
                  <div className={`p-4 rounded-2xl border ${
                    analytics.abTestComparison.winner === 'A' ? 'bg-[#181818] border-red-600/40' : 'bg-[#050505] border-[#262626]'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Concept A (Original)</span>
                      <span className="text-xs font-bold text-white font-mono">{analytics.abTestComparison.preferenceA}% Preference</span>
                    </div>
                    <p className="text-sm font-bold text-white mt-1">{activeTest.title}</p>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{activeTest.synopsis}</p>
                    <div className="mt-3 pt-3 border-t border-[#262626] flex justify-between text-[11px] font-mono text-neutral-400">
                      <span>Runtime: {activeTest.runtime}m</span>
                      <span>Model: {analytics.abTestComparison.modelA}%</span>
                    </div>
                  </div>

                  {/* Option B */}
                  <div className={`p-4 rounded-2xl border ${
                    analytics.abTestComparison.winner === 'B' ? 'bg-[#181818] border-red-600/40' : 'bg-[#050505] border-[#262626]'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Concept B (Variation)</span>
                      <span className="text-xs font-bold text-white font-mono">{analytics.abTestComparison.preferenceB}% Preference</span>
                    </div>
                    <p className="text-sm font-bold text-white mt-1">{activeTest.variationB.title}</p>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{activeTest.variationB.synopsis}</p>
                    <div className="mt-3 pt-3 border-t border-[#262626] flex justify-between text-[11px] font-mono text-neutral-400">
                      <span>Runtime: {activeTest.variationB.runtime}m</span>
                      <span>Model: {analytics.abTestComparison.modelB}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIENCE DECISION LAB CARD (IF CREATIVE DECISION TEST) */}
            {analytics.decisionTestResult && activeTest.decisionTest && (
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <h3 className="text-lg font-bold text-white font-display">Creative Decision Lab</h3>
                  <span className="text-xs font-mono text-red-400">
                    Winner: Option {analytics.decisionTestResult.winner}
                  </span>
                </div>
                <p className="text-xs text-neutral-300">{activeTest.decisionTest.questionTitle}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase">Option A</p>
                    <p className="text-sm font-bold text-white mt-0.5">{activeTest.decisionTest.optionA}</p>
                    <p className="text-xs font-mono text-red-400 mt-2 font-bold">{analytics.decisionTestResult.percentA}% ({analytics.decisionTestResult.votesA} votes)</p>
                  </div>
                  <div className="p-3.5 bg-[#050505] rounded-xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase">Option B</p>
                    <p className="text-sm font-bold text-white mt-0.5">{activeTest.decisionTest.optionB}</p>
                    <p className="text-xs font-mono text-red-400 mt-2 font-bold">{analytics.decisionTestResult.percentB}% ({analytics.decisionTestResult.votesB} votes)</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Producer Feedback Center & What-If Optimizer Loop (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* PRODUCER FEEDBACK CENTER */}
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Producer Feedback Center</h3>
                  <p className="text-[11px] text-neutral-400">Aggregated audience signals &amp; concerns</p>
                </div>
              </div>

              {/* Positive Signals */}
              <div className="space-y-2">
                <p className="text-[11px] font-mono font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Top Positive Signals
                </p>
                <div className="space-y-1.5">
                  {analytics.topPositiveSignals.map((sig, i) => (
                    <div key={i} className="p-2.5 bg-[#050505] border border-[#262626] rounded-xl text-xs text-neutral-300">
                      {sig}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Concerns */}
              <div className="space-y-2">
                <p className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Top Audience Concerns
                </p>
                <div className="space-y-1.5">
                  {analytics.topConcerns.map((con, i) => (
                    <div key={i} className="p-2.5 bg-[#050505] border border-[#262626] rounded-xl text-xs text-neutral-300">
                      {con}
                    </div>
                  ))}
                </div>
              </div>

              {/* AUDIENCE FEEDBACK → WHAT-IF LOOP CTA */}
              <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-2xl space-y-3">
                <p className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Recommended Experiment
                </p>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {analytics.recommendedExperiment}
                </p>
                {onOpenWhatIf && (
                  <button
                    onClick={() => {
                      onOpenWhatIf({
                        title: activeTest.title,
                        budget: activeTest.targetBudget,
                        runtime: activeTest.runtime,
                        genres: activeTest.genres,
                        releaseMonth: 7
                      });
                    }}
                    className="w-full py-2.5 bg-[#E50914] hover:bg-[#B20710] text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Launch in What-If Optimizer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

            {/* CONCEPT VERSION HISTORY */}
            {activeProject && (
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-500" />
                    <h3 className="text-base font-bold text-white font-display">Concept Evolution History</h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 bg-[#050505] px-2 py-0.5 rounded border border-[#262626]">
                    {activeProject.versions.length} Iterations
                  </span>
                </div>

                <div className="space-y-3">
                  {activeProject.versions.map((ver, idx) => (
                    <div key={idx} className="p-3.5 bg-[#050505] border border-[#262626] rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-red-400 text-[11px]">VERSION {ver.versionNumber}</span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-white">{ver.title}</p>
                      <p className="text-[11px] text-neutral-400">{ver.changeNote}</p>
                      <div className="pt-1.5 flex justify-between text-[10px] font-mono text-neutral-500 border-t border-[#262626]">
                        <span>Model: {ver.modelAProbability}%</span>
                        <span>Audience: {ver.audienceInterest || 'N/A'}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* 4. MODAL: CREATE CONCEPT TEST */}
      <AnimatePresence>
        {isCreatingTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E50914] text-white flex items-center justify-center">
                    <Vote className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white font-display">Create Audience Concept Test</h2>
                    <p className="text-xs text-neutral-400">Publish your project to real CinePredict viewers for structured validation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreatingTest(false)}
                  className="p-2 text-neutral-400 hover:text-white rounded-xl bg-[#050505]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                
                {/* Title */}
                <div>
                  <label className="block font-mono text-neutral-400 uppercase mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Project Phoenix"
                    required
                    className="w-full p-2.5 bg-[#050505] border border-[#262626] rounded-xl text-white focus:border-red-600 focus:outline-none"
                  />
                </div>

                {/* Synopsis */}
                <div>
                  <label className="block font-mono text-neutral-400 uppercase mb-1">Synopsis / Logline *</label>
                  <textarea
                    value={newSynopsis}
                    onChange={(e) => setNewSynopsis(e.target.value)}
                    placeholder="Brief 2-3 sentence overview of the premise..."
                    rows={3}
                    required
                    className="w-full p-2.5 bg-[#050505] border border-[#262626] rounded-xl text-white focus:border-red-600 focus:outline-none resize-none"
                  />
                </div>

                {/* Runtime & Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-neutral-400 uppercase mb-1">Target Budget ($)</label>
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(Number(e.target.value))}
                      step={5000000}
                      className="w-full p-2.5 bg-[#050505] border border-[#262626] rounded-xl text-white focus:border-red-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-neutral-400 uppercase mb-1">Estimated Runtime (mins)</label>
                    <input
                      type="number"
                      value={newRuntime}
                      onChange={(e) => setNewRuntime(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#050505] border border-[#262626] rounded-xl text-white focus:border-red-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <label className="block font-mono text-neutral-400 uppercase mb-1">Select Primary Genres</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableGenres.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          if (newGenres.includes(g)) {
                            setNewGenres(newGenres.filter(x => x !== g));
                          } else {
                            setNewGenres([...newGenres, g]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          newGenres.includes(g)
                            ? 'bg-[#E50914] text-white font-bold'
                            : 'bg-[#050505] text-neutral-400 border border-[#262626]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* A/B Test Option */}
                <div className="pt-2 border-t border-[#262626]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Enable Concept A/B Testing</p>
                      <p className="text-[11px] text-neutral-400">Test two variations (e.g. Action vs Action-Comedy or 140m vs 118m)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isABTest}
                      onChange={(e) => setIsABTest(e.target.checked)}
                      className="w-4 h-4 accent-red-600 rounded"
                    />
                  </div>

                  {isABTest && (
                    <div className="mt-3 p-3 bg-[#050505] border border-[#262626] rounded-xl space-y-3">
                      <p className="text-[11px] font-mono text-red-400 font-bold uppercase">Variation B Details</p>
                      <input
                        type="text"
                        value={varBTitle}
                        onChange={(e) => setVarBTitle(e.target.value)}
                        placeholder="Variation B Title"
                        className="w-full p-2 bg-[#141414] border border-[#262626] rounded-lg text-white"
                      />
                      <textarea
                        value={varBSynopsis}
                        onChange={(e) => setVarBSynopsis(e.target.value)}
                        placeholder="Variation B Synopsis / Different Tone"
                        rows={2}
                        className="w-full p-2 bg-[#141414] border border-[#262626] rounded-lg text-white resize-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={varBRuntime}
                          onChange={(e) => setVarBRuntime(Number(e.target.value))}
                          placeholder="Var B Runtime"
                          className="p-2 bg-[#141414] border border-[#262626] rounded-lg text-white font-mono"
                        />
                        <input
                          type="number"
                          value={varBBudget}
                          onChange={(e) => setVarBBudget(Number(e.target.value))}
                          placeholder="Var B Budget"
                          className="p-2 bg-[#141414] border border-[#262626] rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-[#262626] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTest(false)}
                    className="px-4 py-2.5 bg-[#050505] text-neutral-400 rounded-xl hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#E50914] hover:bg-[#B20710] text-white font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2"
                  >
                    <span>Publish to Audience Lab</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
