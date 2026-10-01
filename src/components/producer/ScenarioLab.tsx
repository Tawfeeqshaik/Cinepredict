import React, { useState } from 'react';
import {
  ProjectSimulationInput,
  PredictionResult,
  ScenarioInput,
  ScenarioResult
} from '../../types';
import {
  GitCompare,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Film,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import { Reveal } from '../motion/Reveal';
import { motion } from 'framer-motion';

interface ScenarioLabProps {
  baselineInput: ProjectSimulationInput;
  baselineResult: PredictionResult | null;
  onSimulate: (input: ProjectSimulationInput) => Promise<PredictionResult>;
  onApplyScenarioToStudio?: (scenario: ScenarioInput) => void;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({
  baselineInput,
  baselineResult,
  onSimulate,
  onApplyScenarioToStudio
}) => {
  // Configured scenarios
  const [scenariosList, setScenariosList] = useState<ScenarioInput[]>([
    {
      id: 'sc_1',
      name: 'Scenario A: Optimize Runtime (115m)',
      budget: baselineInput.budget,
      runtime: 115,
      genres: baselineInput.genres,
      release_month: baselineInput.release_month,
      release_year: baselineInput.release_year || 2026,
      top_cast_popularity: baselineInput.top_cast_popularity
    },
    {
      id: 'sc_2',
      name: 'Scenario B: Shift to Holiday Window (Nov) & Star Boost',
      budget: Math.round(baselineInput.budget * 1.15),
      runtime: baselineInput.runtime,
      genres: baselineInput.genres,
      release_month: 11,
      release_year: baselineInput.release_year || 2026,
      top_cast_popularity: Math.min(100, baselineInput.top_cast_popularity + 15)
    },
    {
      id: 'sc_3',
      name: 'Scenario C: Lean Production Tier (-20% Budget)',
      budget: Math.round(baselineInput.budget * 0.8),
      runtime: 110,
      genres: baselineInput.genres,
      release_month: 7,
      release_year: baselineInput.release_year || 2026,
      top_cast_popularity: baselineInput.top_cast_popularity
    }
  ]);

  // Batch evaluation state
  const [batchResults, setBatchResults] = useState<ScenarioResult[]>([]);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchStatusText, setBatchStatusText] = useState<string>('IDLE');
  const [progress, setProgress] = useState(0);
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Helper: Run batch simulation with exact step reporting
  const handleRunBatch = async () => {
    setValidationError(null);
    if (scenariosList.length === 0) {
      setValidationError('Please add at least one scenario to evaluate.');
      return;
    }

    setIsRunningBatch(true);
    setBatchStatusText('VALIDATING');
    setProgress(10);

    try {
      // Step 1: Ensure baseline is calculated
      const baseResult = baselineResult || await onSimulate(baselineInput);
      setProgress(25);

      const computedResults: ScenarioResult[] = [];
      const total = scenariosList.length;

      for (let i = 0; i < total; i++) {
        setBatchStatusText(`RUNNING ${i + 1}/${total}`);
        const sc = scenariosList[i];
        
        // Evaluate scenario using ML simulation
        const scInput: ProjectSimulationInput = {
          title: sc.name,
          budget: sc.budget,
          runtime: sc.runtime,
          genres: sc.genres,
          release_month: sc.release_month,
          release_year: sc.release_year,
          production_company: baselineInput.production_company,
          top_cast_popularity: sc.top_cast_popularity,
          modelAlgorithm: baselineInput.modelAlgorithm || 'random_forest',
          decisionThreshold: baselineInput.decisionThreshold || 0.5
        };

        const scPred = await onSimulate(scInput);
        const deltaProb = Math.round((scPred.successProbability - baseResult.successProbability) * 1000) / 10;

        // Build changed variables description
        const changedVars: string[] = [];
        let why = '';

        if (sc.budget !== baselineInput.budget) {
          const diff = sc.budget - baselineInput.budget;
          changedVars.push(`Budget: $${(baselineInput.budget / 1e6).toFixed(0)}M → $${(sc.budget / 1e6).toFixed(0)}M (${diff > 0 ? '+' : ''}${(diff / 1e6).toFixed(0)}M)`);
          if (diff < 0) why += 'Lower capital outlay reduces the box-office breakeven hurdle. ';
          else why += 'Higher budget elevates visual scale requirements and breakeven target. ';
        }

        if (sc.runtime !== baselineInput.runtime) {
          changedVars.push(`Runtime: ${baselineInput.runtime}m → ${sc.runtime}m`);
          if (sc.runtime <= 125 && baselineInput.runtime > 135) {
            why += 'Trimmed runtime increases daily theatrical screening turnover capacity. ';
          }
        }

        if (sc.release_month !== baselineInput.release_month) {
          changedVars.push(`Release: Month ${baselineInput.release_month} → Month ${sc.release_month}`);
          if ([5, 6, 7, 11, 12].includes(sc.release_month)) {
            why += 'Shift into high-attendance holiday/summer theatrical window boosts opening momentum. ';
          }
        }

        if (sc.top_cast_popularity !== baselineInput.top_cast_popularity) {
          changedVars.push(`Cast Power: ${baselineInput.top_cast_popularity} → ${sc.top_cast_popularity}`);
          if (sc.top_cast_popularity > baselineInput.top_cast_popularity) {
            why += 'Elevated star power expands pre-sales awareness and opening weekend velocity. ';
          }
        }

        if (!why) {
          why = deltaProb >= 0
            ? 'Optimized parameter configuration aligns favorably with historical success priors.'
            : 'Modified parameters increased historical market risk exposure.';
        }

        computedResults.push({
          scenario: sc,
          prediction: scPred,
          deltaProbability: deltaProb,
          keyChangedVariables: changedVars.length > 0 ? changedVars : ['Baseline configuration retained'],
          whyImproved: why
        });

        setProgress(25 + Math.round(((i + 1) / total) * 70));
      }

      setBatchResults(computedResults);
      setBatchStatusText('COMPLETE');
      setProgress(100);
    } catch (err: any) {
      console.error('Batch evaluation error:', err);
      setValidationError('Evaluation encountered an error. Please check scenario parameters.');
      setBatchStatusText('FAILED');
    } finally {
      setIsRunningBatch(false);
    }
  };

  // Reset to Baseline
  const handleResetToBaseline = () => {
    setScenariosList([
      {
        id: 'sc_1',
        name: 'Scenario A: Optimize Runtime (115m)',
        budget: baselineInput.budget,
        runtime: 115,
        genres: baselineInput.genres,
        release_month: baselineInput.release_month,
        release_year: baselineInput.release_year || 2026,
        top_cast_popularity: baselineInput.top_cast_popularity
      },
      {
        id: 'sc_2',
        name: 'Scenario B: Shift to Holiday Window (Nov) & Star Boost',
        budget: Math.round(baselineInput.budget * 1.15),
        runtime: baselineInput.runtime,
        genres: baselineInput.genres,
        release_month: 11,
        release_year: baselineInput.release_year || 2026,
        top_cast_popularity: Math.min(100, baselineInput.top_cast_popularity + 15)
      },
      {
        id: 'sc_3',
        name: 'Scenario C: Lean Production Tier (-20% Budget)',
        budget: Math.round(baselineInput.budget * 0.8),
        runtime: 110,
        genres: baselineInput.genres,
        release_month: 7,
        release_year: baselineInput.release_year || 2026,
        top_cast_popularity: baselineInput.top_cast_popularity
      }
    ]);
    setBatchResults([]);
    setBatchStatusText('IDLE');
  };

  // Retry individual scenario
  const handleRetryScenario = async (scenarioId: string) => {
    const sc = scenariosList.find(s => s.id === scenarioId);
    if (!sc) return;

    try {
      const baseResult = baselineResult || await onSimulate(baselineInput);
      const scInput: ProjectSimulationInput = {
        title: sc.name,
        budget: sc.budget,
        runtime: sc.runtime,
        genres: sc.genres,
        release_month: sc.release_month,
        release_year: sc.release_year,
        production_company: baselineInput.production_company,
        top_cast_popularity: sc.top_cast_popularity,
        modelAlgorithm: baselineInput.modelAlgorithm || 'random_forest',
        decisionThreshold: baselineInput.decisionThreshold || 0.5
      };
      const scPred = await onSimulate(scInput);
      const deltaProb = Math.round((scPred.successProbability - baseResult.successProbability) * 1000) / 10;

      const newRes: ScenarioResult = {
        scenario: sc,
        prediction: scPred,
        deltaProbability: deltaProb,
        keyChangedVariables: [`Manual re-evaluation for ${sc.name}`],
        whyImproved: deltaProb >= 0 ? 'Individual simulation re-computed successfully.' : 'Individual simulation re-computed.'
      };

      setBatchResults(prev => [...prev.filter(r => r.scenario.id !== scenarioId), newRes]);
    } catch (err) {
      console.error('Retry error:', err);
    }
  };

  // Add a new custom scenario
  const handleAddScenario = () => {
    const nextIdx = scenariosList.length + 1;
    const newSc: ScenarioInput = {
      id: `sc_${Date.now()}`,
      name: `Scenario ${String.fromCharCode(64 + nextIdx)}: Custom Optimization`,
      budget: baselineInput.budget,
      runtime: baselineInput.runtime,
      genres: [...baselineInput.genres],
      release_month: baselineInput.release_month,
      release_year: baselineInput.release_year || 2026,
      top_cast_popularity: baselineInput.top_cast_popularity
    };
    setScenariosList([...scenariosList, newSc]);
    setEditingScenarioId(newSc.id);
  };

  // Duplicate a scenario
  const handleDuplicateScenario = (sc: ScenarioInput) => {
    const newSc: ScenarioInput = {
      ...sc,
      id: `sc_${Date.now()}`,
      name: `${sc.name} (Copy)`
    };
    setScenariosList([...scenariosList, newSc]);
  };

  // Delete a scenario
  const handleDeleteScenario = (id: string) => {
    setScenariosList(scenariosList.filter(s => s.id !== id));
    setBatchResults(batchResults.filter(r => r.scenario.id !== id));
    if (editingScenarioId === id) setEditingScenarioId(null);
  };

  // Update scenario field
  const handleUpdateScenario = (id: string, field: keyof ScenarioInput, value: any) => {
    setScenariosList(scenariosList.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const baselineProb = baselineResult ? Math.round(baselineResult.successProbability * 100) : 67;

  return (
    <div className="space-y-8 font-sans">
      
      {/* HEADER COMMAND STRIP */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center flex-shrink-0">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                  What-If Sensitivity Engine
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#E50914] text-white text-[9px] font-mono font-bold">
                  MULTI-SCENARIO BATCH
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-0.5">
                What-If Scenario Lab
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleResetToBaseline}
              className="px-3.5 py-2.5 bg-[#050505] hover:bg-[#181818] text-neutral-300 border border-[#262626] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              title="Reset all scenarios back to default baseline configurations"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Reset to Baseline</span>
            </button>

            <button
              type="button"
              onClick={handleAddScenario}
              className="px-4 py-2.5 bg-[#050505] hover:bg-[#181818] text-white border border-[#262626] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-500" />
              <span>Add Scenario</span>
            </button>

            <button
              type="button"
              onClick={handleRunBatch}
              disabled={isRunningBatch || scenariosList.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                isRunningBatch || scenariosList.length === 0
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#E50914] text-white hover:bg-[#B20710] shadow-lg shadow-red-600/30'
              }`}
            >
              {isRunningBatch ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{batchStatusText} ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Run Scenario Batch ({scenariosList.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="text-neutral-300 leading-relaxed max-w-3xl">
            Simulate alternative packaging, capital allocation tiers, release windows, and star-power indices against the trained ML model. The engine computes deterministic probability deltas ($\pm\Delta\%$), box-office revenue shifts, and explainable sensitivity drivers.
          </p>

          {batchStatusText !== 'IDLE' && (
            <div className="flex items-center gap-2 font-mono text-[11px] bg-[#050505] px-3 py-1.5 rounded-xl border border-[#262626]">
              <span className="text-neutral-500">Pipeline Status:</span>
              <span className={`font-bold ${
                batchStatusText === 'COMPLETE' ? 'text-emerald-400' :
                batchStatusText === 'FAILED' ? 'text-rose-400' :
                'text-amber-400 animate-pulse'
              }`}>
                {batchStatusText}
              </span>
            </div>
          )}
        </div>

        {validationError && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Real Progress Bar */}
        {isRunningBatch && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Evaluating scenario batch against 4,800 TMDB priors...</span>
              <span className="text-red-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-[#262626]">
              <div
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* SCENARIOS MANAGER & EDITORS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-500" />
            <span>Configured Project Scenarios ({scenariosList.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-neutral-400">
            Baseline: <strong className="text-white">{baselineInput.title}</strong> (${(baselineInput.budget / 1e6).toFixed(0)}M • {baselineInput.runtime}m • Month {baselineInput.release_month})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenariosList.map((sc, index) => {
            const isEditing = editingScenarioId === sc.id;
            const res = batchResults.find(r => r.scenario.id === sc.id);

            return (
              <div
                key={sc.id}
                className={`bg-[#141414] border rounded-2xl p-5 space-y-4 transition-all ${
                  isEditing ? 'border-red-600 shadow-xl shadow-red-600/10' : 'border-[#262626] hover:border-neutral-700'
                }`}
              >
                {/* Scenario Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={sc.name}
                      onChange={(e) => handleUpdateScenario(sc.id, 'name', e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-red-600 font-display"
                    />
                    <span className="text-[10px] font-mono text-neutral-500">ID: {sc.id.slice(0, 8)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Re-run this scenario individually"
                      onClick={() => handleRetryScenario(sc.id)}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-[#050505] rounded-lg transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Duplicate Scenario"
                      onClick={() => handleDuplicateScenario(sc)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#050505] rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete Scenario"
                      onClick={() => handleDeleteScenario(sc.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-[#050505] rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scenario Parameter Sliders */}
                <div className="space-y-3 pt-1 border-t border-[#1e1e1e] text-xs">
                  
                  {/* Budget */}
                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-neutral-400 text-[11px]">Budget:</span>
                      <span className="text-white font-bold">${(sc.budget / 1e6).toFixed(0)}M</span>
                    </div>
                    <input
                      type="range"
                      min="5000000"
                      max="250000000"
                      step="5000000"
                      value={sc.budget}
                      onChange={(e) => handleUpdateScenario(sc.id, 'budget', Number(e.target.value))}
                      className="w-full accent-red-600 bg-[#050505] h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Runtime */}
                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-neutral-400 text-[11px]">Runtime:</span>
                      <span className="text-red-400 font-bold">{sc.runtime}m</span>
                    </div>
                    <input
                      type="range"
                      min="75"
                      max="210"
                      step="1"
                      value={sc.runtime}
                      onChange={(e) => handleUpdateScenario(sc.id, 'runtime', Number(e.target.value))}
                      className="w-full accent-red-600 bg-[#050505] h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Release Month & Cast Power */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono block mb-1">Release Month</span>
                      <select
                        value={sc.release_month}
                        onChange={(e) => handleUpdateScenario(sc.id, 'release_month', Number(e.target.value))}
                        className="w-full bg-[#050505] border border-[#262626] rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <option key={m} value={m}>Month {m} ({new Date(2026, m - 1).toLocaleString('en', { month: 'short' })})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono block mb-1">Star Power: {sc.top_cast_popularity}</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={sc.top_cast_popularity}
                        onChange={(e) => handleUpdateScenario(sc.id, 'top_cast_popularity', Number(e.target.value))}
                        className="w-full accent-red-600 bg-[#050505] h-1.5 rounded-lg cursor-pointer mt-2"
                      />
                    </div>
                  </div>

                </div>

                {/* Evaluated Outcome Badge (If batch has run) */}
                {res && (
                  <div className="p-3 bg-[#050505] rounded-xl border border-[#262626] space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase">Predicted Success</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        res.deltaProbability > 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : res.deltaProbability < 0
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        {res.deltaProbability > 0 ? `+${res.deltaProbability}%` : `${res.deltaProbability}%`}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-white font-display">
                        {(res.prediction.successProbability * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        ROI: ~{(res.prediction.successProbability * 2.8).toFixed(1)}x
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed italic">
                      {res.whyImproved}
                    </p>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* SIDE-BY-SIDE COMPARISON MATRIX TABLE */}
      {batchResults.length > 0 && (
        <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                Full Comparison Matrix
              </span>
              <h3 className="text-xl font-extrabold text-white font-display mt-0.5">
                Baseline vs. Scenario Batch Evaluation
              </h3>
            </div>

            <div className="text-xs font-mono text-neutral-400 bg-[#050505] px-3.5 py-1.5 rounded-xl border border-[#262626]">
              Target: TMDB ROI &ge; 2.0x &amp; Rating &ge; 6.5
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#262626] bg-[#050505]">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#262626] text-neutral-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-4">Scenario Configuration</th>
                  <th className="py-3 px-3">Parameters Changed</th>
                  <th className="py-3 px-3 text-center">Success Prob</th>
                  <th className="py-3 px-3 text-center">&Delta; vs Base</th>
                  <th className="py-3 px-3 text-center">Risk Tier</th>
                  <th className="py-3 px-4">Model Sensitivity Drivers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                
                {/* Baseline Row */}
                <tr className="bg-[#0b0b0b]">
                  <td className="py-3.5 px-4 font-bold text-white font-display">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-400" />
                      <span>Baseline: {baselineInput.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-neutral-400 font-mono text-[11px]">
                    ${(baselineInput.budget / 1e6).toFixed(0)}M • {baselineInput.runtime}m • Month {baselineInput.release_month}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-white text-sm">
                    {baselineProb}%
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-neutral-500">
                    0.0%
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                      {baselineResult?.riskLevel?.toUpperCase() || 'MODERATE'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400 italic text-[11px]">
                    Reference project baseline.
                  </td>
                </tr>

                {/* Scenario Batch Rows */}
                {batchResults.map((sr, idx) => (
                  <tr key={idx} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white font-display">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          sr.deltaProbability > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        <span>{sr.scenario.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-neutral-300 font-mono text-[11px]">
                      {sr.keyChangedVariables.join(' • ')}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-white text-sm">
                      {(sr.prediction.successProbability * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        sr.deltaProbability > 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : sr.deltaProbability < 0
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        {sr.deltaProbability > 0 ? `+${sr.deltaProbability}%` : `${sr.deltaProbability}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sr.prediction.riskLevel === 'Low' ? 'bg-green-950 text-green-400 border border-green-800' :
                        sr.prediction.riskLevel === 'Moderate' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {sr.prediction.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 text-[11px] leading-relaxed">
                      {sr.whyImproved}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
