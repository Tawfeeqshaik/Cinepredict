import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Movie,
  DatasetStats,
  ModelMetrics,
  ProjectSimulationInput,
  PredictionResult,
  ChatMessage,
  ModelAlgorithm,
  ConceptBattle
} from './types';
import { LoginPage } from './components/LoginPage';
import { ProducerDashboard } from './components/ProducerDashboard';
import { ViewerDashboard } from './components/ViewerDashboard';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CinemaBackground } from './components/background/CinemaBackground';
import { PageTransition } from './components/motion/PageTransition';
import { ApiModeModal } from './components/ui/ApiModeModal';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

import {
  Clapperboard,
  Sparkles,
  BrainCircuit,
  Eye,
  LogOut,
  Layers,
  TrendingUp,
  MessageSquare,
  Film,
  Menu,
  X,
  Vote,
  Compass,
  BarChart3,
  Database,
  History,
  Users,
  Globe,
  ShieldCheck,
  Heart,
  Gem,
  GitCompare,
  AlertTriangle,
  Search,
  FileText,
  Activity
} from 'lucide-react';

import {
  apiFetchInitialData,
  apiSelectAlgorithm,
  apiCreateConceptBattle,
  apiVoteConcept,
  apiToggleLike,
  apiSimulate,
  apiGetPersonalizedFeed,
  apiGetTopSimilar,
  apiGetHiddenGems,
  apiGetTrending,
  apiSendMessage,
  getApiConfig
} from './services/api_client';
import { getCleanedDataset } from './data/tmdb_dataset';
import { evaluateModels, getActiveConceptBattle } from './services/ml_engine';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cinepredict_active_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleSetUser = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('cinepredict_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cinepredict_active_user');
    }
  };
  
  // Dataset and Model states - initialize immediately from bundled data to prevent black screens
  const [movies, setMovies] = useState<Movie[]>(() => getCleanedDataset().movies);
  const [datasetStats, setDatasetStats] = useState<DatasetStats>(() => getCleanedDataset().stats);
  const [modelA, setModelA] = useState<ModelMetrics>(() => evaluateModels('random_forest').modelA);
  const [modelB, setModelB] = useState<ModelMetrics>(() => evaluateModels('random_forest').modelB);

  // Concept Validation Loop state
  const [conceptBattle, setConceptBattle] = useState<ConceptBattle | null>(() => {
    try { return getActiveConceptBattle(); } catch { return null; }
  });

  const [loadingData, setLoadingData] = useState(false);
  const [producerActiveTab, setProducerActiveTab] = useState<string>('overview');

  // Chatbot drawer state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dual-mode API configuration state
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiConfig, setApiConfigState] = useState(getApiConfig());

  useEffect(() => {
    const handleConfigChange = () => setApiConfigState(getApiConfig());
    window.addEventListener('cinepredict_api_config_change', handleConfigChange);
    return () => window.removeEventListener('cinepredict_api_config_change', handleConfigChange);
  }, []);

  // Refresh latest data from backend in background without blocking render
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const initial = await apiFetchInitialData();
        if (isMounted) {
          if (initial.movies?.length) setMovies(initial.movies);
          if (initial.stats) setDatasetStats(initial.stats);
          if (initial.modelA) setModelA(initial.modelA);
          if (initial.modelB) setModelB(initial.modelB);
          if (initial.conceptBattle) setConceptBattle(initial.conceptBattle);
        }
      } catch (err) {
        console.warn('[CinePredict Initial Data]', err);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Handle Algorithm Switch
  const handleSelectAlgorithm = async (algo: ModelAlgorithm) => {
    try {
      const data = await apiSelectAlgorithm(algo);
      if (data.modelA && data.modelB) {
        setModelA(data.modelA);
        setModelB(data.modelB);
      }
    } catch (err) {
      console.error('Failed to update algorithm evaluation:', err);
    }
  };

  // Handle Concept Battle Creation
  const handleCreateConceptBattle = async (conceptA: any, conceptB: any): Promise<ConceptBattle> => {
    const updated = await apiCreateConceptBattle(conceptA, conceptB);
    setConceptBattle(updated);
    return updated;
  };

  // Handle Concept Battle Vote
  const handleVoteConcept = async (choice: 'A' | 'B'): Promise<ConceptBattle> => {
    const updated = await apiVoteConcept(choice);
    setConceptBattle(updated);
    return updated;
  };

  // Handle Likes Toggle
  const handleToggleLike = async (movieId: number) => {
    if (!currentUser) return;

    // Optimistic UI update
    const updatedLiked = currentUser.likedMovieIds.includes(movieId)
      ? currentUser.likedMovieIds.filter(id => id !== movieId)
      : [...currentUser.likedMovieIds, movieId];

    const updatedUser = {
      ...currentUser,
      likedMovieIds: updatedLiked
    };
    handleSetUser(updatedUser);

    try {
      await apiToggleLike(currentUser.username, movieId);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Handle Role Toggle (Producer <-> Viewer)
  const handleRoleToggle = (newRole: 'producer' | 'viewer') => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      role: newRole
    };
    handleSetUser(updatedUser);
  };

  // Predict My Project simulation API call
  const handleSimulate = async (input: ProjectSimulationInput): Promise<PredictionResult> => {
    return await apiSimulate(input);
  };

  // Get Personalized Feed API call
  const handleGetPersonalizedFeed = async (likedIds: number[]) => {
    return await apiGetPersonalizedFeed(likedIds);
  };

  // Get Top Similar Movies API call
  const handleGetTopSimilar = async (referenceId: number) => {
    return await apiGetTopSimilar(referenceId);
  };

  // Get Hidden Gems API call
  const handleGetHiddenGems = async (genre?: string) => {
    return await apiGetHiddenGems(genre);
  };

  // Get Trending Genres API call
  const handleGetTrending = async () => {
    return await apiGetTrending();
  };

  // Send Chatbot message API call
  const handleSendMessage = async (query: string): Promise<ChatMessage> => {
    return await apiSendMessage(query);
  };

  // If not authenticated, render Login Page
  if (!currentUser) {
    return (
      <MotionConfig reducedMotion="user">
        <LoginPage onLoginSuccess={handleSetUser} />
      </MotionConfig>
    );
  }

  // Loading Screen while backend dataset initializes
  if (loadingData || !datasetStats || !modelA || !modelB) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex items-center justify-center font-sans relative overflow-hidden">
        <CinemaBackground variant="ambient" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-8 bg-[#141414]/90 backdrop-blur-xl border border-[#262626] rounded-3xl max-w-sm shadow-2xl relative z-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
            <Film className="w-7 h-7 reel-spin-fast" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Initializing CinePredict Engine
          </h2>
          <p className="text-xs text-neutral-400 font-mono">
            Calibrating TMDB 5000 records &amp; pre-release priors...
          </p>
        </motion.div>
      </div>
    );
  }

  const userInitials = (currentUser.username || 'CP').slice(0, 2).toUpperCase();

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen w-full bg-[#050505] text-[#FFFFFF] font-sans overflow-hidden selection:bg-[#E50914] selection:text-white relative">
        
        {/* Ambient Cinema Backdrop (Grain + Blooms + Vignette) */}
        <CinemaBackground variant="ambient" />

        {/* 1. NETFLIX-STYLE STREAMING SIDEBAR (DESKTOP) */}
        <aside className="hidden lg:flex w-64 border-r border-[#262626] bg-[#050505]/95 backdrop-blur-xl flex-col flex-shrink-0 shadow-2xl relative z-20">
          
          {/* Brand Logo Header */}
          <div className="p-5 flex items-center gap-3 border-b border-[#1a1a1a]">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              className="w-9 h-9 bg-[#E50914] rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/30 font-bold flex-shrink-0"
            >
              <Film className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white font-display leading-none">
                CINE<span className="text-[#E50914]">PREDICT</span>
              </h1>
              <p className="text-[9px] text-neutral-500 font-mono mt-0.5">Entertainment Intelligence</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            
            {/* SECTION: PRODUCER MODE */}
            <div className="pb-2">
              <p className="text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-widest px-3 py-2">Producer</p>
              
              {/* Strategic Overview */}
              <button
                onClick={() => { handleRoleToggle('producer'); setProducerActiveTab('overview'); }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'overview'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'overview' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Clapperboard className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="relative z-10">Strategic Overview</span>
              </button>

              {/* Predictive Studio */}
              <button
                onClick={() => {
                  handleRoleToggle('producer');
                  setProducerActiveTab('studio');
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'studio'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'studio' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Sparkles className="w-4 h-4 flex-shrink-0 relative z-10 text-red-500" />
                <span className="relative z-10">Predictive Studio</span>
              </button>

              {/* Script Intelligence */}
              <button
                onClick={() => {
                  handleRoleToggle('producer');
                  setProducerActiveTab('script');
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'script'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'script' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <FileText className="w-4 h-4 flex-shrink-0 relative z-10 text-red-500" />
                <span className="relative z-10">Script Intelligence</span>
              </button>

              {/* Scenario Lab */}
              <button
                onClick={() => {
                  handleRoleToggle('producer');
                  setProducerActiveTab('scenarios');
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'scenarios'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'scenarios' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <GitCompare className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="relative z-10">Greenlight &amp; Scenarios</span>
              </button>

              {/* Opportunity Radar */}
              <button
                onClick={() => {
                  handleRoleToggle('producer');
                  setProducerActiveTab('opportunity');
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'opportunity'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'opportunity' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Globe className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="relative z-10">Opportunity &amp; Gaps</span>
              </button>

              {/* Prediction Tracker */}
              <button
                onClick={() => {
                  handleRoleToggle('producer');
                  setProducerActiveTab('tracker');
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'tracker'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'tracker' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <BarChart3 className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="relative z-10">Prediction Tracker</span>
              </button>

              {/* Model Integrity */}
              <button
                onClick={() => {
                  handleRoleToggle('producer');
                  setProducerActiveTab('audit');
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'audit'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'audit' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <ShieldCheck className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="relative z-10">Model Integrity</span>
              </button>

              {/* Audience Lab & Feedback */}
              <button
                onClick={() => {
                  handleRoleToggle('producer');
                  setProducerActiveTab('audience');
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'producer' && producerActiveTab === 'audience'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'producer' && producerActiveTab === 'audience' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Vote className="w-4 h-4 flex-shrink-0 relative z-10 text-red-500" />
                <span className="relative z-10">Audience Lab &amp; Signals</span>
              </button>
            </div>

            <div className="border-t border-[#1a1a1a] my-1" />

            {/* SECTION: VIEWER MODE */}
            <div className="pt-2">
              <p className="text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-widest px-3 py-2">Audience</p>

              {/* Audience Trends */}
              <button
                onClick={() => handleRoleToggle('viewer')}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentUser.role === 'viewer'
                    ? 'text-red-400 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {currentUser.role === 'viewer' && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-red-600/10 border-l-2 border-[#E50914] rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <TrendingUp className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="relative z-10">Audience Feed &amp; Trends</span>
              </button>

              {/* Audience Lab */}
              <button
                onClick={() => {
                  handleRoleToggle('viewer');
                  setTimeout(() => {
                    document.getElementById('audience-lab-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <Vote className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>Audience Lab Voting</span>
              </button>

              {/* Live Cinema */}
              <button
                onClick={() => {
                  handleRoleToggle('viewer');
                  setTimeout(() => {
                    document.getElementById('live-cinema-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <Activity className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>Live Cinema Stream</span>
              </button>

              {/* For You */}
              <button
                onClick={() => {
                  handleRoleToggle('viewer');
                  setTimeout(() => {
                    document.getElementById('for-you-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <Heart className="w-4 h-4 flex-shrink-0" />
                <span>For You</span>
              </button>

              {/* Hidden Gems */}
              <button
                onClick={() => {
                  handleRoleToggle('viewer');
                  setTimeout(() => {
                    document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <Gem className="w-4 h-4 flex-shrink-0" />
                <span>Discover &amp; Hidden Gems</span>
              </button>

              {/* Regional Cinema */}
              <button
                onClick={() => {
                  handleRoleToggle('viewer');
                  setTimeout(() => {
                    document.getElementById('regional-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span>Regional Cinema</span>
              </button>

              {/* Explore All */}
              <button
                onClick={() => {
                  handleRoleToggle('viewer');
                  setTimeout(() => {
                    document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <Search className="w-4 h-4 flex-shrink-0" />
                <span>Explore All Titles</span>
              </button>

              {/* Concept Battle */}
              <button
                onClick={() => {
                  handleRoleToggle('viewer');
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 150);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                <Vote className="w-4 h-4 flex-shrink-0" />
                <span>Concept Battle</span>
              </button>
            </div>

            <div className="border-t border-[#1a1a1a] my-1" />

            {/* CineBot AI */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-neutral-400 hover:text-white hover:bg-[#141414] rounded-xl text-xs font-semibold transition-all duration-200 mt-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
                <span>CineBot AI Assistant</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-[#E50914] text-white flex-shrink-0">
                AI
              </span>
            </button>

            {/* Dataset & Model Health Badge */}
            {datasetStats && (
              <div className="mx-2 mt-3 p-3 bg-[#141414] border border-[#262626] rounded-xl space-y-1.5" title="Historical dataset statistics & trained ML model performance">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-widest">Dataset Active</p>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-500">TMDB 5K</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-neutral-500">Records</span>
                    <span className="text-neutral-300">{datasetStats.cleanedRows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono" title="Percentage of historical movies that achieved Rating >= 6.5 and Votes >= 100">
                    <span className="text-neutral-500">Historical Hit Rate</span>
                    <span className="text-neutral-300">{(datasetStats.successRate * 100).toFixed(1)}%</span>
                  </div>
                  {modelA && (
                    <div className="flex justify-between text-[9px] font-mono" title="5-Fold Cross-Validation accuracy of the trained Pre-Release ML Model">
                      <span className="text-neutral-500">Model Accuracy</span>
                      <span className="text-red-400 font-bold">{(modelA.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </nav>

          {/* User Profile Footer Card */}
          <div className="p-4 border-t border-[#262626] bg-[#050505]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E50914] flex items-center justify-center text-xs font-bold text-white shadow-md shadow-red-600/20 uppercase font-mono flex-shrink-0">
                  {userInitials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate font-display">{currentUser.username}</p>
                  <p className="text-[10px] text-neutral-400 capitalize font-mono">{currentUser.role} Mode</p>
                </div>
              </div>

              <button
                onClick={() => handleSetUser(null)}
                title="Log Out"
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-[#141414] rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </aside>

        {/* 2. MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          
          {/* Top Header */}
          <header className="border-b border-[#262626] bg-[#050505]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4 z-30">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-neutral-400 hover:text-white bg-[#141414] border border-[#262626] rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                  {currentUser.role === 'producer' ? 'Strategic Overview' : 'Personalized Audience Feed'}
                </h2>
                <p className="text-neutral-400 text-xs hidden sm:block">
                  {currentUser.role === 'producer'
                    ? 'Decision Intelligence Platform, What-If Scenarios, Signal Conflicts & Failure Risk Analysis.'
                    : 'TMDB content-based taste vector matching & concept battle voting engine.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              
              {/* Mode Selector Pill */}
              <button
                onClick={() => setIsApiModalOpen(true)}
                title="Click to configure API & Execution Mode (Local In-Browser vs Global API)"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] hover:border-neutral-700 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-sm group"
              >
                <span className={`w-2 h-2 rounded-full ${apiConfig.resolvedMode === 'local' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400 animate-pulse'}`} />
                <span className="text-neutral-300 group-hover:text-white">
                  {apiConfig.resolvedMode === 'local' ? '⚡ Local ML' : '🌐 Global API'}
                </span>
                <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300">
                  ({apiConfig.mode.toUpperCase()})
                </span>
              </button>

              {/* Role Toggle Pill with Animation */}
              <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-[#262626] relative">
                <button
                  onClick={() => handleRoleToggle('producer')}
                  className={`relative px-3 py-1 rounded-lg text-xs font-semibold transition-all z-10 cursor-pointer ${
                    currentUser.role === 'producer' ? 'text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {currentUser.role === 'producer' && (
                    <motion.div
                      layoutId="header-role-pill"
                      className="absolute inset-0 bg-[#E50914] rounded-lg shadow-md -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  Producer
                </button>

                <button
                  onClick={() => handleRoleToggle('viewer')}
                  className={`relative px-3 py-1 rounded-lg text-xs font-semibold transition-all z-10 cursor-pointer ${
                    currentUser.role === 'viewer' ? 'text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {currentUser.role === 'viewer' && (
                    <motion.div
                      layoutId="header-role-pill"
                      className="absolute inset-0 bg-[#E50914] rounded-lg shadow-md -z-10"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  Viewer
                </button>
              </div>

              {/* Ask AI Assistant Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsChatOpen(true)}
                className="px-3.5 py-2 bg-[#E50914] hover:bg-[#B20710] text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI Assistant</span>
              </motion.button>

            </div>

          </header>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-[#141414] border-b border-[#262626] p-4 space-y-2 z-40">
              <button
                onClick={() => { handleRoleToggle('producer'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-200 hover:bg-[#181818] rounded-xl text-xs font-semibold"
              >
                <Clapperboard className="w-4 h-4 text-red-500" />
                <span>Producer Dashboard</span>
              </button>
              <button
                onClick={() => { handleRoleToggle('viewer'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-200 hover:bg-[#181818] rounded-xl text-xs font-semibold"
              >
                <Eye className="w-4 h-4 text-red-500" />
                <span>Viewer Feed</span>
              </button>
              <button
                onClick={() => { setIsChatOpen(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-[#181818] rounded-xl text-xs font-semibold"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>CineBot AI Assistant</span>
              </button>
              <div className="pt-2 border-t border-[#262626] flex justify-between items-center text-xs text-neutral-400">
                <span>User: {currentUser.username}</span>
                <button onClick={() => handleSetUser(null)} className="text-red-400">Log Out</button>
              </div>
            </div>
          )}

          {/* Main View Area with Smooth Page Transition */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <AnimatePresence mode="wait">
              {currentUser.role === 'producer' ? (
                <PageTransition key="producer-dashboard">
                  <ErrorBoundary fallbackTitle="Producer Suite Error">
                    <ProducerDashboard
                      movies={movies}
                      stats={datasetStats}
                      modelA={modelA}
                      modelB={modelB}
                      tab={producerActiveTab}
                      onTabChange={setProducerActiveTab}
                      onSimulate={handleSimulate}
                      onSelectAlgorithm={handleSelectAlgorithm}
                      onCreateConceptBattle={handleCreateConceptBattle}
                    />
                  </ErrorBoundary>
                </PageTransition>
              ) : (
                <PageTransition key="viewer-dashboard">
                  <ErrorBoundary fallbackTitle="Viewer Dashboard Error">
                    <ViewerDashboard
                      user={currentUser}
                      movies={movies}
                      conceptBattle={conceptBattle}
                      onToggleLike={handleToggleLike}
                      onGetPersonalizedFeed={handleGetPersonalizedFeed}
                      onGetTopSimilar={handleGetTopSimilar}
                      onGetHiddenGems={handleGetHiddenGems}
                      onGetTrending={handleGetTrending}
                      onVoteConcept={handleVoteConcept}
                    />
                  </ErrorBoundary>
                </PageTransition>
              )}
            </AnimatePresence>
          </main>

        </div>

        {/* Grounded Chatbot Drawer */}
        <ChatbotDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onSendMessage={handleSendMessage}
          onToggleLike={handleToggleLike}
          likedMovieIds={currentUser.likedMovieIds}
        />

        {/* API & Deployment Engine Mode Modal */}
        <ApiModeModal
          isOpen={isApiModalOpen}
          onClose={() => {
            setIsApiModalOpen(false);
            setApiConfigState(getApiConfig());
          }}
        />

      </div>
    </MotionConfig>
  );
}
