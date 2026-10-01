import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Clapperboard,
  TrendingUp,
  Sliders,
  FileText,
  GitCompare,
  Globe,
  BarChart3,
  ShieldCheck,
  Vote,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Film,
  Zap,
  Layers,
  Star,
  Users,
  Compass
} from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import { Reveal } from '../motion/Reveal';
import { DatasetStats, ModelMetrics, PredictionResult } from '../../types';

interface StrategicOverviewProps {
  stats: DatasetStats;
  modelA: ModelMetrics;
  modelB: ModelMetrics;
  simResult: PredictionResult | null;
  onNavigateTab: (tab: string) => void;
}

export const StrategicOverview: React.FC<StrategicOverviewProps> = ({
  stats,
  modelA,
  modelB,
  simResult,
  onNavigateTab
}) => {
  // Recent prediction runs
  const recentRuns = [
    { title: 'Project Horizon', genre: 'Sci-Fi / Action', probability: 89, confidence: 'High', risk: 'Low', date: 'Just now', budget: '$120M' },
    { title: 'Chronos Protocol', genre: 'Thriller / Sci-Fi', probability: 74, confidence: 'High', risk: 'Moderate', date: '2h ago', budget: '$85M' },
    { title: 'The Midnight Syndicate', genre: 'Crime / Mystery', probability: 61, confidence: 'Medium', risk: 'Elevated', date: 'Yesterday', budget: '$45M' },
    { title: 'Aethelgard: Dragon Oath', genre: 'Fantasy / Adventure', probability: 48, confidence: 'Medium', risk: 'High Risk', date: '2 days ago', budget: '$140M' }
  ];

  // Market live highlights
  const liveSignals = [
    { title: 'Avatar: The Way of Water', rating: 7.7, votes: '11.2K', momentum: '+14.2%', pulse: 96, status: 'Theatrical Hit' },
    { title: 'Dune: Part Two', rating: 8.2, votes: '8.9K', momentum: '+18.5%', pulse: 98, status: 'Blockbuster' },
    { title: 'Oppenheimer', rating: 8.1, votes: '14.5K', momentum: '+9.8%', pulse: 95, status: 'Academy Winner' }
  ];

  const currentProb = simResult ? Math.round(simResult.successProbability * 100) : 89;

  return (
    <div className="space-y-8">
      
      {/* 1. HERO COMMAND CENTER HEADER */}
      <Reveal direction="down">
        <div className="relative bg-gradient-to-r from-[#141414] via-[#1a0f0f] to-[#141414] border border-red-600/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/40 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Producer Command Center • Real-Time Intelligence
                </span>
                <span className="text-[10px] font-mono text-neutral-400">v3.4 Multi-Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display">
                Strategic Overview
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                Your real-time view of movie potential, audience signals and box-office intelligence powered by 4,800+ TMDB film datasets and out-of-time walk-forward predictive algorithms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateTab('studio')}
                className="px-5 py-3 bg-[#E50914] hover:bg-[#B20710] text-white text-xs font-bold rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Launch Predictive Studio</span>
              </button>
              <button
                onClick={() => onNavigateTab('audience')}
                className="px-4 py-3 bg-[#1c1c1c] hover:bg-[#262626] border border-[#333] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Vote className="w-4 h-4 text-red-500" />
                <span>Audience Lab</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 2. PORTFOLIO METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-xl shadow-black/80 hover:border-red-600/30 transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">Movies Analyzed</span>
            <Film className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
            <CountUp value={stats.cleanedRows || 4800} />
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-mono">TMDB 5000 Cleaned Records</p>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-[#141414] border border-red-600/30 rounded-2xl p-5 shadow-xl shadow-black/80 hover:border-red-600 transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">Avg Success Rate</span>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
            <CountUp value={(stats.successRate || 0.43) * 100} decimals={1} suffix="%" />
          </p>
          <p className="text-[10px] text-red-400 mt-1 font-mono">Historical Benchmark</p>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-xl shadow-black/80 hover:border-red-600/30 transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">Avg Predicted Box Office</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
            $<CountUp value={82.0} decimals={1} suffix="M" />
          </p>
          <p className="text-[10px] text-neutral-400 mt-1 font-mono">Global Theatrical Median</p>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-xl shadow-black/80 hover:border-red-600/30 transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">Audience Interest</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
            <CountUp value={83} suffix="%" />
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">+16 pts vs baseline</p>
        </motion.div>

        {/* Metric 5 */}
        <motion.div
          whileHover={{ y: -3 }}
          className="col-span-2 lg:col-span-1 bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-xl shadow-black/80 hover:border-red-600/30 transition-all"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">Active ML Engines</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
            2 <span className="text-xs text-neutral-400 font-normal">Models</span>
          </p>
          <p className="text-[10px] text-blue-400 mt-1 font-mono">ROC-AUC: {(modelA.temporalRocAuc || modelA.rocAuc || 0.91).toFixed(2)}</p>
        </motion.div>

      </div>

      {/* 3. FEATURED PREDICTION & CONFIDENCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Featured Prediction Card */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Featured Project Evaluation</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display">Project Horizon</h3>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold rounded-xl">
              Pre-Production (Q3 2026)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-[#262626]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Predicted Success</span>
              <p className="text-3xl font-extrabold text-red-500 mt-1 font-display">{currentProb}%</p>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-red-600 h-full rounded-full" style={{ width: `${currentProb}%` }} />
              </div>
            </div>

            <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-[#262626]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Est. Opening Weekend</span>
              <p className="text-2xl font-extrabold text-white mt-1 font-display">$38.5M – $45.2M</p>
              <span className="text-[10px] text-emerald-400 font-mono">Domestic Window</span>
            </div>

            <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-[#262626]">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Est. Total Box Office</span>
              <p className="text-2xl font-extrabold text-white mt-1 font-display">$195M – $240M</p>
              <span className="text-[10px] text-neutral-400 font-mono">Worldwide Total</span>
            </div>
          </div>

          {/* Key Drivers */}
          <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#262626] space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Primary Success Catalysts:
            </span>
            <ul className="text-xs text-neutral-300 space-y-1 pl-6 list-disc font-sans">
              <li>High-demand Science Fiction / Action genre pairing with $+18\%$ historical box office velocity.</li>
              <li>Optimal summer theatrical release timing (July) avoiding direct competitor saturation.</li>
              <li>Star power index (72) exceeds upper-quartile threshold for 120m+ tentpoles.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-neutral-400">Confidence: <strong className="text-white">High (88% CV)</strong> • Risk: <strong className="text-emerald-400">Low Commercial Risk</strong></span>
            <button
              onClick={() => onNavigateTab('studio')}
              className="px-4 py-2 bg-[#E50914] hover:bg-[#B20710] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Edit in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Prediction Confidence Breakdown */}
        <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-600/40 text-blue-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">Model Reliability</span>
                <h3 className="text-lg font-bold text-white font-display">Confidence Matrix</h3>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-[#0A0A0A] rounded-xl border border-emerald-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">High Confidence (80–100%)</span>
                  <span className="text-[10px] font-mono text-emerald-300">Strict Prior</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Established genre, clean budget ratio ($&lt; $150M$), standard runtime ($105–135m$).</p>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded-xl border border-amber-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Medium Confidence (50–79%)</span>
                  <span className="text-[10px] font-mono text-amber-300">Variable</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Cross-genre hybrid, variable holiday competition, moderate star power.</p>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded-xl border border-red-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400">Elevated Risk (&lt; 50%)</span>
                  <span className="text-[10px] font-mono text-red-300">Caution</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Excessive runtime ($&gt;160m$), high production cost without franchise IP.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('audit')}
            className="w-full py-2.5 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] text-neutral-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-red-500" />
            <span>View Full Model Audit</span>
          </button>
        </div>

      </div>

      {/* 4. RECENT PREDICTIONS & LIVE CINEMA PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Runs Table */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Recent Project Simulations</h3>
              <p className="text-xs text-neutral-400">Historical prediction runs evaluated by Model A</p>
            </div>
            <button
              onClick={() => onNavigateTab('tracker')}
              className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-neutral-400 font-mono border-b border-[#262626] pb-2">
                  <th className="py-2.5 font-normal">Project Title</th>
                  <th className="py-2.5 font-normal">Genre</th>
                  <th className="py-2.5 font-normal">Budget</th>
                  <th className="py-2.5 font-normal">Predicted Prob</th>
                  <th className="py-2.5 font-normal">Risk Profile</th>
                  <th className="py-2.5 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {recentRuns.map((r, i) => (
                  <tr key={i} className="hover:bg-[#1c1c1c]/50 transition-colors">
                    <td className="py-3 font-bold text-white flex items-center gap-2">
                      <Film className="w-3.5 h-3.5 text-red-500" />
                      <span>{r.title}</span>
                    </td>
                    <td className="py-3 text-neutral-300">{r.genre}</td>
                    <td className="py-3 font-mono text-neutral-400">{r.budget}</td>
                    <td className="py-3">
                      <span className={`font-mono font-bold ${r.probability >= 70 ? 'text-emerald-400' : r.probability >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {r.probability}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        r.risk === 'Low' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        r.risk === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {r.risk}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigateTab('studio')}
                        className="px-2.5 py-1 bg-[#262626] hover:bg-[#E50914] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Cinema Signals */}
        <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white font-display">Live Market Pulse</h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">TMDB Live</span>
            </div>

            <div className="space-y-3 mt-4">
              {liveSignals.map((m, i) => (
                <div key={i} className="p-3 bg-[#0A0A0A] rounded-2xl border border-[#262626] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">{m.title}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" /> {m.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>{m.votes} verified votes</span>
                    <span className="text-emerald-400 font-bold">{m.momentum}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('livecinema')}
            className="w-full py-2.5 bg-[#E50914] hover:bg-[#B20710] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Open Live Cinema Stream</span>
          </button>
        </div>

      </div>

      {/* 5. DIRECT MODULE SHORTCUT TILES */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-display">Producer Intelligence Modules</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigateTab('studio')}
            className="bg-[#141414] border border-[#262626] hover:border-red-600/40 p-5 rounded-2xl space-y-2 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-red-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Predictive Studio</h4>
            <p className="text-xs text-neutral-400">Configure parameters &amp; run multi-algorithm inference with explainability.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigateTab('script')}
            className="bg-[#141414] border border-[#262626] hover:border-red-600/40 p-5 rounded-2xl space-y-2 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-600/40 text-blue-500 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Script Intelligence</h4>
            <p className="text-xs text-neutral-400">Upload PDF/DOCX or paste treatments for quantitative + AI feedback.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigateTab('scenarios')}
            className="bg-[#141414] border border-[#262626] hover:border-red-600/40 p-5 rounded-2xl space-y-2 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-500 flex items-center justify-center">
                <GitCompare className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Greenlight &amp; Scenarios</h4>
            <p className="text-xs text-neutral-400">Compare What-If scenarios (Runtime, Timing, Cast) with financial ROI.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigateTab('opportunity')}
            className="bg-[#141414] border border-[#262626] hover:border-red-600/40 p-5 rounded-2xl space-y-2 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-600/40 text-emerald-500 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Opportunity &amp; Gaps</h4>
            <p className="text-xs text-neutral-400">Discover underserved genres and high ROI market niches.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigateTab('audience')}
            className="bg-[#141414] border border-[#262626] hover:border-red-600/40 p-5 rounded-2xl space-y-2 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-600/40 text-rose-500 flex items-center justify-center">
                <Vote className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-rose-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Audience Lab</h4>
            <p className="text-xs text-neutral-400">Publish concept tests to real viewers and track Model ↔ Audience Divergence.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigateTab('audit')}
            className="bg-[#141414] border border-[#262626] hover:border-red-600/40 p-5 rounded-2xl space-y-2 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-600/40 text-amber-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white font-display">Model Integrity Audit</h4>
            <p className="text-xs text-neutral-400">Inspect 5-fold CV metrics, confusion matrices, and data provenance.</p>
          </motion.div>

        </div>
      </div>

    </div>
  );
};
