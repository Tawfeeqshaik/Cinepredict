import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Globe,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import {
  getApiConfig,
  setApiConfig,
  testApiConnection,
  ApiMode,
  ApiConfig
} from '../../services/api_client';

interface ApiModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiModeModal: React.FC<ApiModeModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ApiConfig>(getApiConfig());
  const [customUrl, setCustomUrl] = useState<string>(config.baseUrl);
  const [selectedMode, setSelectedMode] = useState<ApiMode>(config.mode);

  // Ping test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs: number } | null>(null);

  // Storage counts
  const [stats, setStats] = useState({
    predictions: 0,
    projects: 0,
    tests: 0
  });

  const refreshStats = () => {
    try {
      const preds = JSON.parse(localStorage.getItem('cinepredict_prediction_history') || '[]');
      const projs = JSON.parse(localStorage.getItem('cinepredict_producer_projects') || '[]');
      const tsts = JSON.parse(localStorage.getItem('cinepredict_audience_tests') || '[]');
      setStats({
        predictions: Array.isArray(preds) ? preds.length : 0,
        projects: Array.isArray(projs) ? projs.length : 0,
        tests: Array.isArray(tsts) ? tsts.length : 0
      });
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      const current = getApiConfig();
      setConfig(current);
      setSelectedMode(current.mode);
      setCustomUrl(current.baseUrl);
      setTestResult(null);
      refreshStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = setApiConfig(selectedMode, customUrl);
    setConfig(updated);
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testApiConnection(customUrl);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || 'Connection failed', latencyMs: 0 });
    } finally {
      setTesting(false);
    }
  };

  const handleResetStorage = () => {
    if (window.confirm('Reset local storage demo state? This will clear custom saved predictions and restore default demo projects.')) {
      localStorage.removeItem('cinepredict_prediction_history');
      localStorage.removeItem('cinepredict_producer_projects');
      localStorage.removeItem('cinepredict_audience_tests');
      localStorage.removeItem('cinepredict_audience_responses');
      localStorage.removeItem('cinepredict_active_battle');
      refreshStats();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0d0f15] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#12151e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                API & Deployment Engine Mode
              </h3>
              <p className="text-xs text-neutral-400">
                Configure between In-Browser Local ML and Global Backend API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Active Status Pill */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${config.resolvedMode === 'local' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400 animate-pulse'}`} />
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  Active Resolver: 
                  <span className={config.resolvedMode === 'local' ? 'text-emerald-400' : 'text-blue-400'}>
                    {config.resolvedMode === 'local' ? '⚡ Local Client Engine' : '🌐 Global API Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {config.resolvedMode === 'local'
                    ? '100% In-Browser TypeScript ML & Storage (Netlify / Vercel Ready)'
                    : `Routing to ${config.baseUrl || 'same-origin /api'}`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
              {config.mode.toUpperCase()}
            </span>
          </div>

          {/* Mode Selection Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold tracking-wide text-neutral-400 uppercase">
              Select Execution Mode
            </label>

            {/* Option 1: Local Mode */}
            <div
              onClick={() => setSelectedMode('local')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedMode === 'local'
                  ? 'bg-emerald-950/20 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                  : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedMode === 'local' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      Local Mode (Recommended for Netlify & Vercel)
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Runs completely in-browser. Zero network requests, 0ms latency, zero 404/405 errors, and offline persistence.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="apiMode"
                  checked={selectedMode === 'local'}
                  onChange={() => setSelectedMode('local')}
                  className="mt-1 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Option 2: Auto Mode */}
            <div
              onClick={() => setSelectedMode('auto')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedMode === 'auto'
                  ? 'bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-950/40'
                  : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedMode === 'auto' ? 'bg-purple-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      Auto Detect Mode
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Automatically uses Local mode on Netlify/Vercel static URLs, and Global mode when a backend server is detected.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="apiMode"
                  checked={selectedMode === 'auto'}
                  onChange={() => setSelectedMode('auto')}
                  className="mt-1 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Option 3: Global Mode */}
            <div
              onClick={() => setSelectedMode('global')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedMode === 'global'
                  ? 'bg-blue-950/20 border-blue-500/60 shadow-lg shadow-blue-950/40'
                  : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedMode === 'global' ? 'bg-blue-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      Global API Mode (Remote Server)
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Connect to an external Node.js Express server or cloud API endpoint.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="apiMode"
                  checked={selectedMode === 'global'}
                  onChange={() => setSelectedMode('global')}
                  className="mt-1 accent-blue-500 cursor-pointer"
                />
              </div>

              {/* URL Input */}
              {(selectedMode === 'global' || selectedMode === 'auto') && (
                <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <label className="text-[11px] font-medium text-neutral-400">
                    Custom Backend Base URL (leave blank for same-origin):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. http://localhost:3000 or https://api.mysite.com"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-black/60 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 transition-colors flex items-center gap-1.5"
                    >
                      {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                      <span>Test Ping</span>
                    </button>
                  </div>

                  {testResult && (
                    <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                      testResult.ok ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50' : 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
                    }`}>
                      {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Storage & Engine Information */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Client Storage Diagnostics
              </span>
              <button
                type="button"
                onClick={handleResetStorage}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                Reset Demo Data
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-black/40 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Saved Predictions</div>
                <div className="text-sm font-bold text-white font-mono">{stats.predictions}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Tracked Projects</div>
                <div className="text-sm font-bold text-white font-mono">{stats.projects}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-neutral-800">
                <div className="text-neutral-400 text-[10px]">Audience Tests</div>
                <div className="text-sm font-bold text-white font-mono">{stats.tests}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-[#12151e]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <span>Apply Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
