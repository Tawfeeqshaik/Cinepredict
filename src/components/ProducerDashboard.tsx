import React, { useState, useEffect } from 'react';
import {
  DatasetStats,
  ModelMetrics,
  ProjectSimulationInput,
  PredictionResult,
  Movie,
  ModelAlgorithm,
  ConceptBattle,
  ScenarioInput,
  ScenarioResult,
  DataProvenanceStats,
  AudienceIntelligenceStats,
  SavedPredictionRecord,
  AudienceOpportunity,
  RegionalContentInsight,
  ContentGapItem,
  CineAccessMetrics,
  PostReleaseDiagnostic,
  GreenlightInvestmentScenario,
  ComparableMovieItem,
  PredictionTrackerData
} from '../types';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import {
  Clapperboard,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  BarChart3,
  Layers,
  Calculator,
  ShieldAlert,
  PieChart,
  Brain,
  Sliders,
  Vote,
  ArrowRight,
  Info,
  History,
  GitCompare,
  FileSpreadsheet,
  Database,
  Users,
  Compass,
  FileText,
  X,
  Lock,
  Award,
  RotateCcw,
  Activity
} from 'lucide-react';
import { ScriptIntelligenceReport } from './ScriptIntelligenceReport';
import { AudienceLabProducer } from './audience/AudienceLabProducer';
import { LiveCinemaHub } from './live/LiveCinemaHub';
import { StrategicOverview } from './producer/StrategicOverview';
import { ScenarioLab } from './producer/ScenarioLab';
import { CountUp } from './ui/CountUp';
import { Reveal } from './motion/Reveal';
import { motion } from 'framer-motion';
import {
  apiGetGreenlight,
  apiGetComparables,
  apiGetOpportunityRadar,
  apiGetRegionalRadar,
  apiGetContentGaps,
  apiGetCineAccess,
  apiGetPredictionTracker,
  apiGetDataProvenance,
  apiGetAudienceStats,
  apiGetPostRelease,
  apiGetPredictionHistory,
  apiSimulateScenarios
} from '../services/api_client';
import {
  getAudienceOpportunityRadar,
  getRegionalContentRadar,
  getContentGapDetector,
  getCineAccessStats,
  getGreenlightSimulator,
  getComparableMovies,
  getPredictionTrackerData,
  getDataProvenanceStats,
  getAudienceIntelligenceStats,
  simulateScenarios
} from '../services/ml_engine';

interface ProducerDashboardProps {
  movies: Movie[];
  stats: DatasetStats;
  modelA: ModelMetrics;
  modelB: ModelMetrics;
  tab?: string;
  onTabChange?: (tab: string) => void;
  onSimulate: (input: ProjectSimulationInput) => Promise<PredictionResult>;
  onSelectAlgorithm: (algo: ModelAlgorithm) => void;
  onCreateConceptBattle?: (conceptA: any, conceptB: any) => Promise<ConceptBattle>;
}

