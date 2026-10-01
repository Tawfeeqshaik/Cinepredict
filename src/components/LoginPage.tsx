import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  Film, Lock, User, Clapperboard, Eye, ArrowRight, Sparkles, 
  Video, Ticket, Star, Flame, TrendingUp, Award, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { apiLogin } from '../services/api_client';
import { CinemaBackground } from './background/CinemaBackground';
import { Reveal } from './motion/Reveal';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const FEATURED_SHOWCASE_MOVIES = [
  {
    title: "Avatar: The Way of Water",
    year: 2022,
    genre: "Sci-Fi / Action",
    roi: "11.7x ROI",
    revenue: "$2.32 Billion",
    predicted: "98% Blockbuster Match",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Oppenheimer",
    year: 2023,
    genre: "Biography / Drama",
    roi: "9.5x ROI",
    revenue: "$957 Million",
    predicted: "94% Award Favorite",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Interstellar",
    year: 2014,
    genre: "Sci-Fi / Adventure",
    roi: "4.1x ROI",
    revenue: "$773 Million",
    predicted: "89% Cult Success",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('producer');
  
  // Status messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active showcase movie selector
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);

    try {
      const { user } = await apiLogin(username.trim(), password.trim(), role);
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    const u = demoRole === 'producer' ? 'producer_demo' : 'viewer_demo';
    const p = 'demo123';
    setUsername(u);
    setPassword(p);
    setRole(demoRole);
    setErrorMsg(null);
    setLoading(true);
    try {
      const { user } = await apiLogin(u, p, demoRole);
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const activeShowcase = FEATURED_SHOWCASE_MOVIES[selectedMovieIndex];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-[#E50914] selection:text-white">
      
      {/* 1. CINEMATIC FULL-BLEED BACKGROUND (POSTER WALL MARQUEE + BLOOMS + GRAIN) */}
      <CinemaBackground variant="hero" />

      {/* 2. TOP FILM SPROCKET STRIP */}
      <div className="w-full bg-[#0B0B0B]/80 backdrop-blur-md border-b border-[#262626] py-1.5 px-3 flex justify-between items-center z-20 overflow-hidden">
        <div className="flex gap-2 sm:gap-4 opacity-40">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-3.5 h-2 bg-red-600/30 rounded-[2px] border border-red-500/40" />
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-red-500 tracking-widest uppercase">
          <Film className="w-3.5 h-3.5 text-red-500 reel-spin" />
          <span>35MM CINEMATIC TMDB DATA STREAM • REEL #4803</span>
        </div>
        <div className="flex gap-2 sm:gap-4 opacity-40">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-3.5 h-2 bg-red-600/30 rounded-[2px] border border-red-500/40" />
          ))}
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE CONTENT */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        
        {/* Left Column Showcase */}
        <div className="w-full lg:w-1/2 space-y-8 text-left">
          
          <Reveal direction="up" delay={0.1}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Next-Gen Entertainment Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] font-display">
                Predict Box Office <br />
                <span className="text-[#E50914] drop-shadow-[0_0_25px_rgba(229,9,20,0.4)]">
                  Before The First Cut.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                Powered by 4,800+ TMDB film datasets, dual machine learning models, 5-fold cross-validation, SHAP explainability, and live audience decision loops.
              </p>

              {/* Instant 1-Click Launch Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleQuickDemo('producer')}
                  className="px-5 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Clapperboard className="w-4 h-4" />
                  <span>Launch Producer Suite</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleQuickDemo('viewer')}
                  className="px-5 py-3 bg-[#141414] hover:bg-[#202020] text-white border border-[#262626] font-bold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-red-500" />
                  <span>Explore Viewer Feed</span>
                </motion.button>
              </div>
            </div>
          </Reveal>

          {/* Interactive Movie Showcase Card with Motion */}
          <Reveal direction="up" delay={0.25}>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="relative bg-[#141414]/90 backdrop-blur-xl border border-[#262626] hover:border-red-600/40 rounded-3xl p-6 shadow-2xl overflow-hidden group transition-colors"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                style={{ backgroundImage: `url(${activeShowcase.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#E50914] rounded-2xl p-0.5 shadow-lg shadow-red-600/30 flex items-center justify-center text-white">
                    <Film className="w-6 h-6 reel-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                      <span>{activeShowcase.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                        {activeShowcase.year}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">{activeShowcase.genre}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {FEATURED_SHOWCASE_MOVIES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedMovieIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        selectedMovieIndex === idx
                          ? 'bg-[#E50914] w-7'
                          : 'bg-neutral-700 hover:bg-neutral-500 w-2.5'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 text-center">
                <div className="p-3 bg-[#050505]/80 border border-[#262626] rounded-2xl">
                  <p className="text-[10px] text-neutral-400 font-mono flex items-center justify-center gap-1">
                    <DollarSign className="w-3 h-3 text-red-500" /> REVENUE
                  </p>
                  <p className="text-sm font-extrabold text-white mt-1 font-display">{activeShowcase.revenue}</p>
                </div>

                <div className="p-3 bg-[#050505]/80 border border-[#262626] rounded-2xl">
                  <p className="text-[10px] text-neutral-400 font-mono flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-red-500" /> MULTIPLIER
                  </p>
                  <p className="text-sm font-extrabold text-white mt-1 font-display">{activeShowcase.roi}</p>
                </div>

                <div className="p-3 bg-[#050505]/80 border border-[#262626] rounded-2xl">
                  <p className="text-[10px] text-neutral-400 font-mono flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-red-500" /> MATCH
                  </p>
                  <p className="text-sm font-extrabold text-red-400 mt-1 font-display">{activeShowcase.predicted}</p>
                </div>
              </div>

            </motion.div>
          </Reveal>

        </div>

        {/* Right Column Auth Card with Cinematic Float & Reveal */}
        <div className="w-full lg:w-[440px] relative">
          
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 28, scale: 0.98 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-[#141414]/90 backdrop-blur-2xl border border-[#262626] hover:border-neutral-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 transition-all"
          >
            
            {/* Card Brand Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.08, rotate: 5 }}
                  className="w-12 h-12 rounded-2xl bg-[#E50914] flex items-center justify-center text-white shadow-lg shadow-red-600/30"
                >
                  <Video className="w-6 h-6" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1 font-display">
                    <span>CINE</span>
                    <span className="text-[#E50914]">PREDICT</span>
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                    Decision Intelligence Gateway
                  </p>
                </div>
              </div>
            </div>

            {/* Animated Tab Switcher */}
            <div className="grid grid-cols-2 bg-[#050505] p-1.5 rounded-2xl border border-[#262626] mb-6 relative">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                }}
                className={`relative py-2 text-xs font-bold rounded-xl transition-all z-10 cursor-pointer ${
                  activeTab === 'login' ? 'text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {activeTab === 'login' && (
                  <motion.div
                    layoutId="active-auth-tab"
                    className="absolute inset-0 bg-[#E50914] rounded-xl shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                }}
                className={`relative py-2 text-xs font-bold rounded-xl transition-all z-10 cursor-pointer ${
                  activeTab === 'signup' ? 'text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {activeTab === 'signup' && (
                  <motion.div
                    layoutId="active-auth-tab"
                    className="absolute inset-0 bg-[#E50914] rounded-xl shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                  Studio Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4 text-red-500" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. producer_demo"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050505] border border-[#262626] focus:border-red-600 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4 text-red-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050505] border border-[#262626] focus:border-red-600 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Role Selection on Signup with 3D Tilt Glow */}
              <AnimatePresence>
                {activeTab === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                      Studio Experience Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        type="button"
                        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                        onClick={() => setRole('producer')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs transition-all cursor-pointer ${
                          role === 'producer'
                            ? 'bg-[#E50914] border-red-500 text-white font-bold shadow-lg shadow-red-600/30'
                            : 'bg-[#050505] border-[#262626] text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <Clapperboard className="w-4 h-4" />
                        <span>Producer Suite</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                        onClick={() => setRole('viewer')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs transition-all cursor-pointer ${
                          role === 'viewer'
                            ? 'bg-[#E50914] border-red-500 text-white font-bold shadow-lg shadow-red-600/30'
                            : 'bg-[#050505] border-[#262626] text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        <span>Viewer Feed</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={shouldReduceMotion ? {} : { scale: 1.015 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                className="w-full py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Film className="w-4 h-4 reel-spin-fast" />
                    <span>Accessing Studio...</span>
                  </span>
                ) : (
                  <>
                    <span>{activeTab === 'signup' ? 'Create Studio Account' : 'Enter Studio Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Instant Demo Presets with Hover Motion */}
            <div className="mt-6 pt-5 border-t border-[#262626]">
              <p className="text-[11px] font-mono text-neutral-400 text-center mb-2.5 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>INSTANT DEMO PRESETS</span>
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  onClick={() => handleQuickDemo('producer')}
                  className="p-2.5 rounded-xl bg-[#050505] hover:bg-[#181818] border border-[#262626] hover:border-red-600/40 text-left text-[11px] transition-all group cursor-pointer"
                >
                  <p className="font-bold text-red-500 flex items-center gap-1.5">
                    <Clapperboard className="w-3.5 h-3.5" /> Producer Mode
                  </p>
                  <p className="text-neutral-500 text-[10px] font-mono mt-0.5">producer_demo / demo123</p>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={shouldReduceMotion ? {} : { y: -2, scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  onClick={() => handleQuickDemo('viewer')}
                  className="p-2.5 rounded-xl bg-[#050505] hover:bg-[#181818] border border-[#262626] hover:border-red-600/40 text-left text-[11px] transition-all group cursor-pointer"
                >
                  <p className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-red-500" /> Viewer Mode
                  </p>
                  <p className="text-neutral-500 text-[10px] font-mono mt-0.5">viewer_demo / demo123</p>
                </motion.button>
              </div>
            </div>

          </motion.div>

        </div>

      </div>

      {/* 4. BOTTOM BORDER STRIP */}
      <div className="w-full bg-[#0B0B0B]/80 backdrop-blur-md border-t border-[#262626] py-1.5 px-3 flex justify-between items-center z-20 overflow-hidden">
        <p className="text-[10px] text-neutral-500 font-mono text-center w-full">
          CinePredict Decision Intelligence Platform • TMDB 5000 Engine • 2026 Edition
        </p>
      </div>

    </div>
  );
};