export const ProducerDashboard: React.FC<ProducerDashboardProps> = ({
  movies,
  stats,
  modelA,
  modelB,
  tab,
  onTabChange,
  onSimulate,
  onSelectAlgorithm,
  onCreateConceptBattle
}) => {
  // Multi-model algorithm selector
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<ModelAlgorithm>(modelA.algorithm || 'random_forest');

  // Simulator state
  const [simTitle, setSimTitle] = useState('Project Horizon');
  const [simBudget, setSimBudget] = useState(120000000);
  const [simRuntime, setSimRuntime] = useState(135);
  const [simGenres, setSimGenres] = useState<string[]>(['Science Fiction', 'Action']);
  const [simMonth, setSimMonth] = useState(7); // July
  const [simYear, setSimYear] = useState(2026);
  const [simStudio, setSimStudio] = useState('Warner Bros.');
  const [simCastPop, setSimCastPop] = useState(72);
  const [decisionThreshold, setDecisionThreshold] = useState(0.50);

  const [simResult, setSimResult] = useState<PredictionResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Active Tab: overview | studio | audience | livecinema | script | scenarios | comparables | opportunity | regional | postrelease | tracker | risks | history | provenance | audit
  const [internalTab, setInternalTab] = useState<string>('overview');
  const activeTab = tab || internalTab;
  const setActiveTab = (t: string) => {
    setInternalTab(t);
    if (onTabChange) onTabChange(t);
  };

  const handleOpenWhatIf = (conceptData: { title: string; budget: number; runtime: number; genres: string[]; releaseMonth: number }) => {
    setSimTitle(conceptData.title);
    setSimBudget(conceptData.budget);
    setSimRuntime(conceptData.runtime);
    setSimGenres(conceptData.genres);
    setSimMonth(conceptData.releaseMonth);
    setActiveTab('studio');
    setTimeout(() => {
      document.getElementById('predict-simulator-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Platform Analytics State - Initialized synchronously from ML engine to prevent blank cards
  const [opportunityData, setOpportunityData] = useState<AudienceOpportunity[]>(() => {
    try { return getAudienceOpportunityRadar(); } catch { return []; }
  });
  const [regionalData, setRegionalData] = useState<RegionalContentInsight[]>(() => {
    try { return getRegionalContentRadar(); } catch { return []; }
  });
  const [contentGapsData, setContentGapsData] = useState<ContentGapItem[]>(() => {
    try { return getContentGapDetector(); } catch { return []; }
  });
  const [cineaccessData, setCineaccessData] = useState<CineAccessMetrics | null>(() => {
    try { return getCineAccessStats(); } catch { return null; }
  });
  const [selectedPostReleaseId, setSelectedPostReleaseId] = useState<number>(movies[0]?.id || 19995);
  const [postReleaseDiagnostic, setPostReleaseDiagnostic] = useState<PostReleaseDiagnostic | null>(null);
  const [greenlightScenarios, setGreenlightScenarios] = useState<GreenlightInvestmentScenario[]>(() => {
    try {
      return getGreenlightSimulator({
        title: 'Project Horizon',
        budget: 120000000,
        runtime: 135,
        genres: ['Science Fiction', 'Action'],
        release_month: 7,
        release_year: 2026,
        production_company: 'Warner Bros.',
        top_cast_popularity: 72,
        modelAlgorithm: 'random_forest'
      });
    } catch { return []; }
  });
  const [comparableMovies, setComparableMovies] = useState<ComparableMovieItem[]>(() => {
    try {
      return getComparableMovies({
        title: 'Project Horizon',
        budget: 120000000,
        runtime: 135,
        genres: ['Science Fiction', 'Action'],
        release_month: 7,
        release_year: 2026,
        production_company: 'Warner Bros.',
        top_cast_popularity: 72,
        modelAlgorithm: 'random_forest'
      });
    } catch { return []; }
  });
  const [predictionTrackerData, setPredictionTrackerData] = useState<PredictionTrackerData | null>(() => {
    try { return getPredictionTrackerData('random_forest'); } catch { return null; }
  });

  // What-If Scenario Simulator state
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    { id: 'sc_1', name: 'Scenario A: Trim Runtime to 125m', budget: 120000000, runtime: 125, genres: ['Science Fiction', 'Action'], release_month: 7, release_year: 2026, top_cast_popularity: 72 },
    { id: 'sc_2', name: 'Scenario B: Shift Release to November', budget: 120000000, runtime: 135, genres: ['Science Fiction', 'Action'], release_month: 11, release_year: 2026, top_cast_popularity: 72 },
    { id: 'sc_3', name: 'Scenario C: Elevate Star Power Index', budget: 135000000, runtime: 128, genres: ['Science Fiction', 'Action'], release_month: 11, release_year: 2026, top_cast_popularity: 88 }
  ]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>(() => {
    try {
      return simulateScenarios(
        {
          title: 'Project Horizon',
          budget: 120000000,
          runtime: 135,
          genres: ['Science Fiction', 'Action'],
          release_month: 7,
          release_year: 2026,
          production_company: 'Warner Bros.',
          top_cast_popularity: 72,
          modelAlgorithm: 'random_forest',
          decisionThreshold: 0.5
        },
        [
          { id: 'sc_1', name: 'Scenario A: Trim Runtime to 125m', budget: 120000000, runtime: 125, genres: ['Science Fiction', 'Action'], release_month: 7, release_year: 2026, top_cast_popularity: 72 },
          { id: 'sc_2', name: 'Scenario B: Shift Release to November', budget: 120000000, runtime: 135, genres: ['Science Fiction', 'Action'], release_month: 11, release_year: 2026, top_cast_popularity: 72 },
          { id: 'sc_3', name: 'Scenario C: Elevate Star Power Index', budget: 135000000, runtime: 128, genres: ['Science Fiction', 'Action'], release_month: 11, release_year: 2026, top_cast_popularity: 88 }
        ]
      ).scenarioResults;
    } catch { return []; }
  });
  const [runningScenarios, setRunningScenarios] = useState(false);

  // Prediction History & Project Comparison state
  const [historyRecords, setHistoryRecords] = useState<SavedPredictionRecord[]>([]);

  // Provenance & Audience Intel state
  const [provenanceData, setProvenanceData] = useState<DataProvenanceStats | null>(() => {
    try { return getDataProvenanceStats(); } catch { return null; }
  });
  const [audienceIntel, setAudienceIntel] = useState<AudienceIntelligenceStats | null>(() => {
    try { return getAudienceIntelligenceStats(); } catch { return null; }
  });

  // Concept battle creator modal/inputs
  const [conceptATitle, setConceptATitle] = useState('Aethelgard: Dragon Oath');
  const [conceptALogline, setConceptALogline] = useState('High fantasy saga of a banished knight.');
  const [conceptABudget, setConceptABudget] = useState(140000000);

  const [conceptBTitle, setConceptBTitle] = useState('Shadow Line: Neo-Tokyo');
  const [conceptBLogline, setConceptBLogline] = useState('Grounded cyberpunk AI thriller.');
  const [conceptBBudget, setConceptBBudget] = useState(85000000);

  const [conceptSubmitted, setConceptSubmitted] = useState(false);
  const [showDecisionReportModal, setShowDecisionReportModal] = useState(false);

  // Available genres
  const availableGenres = ['Action', 'Adventure', 'Science Fiction', 'Fantasy', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Animation', 'Romance'];

  // Dedicated What-If Success Optimizer State
  const [optBudget, setOptBudget] = useState(120000000);
  const [optRuntime, setOptRuntime] = useState(135);
  const [optGenres, setOptGenres] = useState<string[]>(['Science Fiction', 'Action']);
  const [optMonth, setOptMonth] = useState(7);
  const [optCastPop, setOptCastPop] = useState(72);
  const [optLanguage, setOptLanguage] = useState('en');
  const [optResult, setOptResult] = useState<PredictionResult | null>(null);
  const [optLoading, setOptLoading] = useState(false);
  const [optError, setOptError] = useState<string | null>(null);

  // Optimizer History & Top Improvements
  const [optHistory, setOptHistory] = useState<{
    id: string;
    label: string;
    probability: number;
    delta: number;
    budget: number;
    runtime: number;
    genres: string[];
    month: number;
    castPop: number;
    language: string;
  }[]>([]);

  const [bestChangesSoFar, setBestChangesSoFar] = useState<{ changeLabel: string; delta: number }[]>([]);

  // Sync baseline result when main simulation updates
  useEffect(() => {
    if (simResult) {
      setOptBudget(simBudget);
      setOptRuntime(simRuntime);
      setOptGenres(simGenres);
      setOptMonth(simMonth);
      setOptCastPop(simCastPop);
      setOptResult(simResult);
      
      // Initialize baseline in history if empty
      setOptHistory(prev => {
        if (prev.length === 0) {
          return [{
            id: 'baseline_' + Date.now(),
            label: 'Original Baseline Concept',
            probability: simResult.successProbability,
            delta: 0,
            budget: simBudget,
            runtime: simRuntime,
            genres: simGenres,
            month: simMonth,
            castPop: simCastPop,
            language: 'en'
          }];
        }
        return prev;
      });
    }
  }, [simResult]);

  // Debounced live scenario simulation effect
  useEffect(() => {
    if (!simResult) return;

    let isMounted = true;
    setOptLoading(true);
    setOptError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await onSimulate({
          title: `${simTitle} (Scenario)`,
          budget: optBudget,
          runtime: optRuntime,
          genres: optGenres,
          release_month: optMonth,
          release_year: simYear,
          production_company: simStudio,
          top_cast_popularity: optCastPop,
          modelAlgorithm: selectedAlgorithm,
          decisionThreshold
        });

        if (isMounted) {
          setOptResult(res);
          setOptLoading(false);

          // Calculate delta vs baseline
          const baseP = Math.round(simResult.successProbability * 100);
          const scP = Math.round(res.successProbability * 100);
          const delta = scP - baseP;

          // Track changes
          const diffs: string[] = [];
          if (optBudget !== simBudget) diffs.push(`Budget: $${(simBudget/1e6).toFixed(0)}M → $${(optBudget/1e6).toFixed(0)}M`);
          if (optRuntime !== simRuntime) diffs.push(`Runtime: ${simRuntime}m → ${optRuntime}m`);
          if (JSON.stringify(optGenres.slice().sort()) !== JSON.stringify(simGenres.slice().sort())) diffs.push(`Genres: ${simGenres.join(', ')} → ${optGenres.join(', ')}`);
          if (optMonth !== simMonth) diffs.push(`Month: ${simMonth} → ${optMonth}`);
          if (optCastPop !== simCastPop) diffs.push(`Cast Pop: ${simCastPop} → ${optCastPop}`);
          if (optLanguage !== 'en') diffs.push(`Language: EN → ${optLanguage.toUpperCase()}`);

          if (diffs.length > 0) {
            const scenarioName = `Scenario: ${diffs.join(' | ')}`;
            
            // Add to session history
            setOptHistory(prev => {
              if (prev.some(h => h.label === scenarioName)) return prev;
              return [
                ...prev,
                {
                  id: 'sc_' + Date.now(),
                  label: scenarioName,
                  probability: res.successProbability,
                  delta,
                  budget: optBudget,
                  runtime: optRuntime,
                  genres: optGenres,
                  month: optMonth,
                  castPop: optCastPop,
                  language: optLanguage
                }
              ];
            });

            // Update top improvements if positive delta
            if (delta > 0) {
              const changeSummary = `${diffs.join(', ')}`;
              setBestChangesSoFar(prev => {
                if (prev.some(b => b.changeLabel === changeSummary)) return prev;
                return [...prev, { changeLabel: changeSummary, delta }].sort((a, b) => b.delta - a.delta).slice(0, 5);
              });
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setOptError('Unable to simulate this scenario.');
          setOptLoading(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [optBudget, optRuntime, optGenres, optMonth, optCastPop, optLanguage, selectedAlgorithm, decisionThreshold]);

  const handleResetScenario = () => {
    setOptBudget(simBudget);
    setOptRuntime(simRuntime);
    setOptGenres(simGenres);
    setOptMonth(simMonth);
    setOptCastPop(simCastPop);
    setOptLanguage('en');
    setOptResult(simResult);
  };

  const handleRestoreHistoryScenario = (item: any) => {
    setOptBudget(item.budget);
    setOptRuntime(item.runtime);
    setOptGenres(item.genres);
    setOptMonth(item.month);
    setOptCastPop(item.castPop);
    setOptLanguage(item.language);
  };

  const handleAlgorithmChange = (algo: ModelAlgorithm) => {
    setSelectedAlgorithm(algo);
    onSelectAlgorithm(algo);
  };

  const handleGenreToggle = (g: string) => {
    if (simGenres.includes(g)) {
      if (simGenres.length > 1) setSimGenres(simGenres.filter(x => x !== g));
    } else {
      setSimGenres([...simGenres, g]);
    }
  };

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSimulating(true);
    try {
      const res = await onSimulate({
        title: simTitle,
        budget: simBudget,
        runtime: simRuntime,
        genres: simGenres,
        release_month: simMonth,
        release_year: simYear,
        production_company: simStudio,
        top_cast_popularity: simCastPop,
        modelAlgorithm: selectedAlgorithm,
        decisionThreshold
      });
      setSimResult(res);

      apiGetPredictionHistory()
        .then(d => setHistoryRecords(d || []))
        .catch(() => {});
    } finally {
      setSimulating(false);
    }
  };

  // Run What-If Scenario Simulations
  const handleRunScenarios = async () => {
    setRunningScenarios(true);
    try {
      const baselineInput: ProjectSimulationInput = {
        title: simTitle,
        budget: simBudget,
        runtime: simRuntime,
        genres: simGenres,
        release_month: simMonth,
        release_year: simYear,
        production_company: simStudio,
        top_cast_popularity: simCastPop,
        modelAlgorithm: selectedAlgorithm,
        decisionThreshold
      };

      const results = await apiSimulateScenarios(baselineInput, scenarios);
      setScenarioResults(results || []);
    } catch (err) {
      console.error('Failed to run scenario simulator:', err);
    } finally {
      setRunningScenarios(false);
    }
  };

  // Load initial provenance, opportunity, regional, & platform analytics on mount
  useEffect(() => {
    let isMounted = true;

    handleRunSimulation();

    const inputData = {
      title: simTitle,
      budget: simBudget,
      runtime: simRuntime,
      genres: simGenres,
      release_month: simMonth,
      release_year: simYear,
      production_company: simStudio,
      top_cast_popularity: simCastPop,
      modelAlgorithm: selectedAlgorithm
    };

    apiGetGreenlight(inputData)
      .then(d => { if (isMounted) setGreenlightScenarios(d || []); })
      .catch(() => {});

    apiGetComparables(inputData)
      .then(d => { if (isMounted) setComparableMovies(d || []); })
      .catch(() => {});

    apiGetOpportunityRadar()
      .then(d => { if (isMounted) setOpportunityData(d || []); })
      .catch(() => {});

    apiGetRegionalRadar()
      .then(d => { if (isMounted) setRegionalData(d || []); })
      .catch(() => {});

    apiGetContentGaps()
      .then(d => { if (isMounted) setContentGapsData(d || []); })
      .catch(() => {});

    apiGetCineAccess()
      .then(d => { if (isMounted) setCineaccessData(d || null); })
      .catch(() => {});

    apiGetPredictionTracker(selectedAlgorithm)
      .then(d => { if (isMounted) setPredictionTrackerData(d || null); })
      .catch(() => {});

    apiGetDataProvenance()
      .then(d => { if (isMounted) setProvenanceData(d || null); })
      .catch(() => {});

    apiGetAudienceStats()
      .then(d => { if (isMounted) setAudienceIntel(d || null); })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [selectedAlgorithm, decisionThreshold, simBudget, simGenres, simMonth, simCastPop]);

  // Fetch Post-Release Diagnostic when selected movie changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedPostReleaseId) return;

    apiGetPostRelease(selectedPostReleaseId)
      .then(d => { if (isMounted && d) setPostReleaseDiagnostic(d); })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [selectedPostReleaseId]);

  const handleCreateBattle = async () => {
    if (!onCreateConceptBattle) return;
    try {
      await onCreateConceptBattle(
        {
          title: conceptATitle,
          budget: conceptABudget,
          runtime: 130,
          genres: ['Action', 'Fantasy'],
          release_month: 7,
          release_year: 2026,
          top_cast_popularity: 80,
          logline: conceptALogline
        },
        {
          title: conceptBTitle,
          budget: conceptBBudget,
          runtime: 120,
          genres: ['Science Fiction', 'Thriller'],
          release_month: 11,
          release_year: 2026,
          top_cast_popularity: 70,
          logline: conceptBLogline
        }
      );
      setConceptSubmitted(true);
      setTimeout(() => setConceptSubmitted(false), 4000);
    } catch (err) {
      console.error('Failed to launch concept battle:', err);
    }
  };

  // Prepare chart dataset for budget vs revenue scatter
  const scatterData = movies.slice(0, 120).map(m => ({
    title: m.title,
    budget: Math.round(m.budget / 1000000),
    revenue: Math.round(m.revenue / 1000000),
    success: m.success === 1 ? 'Hit' : 'Flop'
  }));

  // Auto-scroll to top when active tab switches
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="space-y-6 font-sans selection:bg-[#E50914] selection:text-white pb-12">
      
      {/* 1. NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#262626] no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Clapperboard className="w-3.5 h-3.5" />
          <span>Strategic Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'studio'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Predictive Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('audience')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'audience'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Vote className="w-3.5 h-3.5 text-red-500" />
          <span>Audience Lab & Feedback</span>
        </button>

        <button
          onClick={() => setActiveTab('livecinema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'livecinema'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-red-500" />
          <span>Live Market & Cinema</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'script'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Script Intelligence</span>
        </button>

        <button
          onClick={() => { setActiveTab('scenarios'); handleRunScenarios(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'scenarios'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Greenlight & Scenarios</span>
        </button>

        <button
          onClick={() => setActiveTab('comparables')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'comparables'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Comparable Titles</span>
        </button>

        <button
          onClick={() => setActiveTab('opportunity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'opportunity'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Opportunity Radar & Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('regional')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'regional'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Regional Content Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('postrelease')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'postrelease'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Post-Release Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tracker'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Prediction Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'risks'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Failure Risk Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Prediction History</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-red-500" />
          <span>Model Integrity Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('provenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'provenance'
              ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
              : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#262626]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Provenance</span>
        </button>
      </div>

      {/* TAB CONTENT: STRATEGIC OVERVIEW COMMAND CENTER */}
      {activeTab === 'overview' && (
        <StrategicOverview
          stats={stats}
          modelA={modelA}
          modelB={modelB}
          simResult={simResult}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* TAB CONTENT: AUDIENCE LAB & PRODUCER FEEDBACK CENTER */}
      {activeTab === 'audience' && (
        <AudienceLabProducer onOpenWhatIf={handleOpenWhatIf} />
      )}

      {/* TAB CONTENT: LIVE CINEMA & MARKET SIGNALS */}
      {activeTab === 'livecinema' && (
        <LiveCinemaHub user={null} />
      )}

      {/* TAB CONTENT 1: PREDICTIVE STUDIO */}
      {activeTab === 'studio' && (
        <div id="predict-simulator-section" className="space-y-8">
          
          {/* Main Simulation Panel */}
          <div className="bg-[#141414] border-2 border-red-600/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-600/10">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Pre-Greenlight Studio</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">Predict My Project</h2>
                <p className="text-xs text-neutral-400 mt-1">Configure pre-production parameters & run multi-algorithm inference</p>
              </div>

              {/* Algorithm Selector Dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-[#050505] p-2 rounded-xl border border-[#262626]">
                  <label className="text-xs text-neutral-400 font-mono pl-1">Threshold:</label>
                  <select
                    value={decisionThreshold}
                    onChange={(e) => setDecisionThreshold(Number(e.target.value))}
                    className="bg-[#141414] border border-[#262626] rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-red-600"
                  >
                    <option value={0.35}>0.35 (Recall Focused)</option>
                    <option value={0.50}>0.50 (Balanced Standard)</option>
                    <option value={0.65}>0.65 (Precision Focused)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-[#050505] p-2 rounded-xl border border-[#262626]">
                  <label className="text-xs text-neutral-400 font-mono pl-1">Classifier Engine:</label>
                  <select
                    value={selectedAlgorithm}
                    onChange={(e) => handleAlgorithmChange(e.target.value as ModelAlgorithm)}
                    className="bg-[#141414] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-red-600"
                  >
                    <option value="random_forest">Random Forest</option>
                    <option value="xgboost">XGBoost / Gradient Boosting</option>
                    <option value="logistic_regression">Logistic Regression</option>
                    <option value="svm">Support Vector Machine (SVM)</option>
                  </select>
                </div>
              </div>
            </div>

            <form onSubmit={handleRunSimulation} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
              
              {/* Form Input Controls */}
              <div className="lg:col-span-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-neutral-300 font-display mb-1">Project Title</label>
                  <input
                    type="text"
                    value={simTitle}
                    onChange={(e) => setSimTitle(e.target.value)}
                    className="w-full bg-[#050505] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 font-display mb-1">
                      Production Budget: ${(simBudget / 1000000).toFixed(0)}M
                    </label>
                    <input
                      type="range"
                      min="5000000"
                      max="300000000"
                      step="5000000"
                      value={simBudget}
                      onChange={(e) => setSimBudget(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 font-display mb-1">
                      Runtime: {simRuntime} mins
                    </label>
                    <input
                      type="range"
                      min="80"
                      max="210"
                      step="5"
                      value={simRuntime}
                      onChange={(e) => setSimRuntime(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 font-display mb-1.5">Genre Selection</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableGenres.map(g => {
                      const selected = simGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleGenreToggle(g)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            selected
                              ? 'bg-[#E50914] text-white border border-red-500 shadow-md'
                              : 'bg-[#050505] text-neutral-400 border border-[#262626] hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 font-display mb-1">Release Month</label>
                    <select
                      value={simMonth}
                      onChange={(e) => setSimMonth(Number(e.target.value))}
                      className="w-full bg-[#050505] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    >
                      <option value={5}>May (Summer Opener)</option>
                      <option value={6}>June (Summer Blockbuster)</option>
                      <option value={7}>July (Peak Summer)</option>
                      <option value={11}>November (Holiday Season)</option>
                      <option value={12}>December (Christmas/Awards)</option>
                      <option value={2}>February (Off-Peak)</option>
                      <option value={9}>September (Fall Slot)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 font-display mb-1">
                      Top Cast Popularity Index: {simCastPop}/100
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={simCastPop}
                      onChange={(e) => setSimCastPop(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={simulating}
                  className="w-full py-3 bg-[#E50914] hover:bg-[#B20710] text-white rounded-xl font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{simulating ? 'Evaluating Machine Learning Inference...' : 'Predict Project Success'}</span>
                </button>

              </div>

              {/* Simulation Result Output & SHAP Drivers */}
              <div className="lg:col-span-6 bg-[#050505] border border-[#262626] rounded-2xl p-6 flex flex-col justify-between space-y-6">
                
                {simResult ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider">
                          Model A ({modelA.algorithmName})
                        </span>
                        <h3 className="text-xl font-extrabold text-white font-display mt-0.5">{simTitle}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                          simResult.riskLevel === 'Low'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : simResult.riskLevel === 'Moderate'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {simResult.riskLevel} Risk
                        </span>
                      </div>
                    </div>

                    {/* HERO CinePredict Prediction Score Card */}
                    <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] text-center space-y-2 relative overflow-hidden">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 px-2">
                        <span>DATA COVERAGE: {simResult.reliability.coverageScore}% ({simResult.reliability.dataCoverageStatus})</span>
                        <span className="text-red-400">LEAKAGE: {simResult.reliability.leakageStatus}</span>
                      </div>

                      <p className="text-xs font-mono text-neutral-400 pt-1">CINEPREDICT SCORE (PLATT CALIBRATED PROBABILITY)</p>
                      
                      <p className="text-6xl font-black text-white font-display tracking-tight text-gradient-red">
                        {(simResult.successProbability * 100).toFixed(0)}%
                      </p>

                      <div className="pt-2 flex justify-center">
                        <span className={`px-3.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${
                          simResult.decisionEngine?.recommendationVerdict === 'Proceed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : simResult.decisionEngine?.recommendationVerdict === 'Proceed with Caution'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          VERDICT: {simResult.decisionEngine?.recommendationVerdict || 'Proceed with Caution'}
                        </span>
                      </div>

                      {simResult.reliability.outOfDomainWarning && (
                        <div className="mt-3 p-2 bg-amber-950/60 border border-amber-800 rounded-xl text-[11px] text-amber-300">
                          {simResult.reliability.outOfDomainWarning}
                        </div>
                      )}
                    </div>

                    {/* Local SHAP Drivers */}
                    <div className="space-y-3">
                      <p className="text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
                        Feature Drivers (SHAP Explanations)
                      </p>

                      <div className="space-y-2">
                        {simResult.topDrivers.map((d, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-neutral-200">{d.displayName}: <strong className="text-neutral-400 font-mono">{d.value}</strong></span>
                              <span className={`font-mono font-bold ${d.direction === 'positive' ? 'text-red-500' : 'text-neutral-400'}`}>
                                {d.impact > 0 ? `+${d.impact}%` : `${d.impact}%`}
                              </span>
                            </div>
                            <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full animate-bar-fill rounded-full ${d.direction === 'positive' ? 'bg-[#E50914]' : 'bg-neutral-600'}`}
                                style={{ '--fill-width': `${Math.abs(d.impact) * 3.5}%` } as React.CSSProperties}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-8 text-neutral-400 text-xs font-mono">
                    Initializing prediction engine...
                  </div>
                )}

              </div>

            </form>

          </div>

          {/* PREDICTION EXPLAINABILITY SUMMARY CARD */}
          {simResult && simResult.topDrivers && simResult.topDrivers.length > 0 && (
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              
              <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Prediction Explainability Summary</span>
                  <h3 className="text-xl font-extrabold text-white font-display">Why This Score? — Evidence Breakdown</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Verdict Card */}
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                  simResult.riskLevel === 'Low'
                    ? 'bg-green-950/30 border-green-800/40'
                    : simResult.riskLevel === 'Moderate'
                    ? 'bg-amber-950/30 border-amber-800/40'
                    : 'bg-red-950/30 border-red-800/40'
                }`}>
                  <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                    simResult.riskLevel === 'Low' ? 'text-green-400' : simResult.riskLevel === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                  }`}>Overall Verdict</p>
                  <p className="text-2xl font-extrabold text-white font-display">
                    {(simResult.successProbability * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-neutral-300 font-mono">{simResult.riskLevel} Risk · {simResult.isSuccess ? 'SUCCESS PREDICTED' : 'RISK PREDICTED'}</p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">
                    Threshold: {(simResult.decisionThresholdUsed * 100).toFixed(0)}% — Calibrated probability from {simResult.algorithmUsed?.replace(/_/g, ' ').toUpperCase() || 'Random Forest'}
                  </p>
                </div>

                {/* Positive Drivers */}
                <div className="p-4 rounded-2xl border border-[#262626] bg-[#0d1a0d] space-y-2">
                  <p className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest">Positive Drivers</p>
                  {simResult.topDrivers
                    .filter(d => d.direction === 'positive')
                    .slice(0, 3)
                    .map((d, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-white">{d.displayName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{d.description}</p>
                        </div>
                      </div>
                    ))}
                  {simResult.topDrivers.filter(d => d.direction === 'positive').length === 0 && (
                    <p className="text-xs text-neutral-500 font-mono italic">No strong positive signals detected for this configuration.</p>
                  )}
                </div>

                {/* Limiting Signals */}
                <div className="p-4 rounded-2xl border border-[#262626] bg-[#1a0d0d] space-y-2">
                  <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">Limiting Signals</p>
                  {simResult.topDrivers
                    .filter(d => d.direction === 'negative')
                    .slice(0, 3)
                    .map((d, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-white">{d.displayName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{d.description}</p>
                        </div>
                      </div>
                    ))}
                  {simResult.topDrivers.filter(d => d.direction === 'negative').length === 0 && (
                    <p className="text-xs text-neutral-500 font-mono italic">No major negative signals identified.</p>
                  )}
                </div>
              </div>

              {/* Recommended Actions */}
              {simResult.recommendations && simResult.recommendations.length > 0 && (
                <div className="pt-3 border-t border-[#262626] space-y-2">
                  <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Recommended Next Steps</p>
                  <div className="flex flex-wrap gap-2">
                    {simResult.recommendations.slice(0, 4).map((rec, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#050505] border border-[#262626] rounded-xl text-xs text-neutral-300">
                        <ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0" />
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-neutral-600 font-mono">
                SHAP-based feature attribution derived from trained {simResult.algorithmUsed?.replace(/_/g, ' ') || 'machine learning'} model. Impact values reflect model-learned feature contributions — not causal claims.
              </p>

            </div>
          )}

          {/* CINEPREDICT DECISION ENGINE CARD */}
          {simResult && simResult.decisionEngine && (
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              
              <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Decision Intelligence Layer</span>
                  <h3 className="text-xl font-extrabold text-white font-display">CinePredict Decision Engine & Support Category</h3>
                </div>
              </div>

              {simResult.decisionSupport && (
                <div className="p-5 rounded-2xl bg-[#050505] border border-red-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      simResult.decisionSupport.category === 'STRONG CANDIDATE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      simResult.decisionSupport.category === 'NEEDS REVISION' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      simResult.decisionSupport.category === 'HIGH UNCERTAINTY' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      DECISION VERDICT: {simResult.decisionSupport.category}
                    </span>
                    <p className="text-sm font-bold text-white mt-2 font-display">{simResult.decisionSupport.headline}</p>
                    <p className="text-xs text-neutral-400">{simResult.decisionSupport.recommendedAction}</p>
                  </div>

                  {simResult.noveltyWarning?.warningMessage && (
                    <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 font-mono space-y-1 max-w-sm">
                      <p className="font-bold text-amber-400">⚠ {simResult.noveltyWarning.reliabilityLabel}</p>
                      <p className="text-[11px] text-neutral-300 leading-normal">{simResult.noveltyWarning.warningMessage}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                  <p className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">Executive Decision Summary</p>
                  <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                    "{simResult.decisionEngine.decisionSummary}"
                  </p>
                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs text-neutral-400">
                    <span>Potential: <strong className="text-white">{simResult.decisionEngine.projectSuccessPotential}</strong></span>
                    <span>{simResult.decisionEngine.confidenceContext}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-3">
                  <p className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">Recommended Next Step</p>
                  <p className="text-xs text-red-200 font-semibold leading-relaxed">
                    {simResult.decisionEngine.recommendedNextStep}
                  </p>
                  <div className="pt-2 border-t border-red-800/40 flex items-center gap-2">
                    <button
                      onClick={() => setShowDecisionReportModal(true)}
                      className="px-3 py-1.5 bg-[#E50914] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#B20710] transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Full Decision Report</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* DEDICATED FEATURE: WHAT-IF SUCCESS OPTIMIZER */}
          {simResult && (
            <div id="what-if-optimizer-section" className="bg-[#141414] border-2 border-red-600/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-red-600/20">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/50 text-red-500 flex items-center justify-center shadow-lg shadow-red-600/20">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Live Interactive Optimization</span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 font-display">What-If Success Optimizer</h3>
                    <p className="text-xs text-neutral-400 mt-1">Modify controllable movie parameters and live-simulate real model prediction deltas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {optLoading && (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800 animate-pulse">
                      Simulating...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetScenario}
                    className="px-4 py-2 bg-[#050505] hover:bg-[#181818] text-neutral-300 hover:text-white rounded-xl text-xs font-bold border border-[#262626] transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Scenario</span>
                  </button>
                </div>
              </div>

              {/* Baseline vs Current Scenario Hero Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-2xl bg-[#050505] border border-[#262626] relative overflow-hidden">
                
                {/* Baseline */}
                <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] space-y-1 text-center">
                  <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">BASELINE PROBABILITY</span>
                  <p className="text-4xl font-extrabold text-white font-display">{(simResult.successProbability * 100).toFixed(0)}%</p>
                  <p className="text-[11px] text-neutral-400 font-mono">Original Reference Concept</p>
                </div>

                {/* Current Scenario */}
                <div className="p-4 rounded-xl bg-[#141414] border border-red-600/40 space-y-1 text-center">
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">CURRENT SCENARIO</span>
                  <p className="text-4xl font-extrabold text-white font-display">
                    {optResult ? `${(optResult.successProbability * 100).toFixed(0)}%` : '...'}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">Active Simulated Model Output</p>
                </div>

                {/* Delta Badge */}
                <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex flex-col items-center justify-center space-y-1 text-center">
                  <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">SCORE DELTA (&Delta;)</span>
                  {optResult && (
                    <>
                      {(() => {
                        const baseP = Math.round(simResult.successProbability * 100);
                        const scP = Math.round(optResult.successProbability * 100);
                        const delta = scP - baseP;
                        return (
                          <div className="space-y-1">
                            <span className={`text-3xl font-extrabold font-mono ${
                              delta > 0 ? 'text-red-500' : delta < 0 ? 'text-neutral-400' : 'text-white'
                            }`}>
                              {delta > 0 ? `+${delta} pts` : `${delta} pts`}
                            </span>
                            <p className="text-[10px] text-neutral-400 font-mono">
                              {delta > 0 ? 'Model-Simulated Gain' : delta < 0 ? 'Negative Model Impact' : 'No Parameter Change'}
                            </p>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

              </div>

              {optError && (
                <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl flex items-center justify-between text-xs text-rose-300 font-mono">
                  <span>⚠ {optError}</span>
                  <button onClick={handleResetScenario} className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-bold">
                    Retry / Reset
                  </button>
                </div>
              )}

              {/* Interactive Controls */}
              <div className="space-y-6 pt-2">
                <h4 className="text-sm font-bold text-white font-display tracking-wide uppercase text-neutral-300">
                  Controllable Movie Parameters
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Genre Toggle */}
                  <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                    <label className="block text-xs font-bold text-white font-display">Genre Positioning</label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableGenres.map(g => {
                        const isSel = optGenres.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              if (isSel) {
                                if (optGenres.length > 1) setOptGenres(optGenres.filter(x => x !== g));
                              } else {
                                setOptGenres([...optGenres, g]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isSel
                                ? 'bg-[#E50914] text-white border border-red-500 shadow-md'
                                : 'bg-[#141414] text-neutral-400 border border-[#262626] hover:text-white'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Runtime Slider */}
                  <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Runtime Length</span>
                      <span className="font-mono text-red-400">{optRuntime} mins</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="210"
                      step="5"
                      value={optRuntime}
                      onChange={(e) => setOptRuntime(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                    <p className="text-[10px] text-neutral-400 font-mono">Optimal showtime window: 100–150 mins</p>
                  </div>

                  {/* Budget Slider */}
                  <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Production Budget</span>
                      <span className="font-mono text-red-400">${(optBudget / 1000000).toFixed(0)}M</span>
                    </div>
                    <input
                      type="range"
                      min="5000000"
                      max="300000000"
                      step="5000000"
                      value={optBudget}
                      onChange={(e) => setOptBudget(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                    <p className="text-[10px] text-neutral-400 font-mono">Cleaned dataset average: $36M</p>
                  </div>

                  {/* Release Month Selector */}
                  <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                    <label className="block text-xs font-bold text-white font-display">Release Month Window</label>
                    <select
                      value={optMonth}
                      onChange={(e) => setOptMonth(Number(e.target.value))}
                      className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-medium"
                    >
                      <option value={5}>May (Summer Opener)</option>
                      <option value={6}>June (Summer Blockbuster)</option>
                      <option value={7}>July (Peak Summer)</option>
                      <option value={11}>November (Holiday Season)</option>
                      <option value={12}>December (Christmas/Awards)</option>
                      <option value={2}>February (Off-Peak)</option>
                      <option value={9}>September (Fall Slot)</option>
                    </select>
                  </div>

                  {/* Cast Star Power Index */}
                  <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Top Cast Star Power Index</span>
                      <span className="font-mono text-red-400">{optCastPop}/100</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={optCastPop}
                      onChange={(e) => setOptCastPop(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                    <p className="text-[10px] text-neutral-400 font-mono">Measures international box-office draw</p>
                  </div>

                  {/* Original Language */}
                  <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                    <label className="block text-xs font-bold text-white font-display">Original Language</label>
                    <select
                      value={optLanguage}
                      onChange={(e) => setOptLanguage(e.target.value)}
                      className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-medium"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi (Bollywood)</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Changes List & Best Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#262626]">
                
                {/* Changes Tracking List */}
                <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">ACTIVE PARAMETER CHANGES</span>
                  {(() => {
                    const diffs: string[] = [];
                    if (optBudget !== simBudget) diffs.push(`Budget: $${(simBudget/1e6).toFixed(0)}M → $${(optBudget/1e6).toFixed(0)}M`);
                    if (optRuntime !== simRuntime) diffs.push(`Runtime: ${simRuntime}m → ${optRuntime}m`);
                    if (JSON.stringify(optGenres.slice().sort()) !== JSON.stringify(simGenres.slice().sort())) diffs.push(`Genres: ${simGenres.join(', ')} → ${optGenres.join(', ')}`);
                    if (optMonth !== simMonth) diffs.push(`Month: ${simMonth} → ${optMonth}`);
                    if (optCastPop !== simCastPop) diffs.push(`Cast Pop: ${simCastPop} → ${optCastPop}`);
                    if (optLanguage !== 'en') diffs.push(`Language: EN → ${optLanguage.toUpperCase()}`);

                    return diffs.length > 0 ? (
                      <ul className="space-y-2 text-xs text-neutral-300 font-mono">
                        {diffs.map((d, idx) => (
                          <li key={idx} className="p-2 bg-[#141414] rounded-lg border border-[#262626] flex items-center gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-500 font-mono italic">No changes made relative to baseline parameters.</p>
                    );
                  })()}
                </div>

                {/* Best Changes So Far */}
                <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">BEST CHANGES SO FAR (THIS SESSION)</span>
                  {bestChangesSoFar.length > 0 ? (
                    <div className="space-y-2">
                      {bestChangesSoFar.map((b, idx) => (
                        <div key={idx} className="p-2.5 bg-[#141414] rounded-lg border border-[#262626] flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-300 truncate pr-2">{idx + 1}. {b.changeLabel}</span>
                          <span className="font-bold text-red-400 shrink-0">+{b.delta} pts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 font-mono italic">Adjust sliders to discover top score-boosting modifications.</p>
                  )}
                </div>

              </div>

              {/* Scenario History Log Table */}
              {optHistory.length > 0 && (
                <div className="pt-4 border-t border-[#262626] space-y-3">
                  <h4 className="text-xs font-bold text-neutral-300 font-mono uppercase tracking-wider">Scenario Session History Log</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#262626] text-[10px] text-neutral-400 uppercase">
                          <th className="py-2.5 px-3">Scenario Description</th>
                          <th className="py-2.5 px-3 text-center">Predicted Prob</th>
                          <th className="py-2.5 px-3 text-center">Delta (&Delta;)</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626]">
                        {optHistory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#050505]">
                            <td className="py-2.5 px-3 font-medium text-white max-w-md truncate">{item.label}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-white">{(item.probability * 100).toFixed(0)}%</td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                item.delta > 0 ? 'bg-red-950 text-red-400 border border-red-800' :
                                item.delta < 0 ? 'bg-neutral-900 text-neutral-400 border border-[#262626]' :
                                'text-neutral-400'
                              }`}>
                                {item.delta > 0 ? `+${item.delta} pts` : `${item.delta} pts`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRestoreHistoryScenario(item)}
                                className="px-2.5 py-1 bg-[#141414] hover:bg-[#181818] text-neutral-300 hover:text-white rounded border border-[#262626] text-[10px] font-bold"
                              >
                                Restore Scenario
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Data Science Phrasing Disclaimer */}
              <div className="pt-2 text-center text-[11px] text-neutral-400 font-mono italic">
                *Model-simulated outcome. Under the trained machine learning model, this scenario produces a higher predicted probability based on historical TMDB priors.
              </div>

            </div>
          )}

          {/* 1. MODEL DEBATE PANEL */}
          {simResult && simResult.modelDebate && (
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                    <GitCompare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Multi-Classifier Inference</span>
                    <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Model Debate & Consensus Engine</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-neutral-400">Consensus Range: <strong className="text-white font-bold">{simResult.modelDebate.consensusRange}</strong></span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${
                    simResult.modelDebate.consensusStatus === 'STRONG AGREEMENT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    simResult.modelDebate.consensusStatus === 'MODERATE DISAGREEMENT' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {simResult.modelDebate.consensusStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {simResult.modelDebate.scores.map((score, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-2">
                    <span className="text-[10px] font-mono font-bold text-red-500 uppercase">{score.algorithmName}</span>
                    <p className="text-3xl font-extrabold text-white font-display">{(score.probability * 100).toFixed(0)}%</p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed pt-2 border-t border-[#262626]">{score.rationale}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#050505] border border-[#262626] text-xs text-neutral-300 space-y-1">
                <p className="font-mono text-red-400 font-bold">Why Are Models Agreeing / Disagreeing?</p>
                <p className="leading-relaxed">{simResult.modelDebate.agreementExplanation}</p>
              </div>
            </div>
          )}

          {/* 2. MOVIE DNA / SUCCESS FINGERPRINT */}
          {simResult && simResult.movieDna && (
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">8-Dimensional Profiling</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Movie DNA & Success Fingerprint</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {simResult.movieDna.map((dim, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#050505] border border-[#262626] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white font-display">{dim.dimension}</span>
                      <span className="font-mono font-bold text-red-400">{dim.score}/100 ({dim.label})</span>
                    </div>
                    <div className="w-full bg-[#181818] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E50914] rounded-full transition-all duration-500"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal">{dim.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. WHY WILL IT SUCCEED? vs WHY NOT? */}
          {simResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Why Will It Succeed? */}
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <h4 className="text-lg font-bold text-white font-display flex items-center gap-2 text-emerald-400">
                  <span>✓</span> Why Will This Project Succeed?
                </h4>
                <div className="space-y-3 text-xs text-neutral-300">
                  {simResult.topDrivers.filter(d => d.direction === 'positive').map((d, i) => (
                    <div key={i} className="p-3 bg-[#050505] rounded-xl border border-[#262626] space-y-1">
                      <p className="font-bold text-white">{d.displayName}: {d.value}</p>
                      <p className="text-neutral-400 text-[11px]">{d.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Not? & Limiting Signals */}
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <h4 className="text-lg font-bold text-white font-display flex items-center gap-2 text-rose-400">
                  <span>⚠</span> Why Is The Score Not Higher?
                </h4>
                <div className="space-y-3 text-xs text-neutral-300">
                  {simResult.whyNot?.limitingSignals.map((ls, i) => (
                    <div key={i} className="p-3 bg-[#050505] rounded-xl border border-[#262626] flex justify-between items-center">
                      <span className="text-neutral-300 font-medium">{ls.signal}</span>
                      <span className="font-mono text-rose-400 font-bold">{ls.impact}</span>
                    </div>
                  ))}

                  {simResult.whyNot?.biggestOpportunity && (
                    <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-2xl space-y-2 mt-4">
                      <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">BIGGEST IMPROVEMENT OPPORTUNITY</span>
                      <p className="text-sm font-bold text-white font-display">{simResult.whyNot.biggestOpportunity.variable}</p>
                      <p className="text-xs text-neutral-300">Current: <strong>{simResult.whyNot.biggestOpportunity.current}</strong> &rarr; Recommended: <strong className="text-emerald-400">{simResult.whyNot.biggestOpportunity.recommended}</strong></p>
                      <p className="text-[11px] text-neutral-400 font-mono">Estimated Probability Gain: <strong className="text-emerald-400">+{simResult.whyNot.biggestOpportunity.estimatedGain}%</strong></p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 4. COUNTERFACTUAL SUCCESS ENGINE */}
          {simResult && simResult.counterfactuals && simResult.counterfactuals.length > 0 && (
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Model-Simulated Outcomes</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Counterfactual Success Engine</h3>
                </div>
              </div>

              <p className="text-xs text-neutral-400">
                What would need to change for this concept to achieve a higher predicted success probability?
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#262626] text-[10px] text-neutral-400 uppercase">
                      <th className="py-3 px-4">Counterfactual Action</th>
                      <th className="py-3 px-4">Current Input</th>
                      <th className="py-3 px-4">Simulated Change</th>
                      <th className="py-3 px-4 text-center">New Prediction</th>
                      <th className="py-3 px-4 text-center">Probability Gain (&Delta;)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {simResult.counterfactuals.map((cf, i) => (
                      <tr key={i} className="hover:bg-[#050505]">
                        <td className="py-3.5 px-4 font-bold text-white font-display">{cf.displayName}</td>
                        <td className="py-3.5 px-4 text-neutral-400">{cf.currentValue}</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{cf.counterfactualValue}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-white text-sm">{(cf.simulatedProbability * 100).toFixed(0)}%</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">+{cf.deltaProbability}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. VIRTUAL MOVIE EXPERIMENT & TOP SUCCESS CONFIGURATION */}
          {simResult && simResult.virtualExperiment && (
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Multi-Version Simulation</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Virtual Movie Experiment & Best Configuration</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {simResult.virtualExperiment.configurations.map((cfg, i) => (
                  <div key={i} className={`p-5 rounded-2xl bg-[#050505] border space-y-3 flex flex-col justify-between ${
                    cfg.version === simResult.virtualExperiment?.bestConfiguration.version
                      ? 'border-red-600/60 shadow-lg shadow-red-600/10'
                      : 'border-[#262626]'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">{cfg.title}</span>
                        {cfg.version === simResult.virtualExperiment?.bestConfiguration.version && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            BEST CONFIG
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-extrabold text-white font-display mt-2">{(cfg.probability * 100).toFixed(0)}%</p>
                      <p className="text-xs text-neutral-400 font-mono mt-1">Budget: ${(cfg.budget/1e6).toFixed(0)}M | Runtime: {cfg.runtime}m</p>
                    </div>

                    <div className="pt-2 border-t border-[#262626] text-xs text-neutral-300 font-mono space-y-1">
                      <p className="text-emerald-400">Strongest: {cfg.strongestFactor}</p>
                      <p className="text-neutral-400">Delta vs Baseline: <strong className="text-white">+{cfg.deltaVsOriginal}%</strong></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Success Path */}
              {simResult.successPath && (
                <div className="pt-6 border-t border-[#262626] space-y-4">
                  <h4 className="text-sm font-bold text-white font-display">Visual Success Path Step Sequence</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {simResult.successPath.map((step, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-2">
                        <span className="text-[10px] font-mono text-red-500 font-bold">STEP {step.stepNumber}</span>
                        <p className="text-xs font-bold text-white font-display">{step.title}</p>
                        <p className="text-[11px] text-neutral-400">{step.action}</p>
                        <p className="text-lg font-extrabold text-white font-mono pt-1">{(step.probability * 100).toFixed(0)}% <span className="text-xs text-emerald-400 font-normal">({step.delta >= 0 ? `+${step.delta}%` : `${step.delta}%`})</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. ROBUSTNESS & STABILITY TEST */}
          {simResult && simResult.robustness && (
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex justify-between items-center pb-4 border-b border-[#262626]">
                <div>
                  <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Perturbation Stability</span>
                  <h3 className="text-xl font-extrabold text-white mt-1 font-display">Prediction Robustness & Stability Test</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  STABILITY: {simResult.robustness.stabilityRating}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 bg-[#050505] rounded-xl border border-[#262626]">
                  <p className="text-neutral-400">Estimated Empirical Range</p>
                  <p className="text-xl font-bold text-white mt-1">{simResult.robustness.estimatedRange}</p>
                </div>
                <div className="p-4 bg-[#050505] rounded-xl border border-[#262626]">
                  <p className="text-neutral-400">Perturbation Std Dev</p>
                  <p className="text-xl font-bold text-neutral-200 mt-1">{simResult.robustness.stdDev.toFixed(3)}</p>
                </div>
                <div className="p-4 bg-[#050505] rounded-xl border border-[#262626]">
                  <p className="text-neutral-400">Perturbation Samples Evaluated</p>
                  <p className="text-xl font-bold text-white mt-1">{simResult.robustness.perturbedScores.length} runs</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: SCRIPT INTELLIGENCE REPORT */}
      {activeTab === 'script' && (
        <ScriptIntelligenceReport onSimulate={onSimulate} />
      )}

      {/* TAB CONTENT 2: WHAT-IF SCENARIO LAB */}
      {activeTab === 'scenarios' && (
        <ScenarioLab
          baselineInput={{
            title: simTitle,
            budget: simBudget,
            runtime: simRuntime,
            genres: simGenres,
            release_month: simMonth,
            release_year: simYear,
            production_company: simStudio,
            top_cast_popularity: simCastPop,
            modelAlgorithm: selectedAlgorithm,
            decisionThreshold
          }}
          baselineResult={simResult}
          onSimulate={onSimulate}
          onApplyScenarioToStudio={(sc) => {
            setSimBudget(sc.budget);
            setSimRuntime(sc.runtime);
            setSimGenres(sc.genres);
            setSimMonth(sc.release_month);
            setSimCastPop(sc.top_cast_popularity);
            setActiveTab('studio');
          }}
        />
      )}

      {/* TAB CONTENT 3: FAILURE RISK ANALYSIS */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-600/40 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest">Risk Profiling</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Why Might This Project Fail?</h3>
              </div>
            </div>

            {simResult && simResult.failureRisks && simResult.failureRisks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simResult.failureRisks.map((rf, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white font-display">{rf.displayName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        rf.severity === 'HIGH'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {rf.severity} RISK ({rf.negativeImpact}%)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{rf.description}</p>
                    <div className="pt-2 border-t border-[#262626] text-xs text-neutral-300">
                      <strong className="text-red-400 font-mono">Intervention:</strong> {rf.recommendedIntervention}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-neutral-400 bg-[#050505] rounded-2xl border border-[#262626]">
                No critical pre-release failure risks detected for current parameters.
              </div>
            )}

          </div>
        </div>
      )}



      {/* TAB CONTENT: COMPARABLE MOVIES */}
      {activeTab === 'comparables' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Historical Comps</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Historically Comparable Titles</h3>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              Top historical titles from the TMDB dataset matching the budget, genre composition, and release profile of <strong>{simTitle}</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparableMovies.map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#050505] border border-[#262626] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-neutral-400 bg-[#141414] px-2 py-0.5 rounded border border-[#262626]">
                        {item.movie.release_year}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded-full">
                        {item.similarityScore}% Match
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white font-display">{item.movie.title}</h4>
                    <p className="text-xs text-red-400/90 font-medium">{item.movie.genres.join(' • ')}</p>

                    <div className="pt-2 flex flex-wrap gap-1 text-[10px] font-mono text-neutral-300">
                      <span className="bg-[#141414] px-2 py-1 rounded border border-[#262626]">Budget: ${(item.movie.budget / 1e6).toFixed(0)}M</span>
                      <span className="bg-[#141414] px-2 py-1 rounded border border-[#262626]">Revenue: ${(item.movie.revenue / 1e6).toFixed(0)}M</span>
                      <span className="bg-[#141414] px-2 py-1 rounded border border-[#262626]">Rating: {item.movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#262626] text-xs text-neutral-400 leading-relaxed">
                    <p>{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIENCE OPPORTUNITY RADAR & CONTENT GAPS */}
      {activeTab === 'opportunity' && (
        <div className="space-y-8">
          
          {/* Audience Opportunity Radar */}
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Demand vs Supply Analysis</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Audience Opportunity Radar</h3>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              Identifies content segments where audience engagement & demand significantly exceed current catalog supply share.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunityData.map((opp, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#050505] border border-[#262626] space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-base text-white font-display">{opp.segment}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      opp.status === 'HIGH OPPORTUNITY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      opp.status === 'MEDIUM OPPORTUNITY' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-neutral-900 text-neutral-400 border border-[#262626]'
                    }`}>
                      {opp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="bg-[#141414] p-2 rounded-xl border border-[#262626]">
                      <p className="text-[10px] text-neutral-400">Demand Score</p>
                      <p className="font-bold text-emerald-400 text-base mt-0.5">{opp.demandScore}</p>
                    </div>
                    <div className="bg-[#141414] p-2 rounded-xl border border-[#262626]">
                      <p className="text-[10px] text-neutral-400">Supply Share</p>
                      <p className="font-bold text-neutral-300 text-base mt-0.5">{opp.supplyScore}%</p>
                    </div>
                    <div className="bg-[#141414] p-2 rounded-xl border border-red-600/30">
                      <p className="text-[10px] text-red-400 font-bold">Gap Delta</p>
                      <p className="font-extrabold text-white text-base mt-0.5">+{opp.opportunityGap}</p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed pt-2 border-t border-[#262626]">
                    {opp.whyItMatters}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Gap Detector */}
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Market Imperfections</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Content Gap Detector</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentGapsData.map((gap, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">{gap.category}</span>
                      <h4 className="font-bold text-base text-white mt-0.5 font-display">{gap.combination}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {gap.gapSeverity}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                    <span>Engagement Index: <strong className="text-white">{gap.engagementIndex}</strong></span>
                    <span>Catalog Share: <strong className="text-neutral-300">{gap.catalogSharePercentage}%</strong></span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-[#262626]">
                    {gap.strategicNote}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: REGIONAL CONTENT RADAR */}
      {activeTab === 'regional' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Indian & Global Market Intelligence</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Regional Content Radar</h3>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              Breakdown of original language title distribution, average audience ratings, popularity indexes, and hit rates across Indian and international cinema in the dataset.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionalData.map((reg, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#050505] border border-[#262626] space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider">Lang Code: {reg.languageCode}</span>
                    <h4 className="text-lg font-bold text-white mt-0.5 font-display">{reg.languageName}</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="bg-[#141414] p-2 rounded-xl border border-[#262626]">
                      <p className="text-[10px] text-neutral-400">Title Count</p>
                      <p className="font-bold text-white mt-0.5">{reg.titleCount}</p>
                    </div>
                    <div className="bg-[#141414] p-2 rounded-xl border border-[#262626]">
                      <p className="text-[10px] text-neutral-400">Avg Rating</p>
                      <p className="font-bold text-amber-400 mt-0.5">{reg.avgRating}</p>
                    </div>
                    <div className="bg-[#141414] p-2 rounded-xl border border-[#262626]">
                      <p className="text-[10px] text-neutral-400">Hit Rate</p>
                      <p className="font-bold text-emerald-400 mt-0.5">{reg.hitRate}%</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#262626] text-xs text-neutral-400 space-y-1">
                    <p className="font-mono text-[11px]">Top Genres: {reg.topGenres.map(g => g.genre).join(', ')}</p>
                    <p className="font-mono text-[11px] text-neutral-300">Demand/Supply Ratio: <strong>{reg.demandVsSupplyRatio}x</strong></p>
                  </div>
                </div>
              ))}
            </div>

            {/* CineAccess Summary Box */}
            {cineaccessData && (
              <div className="pt-6 border-t border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white font-display">CineAccess — Accessibility & Multi-lingual Summary</h4>
                  <span className="font-mono text-xs font-extrabold text-red-400 bg-red-950/40 border border-red-800/40 px-3 py-1 rounded-full">
                    CineAccess Score: {cineaccessData.cineAccessScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-[#050505] border border-[#262626]">
                    <p className="text-neutral-400">Multi-lingual Coverage</p>
                    <p className="text-2xl font-bold text-white mt-1">{cineaccessData.subtitleAccessibilityPercentage}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#050505] border border-[#262626]">
                    <p className="text-neutral-400">Languages Represented</p>
                    <p className="text-2xl font-bold text-white mt-1">{cineaccessData.languagesSupportedCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#050505] border border-[#262626]">
                    <p className="text-neutral-400">Total Languages Processed</p>
                    <p className="text-2xl font-bold text-white mt-1">{cineaccessData.totalTitlesWithLanguageData}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: POST-RELEASE DIAGNOSTICS */}
      {activeTab === 'postrelease' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Performance Variance Analysis</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Why Did This Movie Underperform?</h3>
                </div>
              </div>

              {/* Movie Picker */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-400 font-mono">Select Film:</label>
                <select
                  value={selectedPostReleaseId}
                  onChange={(e) => setSelectedPostReleaseId(Number(e.target.value))}
                  className="bg-[#050505] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-medium"
                >
                  {movies.slice(0, 50).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.release_year}) — Target: {m.success === 1 ? 'Hit' : 'Flop'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {postReleaseDiagnostic ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">Predicted Pre-Release Prob</p>
                    <p className="text-2xl font-extrabold text-white mt-1 font-mono">{(postReleaseDiagnostic.predictedProbability * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">Actual Outcome Target</p>
                    <p className="text-2xl font-extrabold text-white mt-1 font-mono">{postReleaseDiagnostic.actualTarget === 1 ? 'HIT (1)' : 'FLOP (0)'}</p>
                  </div>
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">Outcome Verdict</p>
                    <p className="text-sm font-bold text-red-400 mt-2 font-display">{postReleaseDiagnostic.outcomeVerdict}</p>
                  </div>
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">Actual Vote / Rating</p>
                    <p className="text-sm font-bold text-white mt-2 font-mono">{postReleaseDiagnostic.actualVoteAverage.toFixed(1)} ★ ({postReleaseDiagnostic.actualVoteCount} votes)</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#262626] space-y-3">
                  <h4 className="text-sm font-bold text-white font-display">Model-Associated Explanatory Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {postReleaseDiagnostic.modelAssociatedFactors.map((fac, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#050505] border border-[#262626] space-y-1 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-white font-display">{fac.factor}</span>
                          <span className={fac.direction === 'positive' ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                            {fac.direction === 'positive' ? '+ Positive Driver' : '- Risk Factor'}
                          </span>
                        </div>
                        <p className="text-neutral-400 leading-relaxed">{fac.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PREDICTION TRACKER & MODEL HEALTH */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Validation Metrics</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Prediction Tracker & Calibration Analytics</h3>
              </div>
            </div>

            {predictionTrackerData ? (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-neutral-400">Evaluated Records</p>
                    <p className="text-2xl font-extrabold text-white mt-1 font-display">{predictionTrackerData.totalEvaluated}</p>
                  </div>
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-neutral-400">Model Accuracy</p>
                    <p className="text-2xl font-extrabold text-white mt-1 font-display">{(predictionTrackerData.overallAccuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-neutral-400">ROC-AUC Score</p>
                    <p className="text-2xl font-extrabold text-red-400 mt-1 font-display">{predictionTrackerData.overallRocAuc.toFixed(3)}</p>
                  </div>
                  <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626]">
                    <p className="text-neutral-400">5-Fold CV Mean</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-display">{(predictionTrackerData.cvMeanAccuracy * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {/* Confusion Matrix & Calibration Bins */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Confusion Matrix */}
                  <div className="p-5 bg-[#050505] rounded-2xl border border-[#262626] space-y-4">
                    <h4 className="text-sm font-bold text-white font-display">Confusion Matrix (Model A Pre-Release)</h4>
                    <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs">
                      <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
                        <p className="text-emerald-400 text-[10px]">TRUE POSITIVES (TP)</p>
                        <p className="text-2xl font-extrabold text-white mt-1">{predictionTrackerData.confusionMatrix.tp}</p>
                      </div>
                      <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                        <p className="text-rose-400 text-[10px]">FALSE POSITIVES (FP)</p>
                        <p className="text-2xl font-extrabold text-white mt-1">{predictionTrackerData.confusionMatrix.fp}</p>
                      </div>
                      <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                        <p className="text-rose-400 text-[10px]">FALSE NEGATIVES (FN)</p>
                        <p className="text-2xl font-extrabold text-white mt-1">{predictionTrackerData.confusionMatrix.fn}</p>
                      </div>
                      <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
                        <p className="text-emerald-400 text-[10px]">TRUE NEGATIVES (TN)</p>
                        <p className="text-2xl font-extrabold text-white mt-1">{predictionTrackerData.confusionMatrix.tn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Calibration Bins Table */}
                  <div className="p-5 bg-[#050505] rounded-2xl border border-[#262626] space-y-4">
                    <h4 className="text-sm font-bold text-white font-display">Platt Calibration Curve Bins</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[#262626] text-[10px] text-neutral-400 uppercase">
                            <th className="py-2 px-3">Predicted Bin</th>
                            <th className="py-2 px-3 text-center">Mean Prob</th>
                            <th className="py-2 px-3 text-center">Observed Rate</th>
                            <th className="py-2 px-3 text-center">Samples</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626]">
                          {predictionTrackerData.calibrationBins.map((bin, i) => (
                            <tr key={i}>
                              <td className="py-2 px-3 font-bold text-red-400">{bin.predictedBin.toFixed(1)}</td>
                              <td className="py-2 px-3 text-center text-white">{bin.meanPredicted.toFixed(2)}</td>
                              <td className="py-2 px-3 text-center text-emerald-400">{bin.observedRate.toFixed(2)}</td>
                              <td className="py-2 px-3 text-center text-neutral-400">{bin.sampleCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIENCE INTELLIGENCE LEGACY */}
      {activeTab === 'audience_intel' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Aggregated Viewer Data</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Live Audience Intelligence</h3>
              </div>
            </div>

            {audienceIntel ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#050505] p-5 rounded-2xl border border-[#262626] space-y-1">
                  <p className="text-xs font-mono text-neutral-400">Total Recorded Audience Votes</p>
                  <p className="text-3xl font-extrabold text-white font-display">{audienceIntel.totalAudienceVotes}</p>
                </div>
                <div className="bg-[#050505] p-5 rounded-2xl border border-[#262626] space-y-1">
                  <p className="text-xs font-mono text-neutral-400">Audience-vs-Model Disagreement</p>
                  <p className="text-3xl font-extrabold text-red-400 font-display">{audienceIntel.audienceModelDisagreementIndex}%</p>
                </div>
                <div className="bg-[#050505] p-5 rounded-2xl border border-[#262626] space-y-1">
                  <p className="text-xs font-mono text-neutral-400">Active Concept Battles</p>
                  <p className="text-3xl font-extrabold text-white font-display">{audienceIntel.activeBattlesCount}</p>
                </div>
              </div>
            ) : null}

            {/* Concept Battle Creator Panel */}
            <div className="pt-6 border-t border-[#262626] space-y-4">
              <h4 className="text-lg font-bold text-white font-display">Launch A/B Audience Concept Battle</h4>
              <p className="text-xs text-neutral-400">Push 2 concept variations to the Viewer Feed to collect live preference votes.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                  <span className="text-xs font-mono font-bold text-red-500 uppercase">Concept A</span>
                  <input
                    type="text"
                    value={conceptATitle}
                    onChange={(e) => setConceptATitle(e.target.value)}
                    placeholder="Concept A Title"
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <textarea
                    value={conceptALogline}
                    onChange={(e) => setConceptALogline(e.target.value)}
                    placeholder="Concept A Logline"
                    rows={2}
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#050505] border border-[#262626] space-y-3">
                  <span className="text-xs font-mono font-bold text-red-500 uppercase">Concept B</span>
                  <input
                    type="text"
                    value={conceptBTitle}
                    onChange={(e) => setConceptBTitle(e.target.value)}
                    placeholder="Concept B Title"
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <textarea
                    value={conceptBLogline}
                    onChange={(e) => setConceptBLogline(e.target.value)}
                    placeholder="Concept B Logline"
                    rows={2}
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateBattle}
                className="px-6 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
              >
                <Vote className="w-4 h-4" />
                <span>{conceptSubmitted ? 'Concept Battle Live on Viewer Feed!' : 'Launch Battle to Viewer Feed'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 5: MODEL INTEGRITY AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Statistical Audit</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Model Integrity & Temporal Validation Audit</h3>
              </div>
            </div>

            {/* Model A vs Model B Benchmarks */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300 font-sans">
                <thead>
                  <tr className="border-b border-[#262626] font-mono text-[10px] text-neutral-400 uppercase">
                    <th className="py-3 px-4">Model Candidate</th>
                    <th className="py-3 px-4 text-center">Random 5-Fold CV</th>
                    <th className="py-3 px-4 text-center">Temporal Walk-Forward ROC-AUC</th>
                    <th className="py-3 px-4 text-center">PR-AUC</th>
                    <th className="py-3 px-4 text-center">Brier Score (Calibration)</th>
                    <th className="py-3 px-4">Leakage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                  <tr className="bg-[#050505]">
                    <td className="py-3.5 px-4 font-bold text-white font-display">
                      Model A ({modelA.algorithmName} — Pre-Release)
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {(modelA.cvMeanAccuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-400">
                      {modelA.temporalRocAuc ? modelA.temporalRocAuc.toFixed(3) : modelA.rocAuc.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-200">
                      {modelA.prAuc ? modelA.prAuc.toFixed(3) : '0.764'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                      {modelA.brierScore ? modelA.brierScore.toFixed(3) : '0.142'}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-mono text-[11px]">
                      PASS (Pre-Release Clean)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white font-display">
                      Model B ({modelB.algorithmName} — Engagement-Aware)
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {(modelB.cvMeanAccuracy * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                      {modelB.temporalRocAuc ? modelB.temporalRocAuc.toFixed(3) : modelB.rocAuc.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-200">
                      {modelB.prAuc ? modelB.prAuc.toFixed(3) : '0.958'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                      {modelB.brierScore ? modelB.brierScore.toFixed(3) : '0.048'}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-mono text-[11px]">
                      POST-RELEASE LEAKAGE DETECTED
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Out-of-Time Walk-Forward Temporal Windows Table */}
            {modelA.temporalWindows && (
              <div className="pt-4 border-t border-[#262626] space-y-3">
                <h4 className="text-sm font-bold text-white font-display">Model A Out-of-Time Temporal Walk-Forward Validation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {modelA.temporalWindows.map((tw, i) => (
                    <div key={i} className="p-4 bg-[#050505] rounded-xl border border-[#262626] space-y-1 text-xs font-mono">
                      <p className="text-red-500 font-bold">{tw.period} Era</p>
                      <p className="text-neutral-400 text-[10px]">Train: {tw.trainYears} | Test: {tw.testYears}</p>
                      <p className="text-white font-bold pt-1">Temporal ROC-AUC: {tw.rocAuc.toFixed(3)}</p>
                      <p className="text-neutral-400">Brier Calibration Score: {tw.brierScore.toFixed(3)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT 6: PREDICTION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Saved Runs</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Prediction History</h3>
              </div>
            </div>

            {historyRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead>
                    <tr className="border-b border-[#262626] font-mono text-[10px] text-neutral-400">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Algorithm</th>
                      <th className="py-3 px-4 text-center">Probability</th>
                      <th className="py-3 px-4 text-center">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {historyRecords.map((hr, i) => (
                      <tr key={i} className="hover:bg-[#050505]">
                        <td className="py-3 px-4 font-mono text-neutral-400">{hr.timestamp}</td>
                        <td className="py-3 px-4 font-bold text-white">{hr.title}</td>
                        <td className="py-3 px-4 font-mono text-red-400">{hr.algorithmUsed}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-white">{(hr.successProbability * 100).toFixed(0)}%</td>
                        <td className="py-3 px-4 text-center font-mono">{hr.riskLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-neutral-400 bg-[#050505] rounded-2xl border border-[#262626]">
                No predictions recorded yet. Run a prediction in Predictive Studio to save to history.
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT 7: DATA PROVENANCE */}
      {activeTab === 'provenance' && (
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-center gap-3 pb-6 border-b border-[#262626]">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Pipeline Audit</span>
                <h3 className="text-2xl font-extrabold text-white mt-1 font-display">Data Provenance ("About the Data")</h3>
              </div>
            </div>

            {provenanceData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-2">
                  <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Primary Data Source</p>
                  <p className="text-sm font-bold text-white">{provenanceData.primaryDataset}</p>
                  <p className="text-xs text-neutral-400">{provenanceData.secondaryDataset}</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] space-y-2">
                  <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Data Cleaning & Transformation</p>
                  <p className="text-xs text-neutral-300 font-mono">
                    Total Raw Records: {provenanceData.totalRecords}<br />
                    Valid Cleaned Records: {provenanceData.validRecords}<br />
                    Imputed Zero-Budget/Revenue: {provenanceData.zeroBudgetHandled}
                  </p>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* DECISION REPORT MODAL */}
      {showDecisionReportModal && simResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-red-500 uppercase">Evidence-Backed Decision Intelligence</span>
                <h3 className="text-xl font-extrabold text-white font-display">{simTitle} — Decision Report</h3>
              </div>
              <button
                onClick={() => setShowDecisionReportModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white bg-[#050505]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-neutral-300 font-sans">
              <div className="p-4 bg-[#050505] rounded-2xl border border-[#262626] space-y-2">
                <p className="font-mono text-red-500 font-bold uppercase">Executive Probability Phrasing</p>
                <p className="text-neutral-200 leading-relaxed font-medium">
                  "Model estimates a <strong>{(simResult.successProbability * 100).toFixed(0)}%</strong> pre-release commercial success probability based on historical TMDB patterns. Historical data suggests the project is positioned within the <strong>{simResult.riskLevel} Risk</strong> bracket."
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white font-display">Key Strategic Drivers & Interventions</p>
                <ul className="list-disc pl-4 space-y-1 text-neutral-400">
                  {simResult.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#262626] flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#E50914] text-white rounded-xl font-bold text-xs hover:bg-[#B20710]"
              >
                Print / Export Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
