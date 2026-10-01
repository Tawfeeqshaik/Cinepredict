import React, { useState, useEffect } from 'react';
import {
  ProjectSimulationInput,
  PredictionResult,
  ScriptExtractionMetrics,
  ScriptQualitativeFeedback,
  ScriptIntelligenceResult
} from '../types';
import { apiExtractScript, apiAnalyzeScript } from '../services/api_client';
import {
  Upload,
  FileText,
  Sparkles,
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
  Users,
  Sliders,
  Film,
  Info,
  ShieldCheck,
  Zap,
  BookOpen,
  MessageSquare,
  Activity,
  FileCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
  Award,
  Compass
} from 'lucide-react';

const SAMPLE_SCRIPTS = [
  {
    title: "Project Horizon (Sci-Fi Spec Script)",
    genre: "Science Fiction / Action",
    text: `PROJECT HORIZON
Written by Alex Vance

EXT. ORBITAL PLATFORM ARES - NIGHT
Silent, cold cosmos. The quantum mining station hangs above the sulfur clouds of Io.

INT. CONTROL MODULE - CONTINUOUS
COMMANDER MARK STERLING (40s, weary, battle-hardened) stares into the flickering holographic terminal. Alarms pulse in low amber.

STERLING
Tell me that telemetry is a glitch, Elena.

DR. ELENA ROSTOVA (30s, astrophysicist, sharp eyes) keys rapid commands.

ELENA
The containment field collapsed at 0400. Whatever we pulled from the deep core... it's rewriting the station's core protocols.

A sudden tremor violently shakes the deckplates. Steam hiss.

STERLING
Lock down sub-levels four through nine. Nobody leaves until we know if it's airborne.

ELENA
(voice trembling)
Mark, it's not a virus. It's an intelligent broadcast. And it just answered our deep-space probe.

INT. ACCESS CORRIDOR - MINUTES LATER
Sterling sprints through flashing emergency strobes. Sparks shower from ruptured conduits.

CREWMAN CHEN
(into comms)
Breach in the starboard airlock! We have hull decompression!

Sterling draws his sidearm, securing the heavy bulkhead door as the automated lockdown seals.`
  },
  {
    title: "The Midnight Wire (Noir Detective Thriller)",
    genre: "Thriller / Crime",
    text: `THE MIDNIGHT WIRE
A Screenplay by Marcus Kane

EXT. RAIN-SLICKED ALLEYWAY - NIGHT
Neon reflections shimmer across oil-stained puddles. Rain drums relentlessly on corrugated tin.

INT. DETECTIVE JACK HUDSON'S SEDAN - CONTINUOUS
DETECTIVE JACK HUDSON (45, cigarette smoke curling, eyes dark with cynicism) listens through headphones. Static hisses on the tape reel.

HUDSON
(muttering)
Come on, Corcoran. Give me the account numbers.

ON THE WIRE:
VOICE (FILTERED)
The drop happens at the harbor terminal. Pier 42. Midnight sharp. If the DA asks, the evidence was incinerated in the warehouse fire.

HUDSON
Got you.

Hudson clicks the recorder off, checks his revolver, and steps out into the downpour.

EXT. HARBOR WAREHOUSE - NIGHT
Fog rolls off the bay. Two shadowy figures stand beside an idling black sedan with diplomatic plates.`
  },
  {
    title: "The Last Signal (Survival Sci-Fi)",
    genre: "Science Fiction / Drama",
    text: `THE LAST SIGNAL
Written by David Miller

EXT. DEEP SPACE RELAY STATION DELTA - NIGHT
Total sensory silence. The solar array is cracked, drifting in cold lunar shadow.

INT. COMMS COMPARTMENT - CONTINUOUS
DR. TARA REID (35, astrophysicist, exhausted) works by red emergency battery light. 

TARA
Recording log 412. Oxygen reserves at eleven percent. The automated distress beacon went dark three cycles ago.

She flips a series of manual toggle switches. Static crackles over the headset.

TARA (CONT'D)
If Earth station receives this... do not send a rescue team to coordinates Seven-Alpha. The anomaly isn't a dead star. It's a localized gravity collapse.

The station groans under intense tidal shear. Hull plating buckles.

TARA (CONT'D)
I'm venting the auxiliary fuel cells to hold orbit for another twenty minutes. That's all the time I have to transmit the telemetry.

She keys the high-gain transmission array. Progress bar pulses: 12%... 24%...`
  }
];

interface ScriptIntelligenceReportProps {
  onSimulate: (input: ProjectSimulationInput) => Promise<PredictionResult>;
}

export const ScriptIntelligenceReport: React.FC<ScriptIntelligenceReportProps> = ({ onSimulate }) => {
  const [scriptText, setScriptText] = useState(SAMPLE_SCRIPTS[0].text);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>('Project Horizon (Sci-Fi Spec Script).fountain');
  
  // Pipeline states
  const [extracting, setExtracting] = useState(false);
  const [extractedMetrics, setExtractedMetrics] = useState<ScriptExtractionMetrics | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportResult, setReportResult] = useState<ScriptIntelligenceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCalculationBreakdown, setShowCalculationBreakdown] = useState(false);

  // Editable confirmation values
  const [confirmedTitle, setConfirmedTitle] = useState('Project Horizon');
  const [confirmedRuntime, setConfirmedRuntime] = useState(115);
  const [confirmedBudget, setConfirmedBudget] = useState(65000000);
  const [confirmedCastPop, setConfirmedCastPop] = useState(72);
  const [confirmedGenres, setConfirmedGenres] = useState<string[]>(['Science Fiction', 'Action']);
  const [confirmedMonth, setConfirmedMonth] = useState(7);
  const [confirmedStudio, setConfirmedStudio] = useState('Warner Bros.');

  const availableGenres = ['Action', 'Adventure', 'Science Fiction', 'Fantasy', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Crime'];

  // Auto-extract on initial mount
  useEffect(() => {
    runExtraction(SAMPLE_SCRIPTS[0].text, 'Project Horizon (Sci-Fi Spec Script).fountain');
  }, []);

  // Handle File Upload (PDF, DOCX, TXT, Fountain, FDX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      let content = (event.target?.result as string) || '';
      
      // If binary artifacts exist (e.g. from raw PDF/DOCX byte stream), extract clean readable text blocks
      if (/[\x00-\x08\x0E-\x1F]/.test(content)) {
        const cleanLines = content
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
          .split(/[\r\n]+/)
          .map(l => l.trim())
          .filter(l => l.length > 2 && /^[A-Za-z0-9\s.,!?'"():;/\-]+$/.test(l));
        
        if (cleanLines.length > 5) {
          content = cleanLines.join('\n');
        }
      }

      setScriptText(content);
      await runExtraction(content, file.name);
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please ensure it is a valid PDF, DOCX, or TXT file.');
    };

    reader.readAsText(file);
  };

  // Load a Pre-Built Sample
  const handleLoadSample = async (sample: typeof SAMPLE_SCRIPTS[0]) => {
    setScriptText(sample.text);
    setUploadedFileName(sample.title + ".fountain");
    setErrorMsg(null);
    await runExtraction(sample.text, sample.title);
  };

  // Run Document Extraction
  const runExtraction = async (text: string, fileName?: string) => {
    if (!text.trim()) {
      setErrorMsg('Please paste or upload script text to extract.');
      return;
    }

    setExtracting(true);
    setErrorMsg(null);

    try {
      const ext = await apiExtractScript(text, fileName);
      if (ext) {
        setExtractedMetrics(ext);
        setConfirmedTitle(ext.title);
        setConfirmedRuntime(ext.estimatedRuntime);
        setConfirmedGenres(ext.detectedGenres.length > 0 ? ext.detectedGenres : ['Drama']);
      } else {
        throw new Error('Could not parse screenplay structure. Please ensure the document contains dialogue or slugline cues.');
      }
    } catch (err: any) {
      console.error('Script extraction error:', err);
      setErrorMsg(err.message || 'Failed to extract screenplay dimensions. Please check file formatting.');
    } finally {
      setExtracting(false);
    }
  };

  // Run Full Script Intelligence Analysis (Quantitative Model A + Qualitative Gemini)
  const handleRunFullAnalysis = async () => {
    if (!extractedMetrics) return;

    setAnalyzing(true);
    setErrorMsg(null);

    try {
      // 1. Run Quantitative Prediction via EXISTING Model A Pipeline
      const simInput: ProjectSimulationInput = {
        title: confirmedTitle,
        budget: confirmedBudget,
        runtime: confirmedRuntime,
        genres: confirmedGenres,
        release_month: confirmedMonth,
        release_year: 2026,
        production_company: confirmedStudio,
        top_cast_popularity: confirmedCastPop,
        modelAlgorithm: 'random_forest'
      };

      const quantResult = await onSimulate(simInput);

      // 2. Run Qualitative Gemini Script Analysis
      const qualFeedback = await apiAnalyzeScript(
        {
          ...extractedMetrics,
          title: confirmedTitle,
          estimatedRuntime: confirmedRuntime,
          detectedGenres: confirmedGenres
        },
        scriptText
      );

      setReportResult({
        extraction: {
          ...extractedMetrics,
          title: confirmedTitle,
          estimatedRuntime: confirmedRuntime,
          detectedGenres: confirmedGenres
        },
        quantitativePrediction: quantResult,
        qualitativeFeedback: qualFeedback
      });
    } catch (err: any) {
      console.error('Failed to generate script intelligence report:', err);
      setErrorMsg('Analysis failed. Please try again or calibrate values.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleGenre = (g: string) => {
    if (confirmedGenres.includes(g)) {
      if (confirmedGenres.length > 1) {
        setConfirmedGenres(confirmedGenres.filter(item => item !== g));
      }
    } else {
      if (confirmedGenres.length < 3) {
        setConfirmedGenres([...confirmedGenres, g]);
      }
    }
  };

  const handleReset = () => {
    setScriptText('');
    setUploadedFileName(null);
    setExtractedMetrics(null);
    setReportResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-8 font-sans pb-12">

      {/* HEADER BANNER */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262626] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                  Dual-Engine Architecture
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#E50914] text-white text-[9px] font-mono font-bold">
                  MODEL A + GEMINI
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-0.5">
                Script Intelligence Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-[#050505] px-3.5 py-2 rounded-xl border border-[#262626]">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>Honest Pre-Release ML + Uncoupled Narrative Feedback</span>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed max-w-4xl">
          Upload a screenplay or treatment document. CinePredict extracts structural dimensions (INT/EXT ratio, characters, conflict density, runtime), evaluates commercial viability through the <strong>Model A Machine Learning Engine</strong>, and generates distinct, uncoupled <strong>Gemini Qualitative Script Feedback</strong>.
        </p>
      </div>

      {/* STEP 1: UPLOAD & INGESTION (IF NO REPORT ACTIVE) */}
      {!reportResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* UPLOAD & TEXT AREA */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-4 shadow-xl">
              
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Upload className="w-4 h-4 text-red-500" />
                  <span>1. Upload Script or Treatment Document</span>
                </h3>
                {uploadedFileName && (
                  <span className="text-[11px] font-mono text-red-400 bg-[#050505] px-2.5 py-1 rounded-lg border border-[#262626]">
                    {uploadedFileName}
                  </span>
                )}
              </div>

              {/* Drag & Drop Box */}
              <label className="border-2 border-dashed border-[#262626] hover:border-red-600/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#050505]/60 transition-all group">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.fountain,.fdx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-red-600/10 group-hover:bg-red-600/20 text-red-500 flex items-center justify-center transition-all">
                  <FileCheck className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                  Click to browse or drop PDF / DOCX / Screenplay file
                </p>
                <p className="text-[10px] text-neutral-500 font-mono">
                  Supports .pdf, .docx, .txt, .fountain screenplay formats
                </p>
              </label>

              {/* Direct Text Paste Option */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 font-display">Or Paste Script / Outline Text Directly</label>
                  <span className="text-[10px] font-mono text-neutral-500">{scriptText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Paste script pages, scene outline, or story treatment here..."
                  rows={8}
                  className="w-full bg-[#050505] border border-[#262626] rounded-xl p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Quick Sample Selectors */}
              <div className="space-y-2 pt-2 border-t border-[#262626]">
                <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Or Load Sample Hollywood Screenplays:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_SCRIPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="px-3 py-1.5 rounded-xl bg-[#050505] border border-[#262626] hover:border-red-600 text-xs text-neutral-300 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-red-500" />
                      <span>{sample.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Parse Button */}
              <button
                type="button"
                onClick={() => runExtraction(scriptText, uploadedFileName || 'Direct Script Input')}
                disabled={extracting || !scriptText.trim()}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  extracting || !scriptText.trim()
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-[#E50914] text-white hover:bg-[#B20710] shadow-lg shadow-red-600/30'
                }`}
              >
                {extracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Script Diagnostics...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Extract Screenplay Dimensions</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* EXTRACTION CONFIRMATION & CALIBRATION FORM */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-4 shadow-xl">
              
              <div className="border-b border-[#262626] pb-3">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-500" />
                  <span>2. Producer Calibration &amp; Confirmation</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Review extracted screenplay metrics before running Model A prediction.
                </p>
              </div>

              {extractedMetrics ? (
                <div className="space-y-4">
                  
                  {/* Extracted Metrics Snapshot Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="bg-[#050505] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] text-neutral-500 uppercase">Est. Runtime</p>
                      <p className="font-bold text-white mt-0.5">{extractedMetrics.estimatedRuntime}m</p>
                    </div>
                    <div className="bg-[#050505] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] text-neutral-500 uppercase">Scenes</p>
                      <p className="font-bold text-white mt-0.5">{extractedMetrics.sceneCount}</p>
                    </div>
                    <div className="bg-[#050505] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] text-neutral-500 uppercase">Dialogue</p>
                      <p className="font-bold text-red-400 mt-0.5">{extractedMetrics.dialoguePercentage}%</p>
                    </div>
                    <div className="bg-[#050505] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] text-neutral-500 uppercase">INT/EXT</p>
                      <p className="font-bold text-white mt-0.5">{extractedMetrics.intExtRatio?.intCount || 0}I / {extractedMetrics.intExtRatio?.extCount || 0}E</p>
                    </div>
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 font-display mb-1">Confirmed Title</label>
                    <input
                      type="text"
                      value={confirmedTitle}
                      onChange={(e) => setConfirmedTitle(e.target.value)}
                      className="w-full bg-[#050505] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-medium"
                    />
                  </div>

                  {/* Runtime Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold font-display mb-1">
                      <span className="text-neutral-300">Calibrated Runtime:</span>
                      <span className="text-red-400 font-mono">{confirmedRuntime} minutes</span>
                    </div>
                    <input
                      type="range"
                      min="75"
                      max="210"
                      step="1"
                      value={confirmedRuntime}
                      onChange={(e) => setConfirmedRuntime(Number(e.target.value))}
                      className="w-full accent-red-600 bg-[#050505] h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Production Budget Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold font-display mb-1">
                      <span className="text-neutral-300">Target Production Budget:</span>
                      <span className="text-white font-mono">${(confirmedBudget / 1000000).toFixed(0)}M</span>
                    </div>
                    <input
                      type="range"
                      min="5000000"
                      max="250000000"
                      step="5000000"
                      value={confirmedBudget}
                      onChange={(e) => setConfirmedBudget(Number(e.target.value))}
                      className="w-full accent-red-600 bg-[#050505] h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Star Power Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold font-display mb-1">
                      <span className="text-neutral-300">Cast Star Power Index:</span>
                      <span className="text-white font-mono">{confirmedCastPop}/100</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={confirmedCastPop}
                      onChange={(e) => setConfirmedCastPop(Number(e.target.value))}
                      className="w-full accent-red-600 bg-[#050505] h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Detected Genres Multi-select Chips */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 font-display mb-1.5">Confirmed Genres (Max 3)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableGenres.map(g => {
                        const isSelected = confirmedGenres.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleToggleGenre(g)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#E50914] text-white shadow-md'
                                : 'bg-[#050505] text-neutral-400 hover:text-white border border-[#262626]'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Launch Full Dual Analysis Button */}
                  <button
                    type="button"
                    onClick={handleRunFullAnalysis}
                    disabled={analyzing}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer ${
                      analyzing
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#E50914] text-white hover:bg-[#B20710] shadow-xl shadow-red-600/40'
                    }`}
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Screenplay &amp; Generating Dual-Engine Intelligence...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Generate Script Intelligence Report</span>
                      </>
                    )}
                  </button>

                </div>
              ) : (
                <div className="p-8 text-center bg-[#050505] border border-[#262626] rounded-2xl text-neutral-500 text-xs font-mono space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-neutral-600" />
                  <p>Upload a script or click a sample to populate structural dimensions.</p>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* STEP 2: DUAL-ENGINE REPORT RESULTS (SIDE-BY-SIDE DISPLAY) */}
      {reportResult && (
        <div className="space-y-8">
          
          {/* Top Actions & Script Summary Strip */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                Analyzed Screenplay Document
              </span>
              <h3 className="text-xl font-extrabold text-white font-display">
                {reportResult.extraction.title}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {reportResult.extraction.pageCount} Pages · ~{reportResult.extraction.estimatedRuntime} Mins · {reportResult.extraction.sceneCount} Scenes · {reportResult.extraction.detectedGenres.join(', ')} · {reportResult.extraction.intExtRatio?.ratioText}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-[#050505] hover:bg-[#181818] text-neutral-300 border border-[#262626] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analyze Another Script</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#E50914] hover:bg-[#B20710] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Export Report
              </button>
            </div>
          </div>

          {/* DUAL SIDE-BY-SIDE PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* PANEL 1: DATA-DRIVEN SUCCESS PROBABILITY (MODEL A) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#141414] border border-red-600/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                        Quantitative Machine Learning Engine
                      </span>
                      <h3 className="text-xl font-extrabold text-white font-display">
                        Success Probability &amp; Risk (Model A)
                      </h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#050505] border border-red-600/30 text-[10px] font-mono text-red-400 font-bold">
                    PRE-RELEASE
                  </span>
                </div>

                {/* 4-Metric Grid: Probability, Confidence, Risk, Evidence */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* Metric 1: Success Probability */}
                  <div className="bg-[#050505] p-3.5 rounded-2xl border border-red-600/30 flex flex-col justify-between">
                    <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase">Success Prob</p>
                    <p className="text-2xl sm:text-3xl font-black text-red-500 font-display mt-1">
                      {(reportResult.quantitativePrediction.successProbability * 100).toFixed(0)}%
                    </p>
                    <p className="text-[9px] text-neutral-400 font-mono mt-0.5">Calibrated</p>
                  </div>

                  {/* Metric 2: Model Confidence */}
                  <div className="bg-[#050505] p-3.5 rounded-2xl border border-[#262626] flex flex-col justify-between">
                    <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase">Confidence</p>
                    <p className={`text-xl font-extrabold font-display mt-1 ${
                      reportResult.extraction.modelConfidence === 'High' ? 'text-green-400' :
                      reportResult.extraction.modelConfidence === 'Medium' ? 'text-amber-400' : 'text-neutral-300'
                    }`}>
                      {reportResult.extraction.modelConfidence || 'Medium'}
                    </p>
                    <p className="text-[9px] text-neutral-500 font-mono mt-0.5">Sample Size</p>
                  </div>

                  {/* Metric 3: Risk Classification */}
                  <div className="bg-[#050505] p-3.5 rounded-2xl border border-[#262626] flex flex-col justify-between">
                    <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase">Risk Level</p>
                    <p className={`text-xl font-extrabold font-display mt-1 ${
                      reportResult.quantitativePrediction.riskLevel === 'Low' ? 'text-green-400' :
                      reportResult.quantitativePrediction.riskLevel === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {reportResult.quantitativePrediction.riskLevel.toUpperCase()}
                    </p>
                    <p className="text-[9px] text-neutral-500 font-mono mt-0.5">Commercial</p>
                  </div>

                  {/* Metric 4: Evidence Strength */}
                  <div className="bg-[#050505] p-3.5 rounded-2xl border border-[#262626] flex flex-col justify-between">
                    <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase">Evidence</p>
                    <p className="text-xl font-extrabold text-blue-400 font-display mt-1">
                      {reportResult.extraction.evidenceStrength || 'Moderate'}
                    </p>
                    <p className="text-[9px] text-neutral-500 font-mono mt-0.5">{reportResult.extraction.sceneCount} scenes</p>
                  </div>

                </div>

                {/* Small Sample Warning Alert */}
                {reportResult.extraction.smallSampleWarning && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-300">Limited Screenplay Evidence Notice</p>
                      <p className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
                        This evaluation is derived from an excerpt or treatment sample (~{reportResult.extraction.pageCount} pages). Model confidence is reduced accordingly while the probability score reflects intrinsic structural and genre signals.
                      </p>
                    </div>
                  </div>
                )}

                {/* Model Explanation Disclaimer */}
                <div className="p-3 bg-[#050505] rounded-xl border border-[#262626] text-[11px] text-neutral-400 font-sans leading-relaxed">
                  <p>
                    <strong className="text-neutral-300">Success Target Definition:</strong> Global Theatrical Breakeven (&ge;2.0x Production Budget) &amp; Audience Quality Threshold (TMDB Rating &ge; 6.5 with &ge; 100 verified ratings).
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">
                    * This is a statistical model estimate based on available structural screenplay and historical box-office signals, not an absolute guarantee.
                  </p>
                </div>

                {/* POSITIVE SIGNALS */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Positive Contributing Signals (+)</span>
                  </p>
                  <div className="space-y-1.5">
                    {(reportResult.extraction.positiveSignals || []).map((sig, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#050505] border border-green-950/60 text-xs text-neutral-200 flex items-start gap-2">
                        <span className="text-green-400 font-bold font-mono">+</span>
                        <p className="text-[11px]">{sig}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NEGATIVE / LIMITING SIGNALS */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Limiting Signals &amp; Missing Evidence (-)</span>
                  </p>
                  <div className="space-y-1.5">
                    {(reportResult.extraction.negativeSignals || []).map((sig, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#050505] border border-red-950/60 text-xs text-neutral-300 flex items-start gap-2">
                        <span className="text-red-400 font-bold font-mono">-</span>
                        <p className="text-[11px]">{sig}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXPANDABLE SCORE CALCULATION BREAKDOWN */}
                <div className="pt-2 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setShowCalculationBreakdown(!showCalculationBreakdown)}
                    className="w-full py-2.5 px-4 bg-[#050505] hover:bg-[#181818] border border-[#262626] rounded-xl text-xs font-bold text-neutral-300 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-red-500" />
                      <span>How This Score Was Calculated (8 Feature Groups)</span>
                    </span>
                    {showCalculationBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showCalculationBreakdown && (
                    <div className="mt-3 overflow-x-auto rounded-2xl border border-[#262626] bg-[#050505]">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-[#262626] text-neutral-400 font-mono text-[10px] uppercase">
                            <th className="py-2.5 px-3">Feature Group</th>
                            <th className="py-2.5 px-2">Status</th>
                            <th className="py-2.5 px-2 text-center">Score</th>
                            <th className="py-2.5 px-2 text-center">Weight</th>
                            <th className="py-2.5 px-3">Explanation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e1e]">
                          {(reportResult.extraction.scoreBreakdown || []).map((fg, idx) => (
                            <tr key={idx} className="hover:bg-[#141414]/60 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-white text-[11px]">{fg.category}</td>
                              <td className="py-2.5 px-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                  fg.status === 'Available' ? 'bg-green-950 text-green-300 border border-green-800' :
                                  fg.status === 'Estimated' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-neutral-900 text-neutral-400 border border-neutral-700'
                                }`}>
                                  {fg.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono font-bold text-white text-[11px]">
                                {fg.status === 'Not available' ? '—' : `${fg.score}/100`}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono text-neutral-400 text-[10px]">{fg.weight}</td>
                              <td className="py-2.5 px-3 text-[11px] text-neutral-300">{fg.explanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Model A Provenance Note */}
                <div className="p-3 rounded-xl bg-[#050505] border border-[#262626] text-[10px] text-neutral-500 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>
                    Historical Dataset Connected (4,800 TMDB Verified Films). Zero post-release leakage.
                  </span>
                </div>

              </div>
            </div>

            {/* PANEL 2: AI SCRIPT FEEDBACK (QUALITATIVE, GEMINI-GENERATED) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#141414] border border-red-600/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-500 flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                        Qualitative Narrative Intelligence
                      </span>
                      <h3 className="text-xl font-extrabold text-white font-display">
                        AI Script Feedback — Gemini Analysis
                      </h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#050505] border border-red-600/30 text-[10px] font-mono text-red-400 font-bold">
                    QUALITATIVE
                  </span>
                </div>

                {/* Qualitative Framing Alert Box */}
                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Qualitative Narrative Analysis:</strong> Uncoupled from Model A. Narrative analysis does not alter the historical mathematical probability score.
                  </p>
                </div>

                {/* Screenplay Deep Extraction Grid */}
                <div className="bg-[#050505] p-4 rounded-2xl border border-[#262626] space-y-3">
                  <p className="text-xs font-bold text-white font-display flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-red-500" />
                    <span>Extracted Screenplay Dimensions</span>
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                    <div className="bg-[#141414] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase">Protagonist</p>
                      <p className="font-bold text-white mt-0.5 truncate">{reportResult.extraction.protagonist || 'Lead'}</p>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase">Opposing Force</p>
                      <p className="font-bold text-neutral-300 mt-0.5 truncate">{reportResult.extraction.antagonist || 'Conflict Force'}</p>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase">Conflict Density</p>
                      <p className="font-bold text-red-400 mt-0.5">{reportResult.extraction.conflictDensity || 'Moderate'}</p>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase">Pacing</p>
                      <p className="font-bold text-white mt-0.5 truncate">{reportResult.extraction.pacing || 'Moderate'}</p>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase">Franchise Potential</p>
                      <p className="font-bold text-blue-400 mt-0.5 truncate">{reportResult.extraction.franchisePotential || 'Standalone'}</p>
                    </div>
                    <div className="bg-[#141414] p-2.5 rounded-xl border border-[#262626]">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase">Complexity</p>
                      <p className="font-bold text-neutral-300 mt-0.5 truncate">{reportResult.extraction.productionComplexity || 'Standard'}</p>
                    </div>
                  </div>

                  {reportResult.extraction.themes && reportResult.extraction.themes.length > 0 && (
                    <div className="pt-2 border-t border-[#1e1e1e] flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-neutral-500 text-[10px]">THEMES:</span>
                      <span className="text-neutral-300 font-medium">{reportResult.extraction.themes.join(' • ')}</span>
                    </div>
                  )}
                </div>

                {/* Pacing & Dialogue/Action Ratio Section */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white font-display flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-500" />
                      <span>Pacing Balance &amp; Dialogue Ratio</span>
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 bg-[#141414] px-2.5 py-0.5 rounded-lg border border-[#262626]">
                      {reportResult.qualitativeFeedback.pacingAnalysis.pacingVerdict}
                    </span>
                  </div>

                  {/* Visual Ratio Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>Dialogue: {reportResult.extraction.dialoguePercentage}%</span>
                      <span>Action / Scene Beats: {reportResult.extraction.actionPercentage}%</span>
                    </div>
                    <div className="w-full bg-[#141414] h-2.5 rounded-full overflow-hidden flex border border-[#262626]">
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${reportResult.extraction.dialoguePercentage}%` }}
                      />
                      <div
                        className="bg-neutral-600 h-full"
                        style={{ width: `${reportResult.extraction.actionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {reportResult.qualitativeFeedback.pacingAnalysis.dialogueVsActionNote}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono italic">
                    {reportResult.qualitativeFeedback.pacingAnalysis.genreComparison}
                  </p>
                </div>

                {/* Three-Act Structure Notes */}
                <div className="bg-[#050505] p-5 rounded-2xl border border-[#262626] space-y-3">
                  <p className="text-xs font-bold text-white font-display flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-red-500" />
                    <span>Three-Act Structural Dynamics</span>
                  </p>

                  <div className="space-y-2.5 text-xs text-neutral-300">
                    <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
                      <p className="text-[10px] font-mono font-bold text-red-400 uppercase">Act I (Setup &amp; Inciting Incident)</p>
                      <p>{reportResult.qualitativeFeedback.threeActStructure.act1Notes}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
                      <p className="text-[10px] font-mono font-bold text-amber-400 uppercase">Act II (Confrontation &amp; Midpoint Reversal)</p>
                      <p>{reportResult.qualitativeFeedback.threeActStructure.act2Notes}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
                      <p className="text-[10px] font-mono font-bold text-green-400 uppercase">Act III (Climax &amp; Resolution)</p>
                      <p>{reportResult.qualitativeFeedback.threeActStructure.act3Notes}</p>
                    </div>
                  </div>
                </div>

                {/* Concrete Improvement Suggestions (Script Doctor Directives) */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-white font-display flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-red-500" />
                    <span>Concrete Revision Directives (Gemini Script Doctor)</span>
                  </p>
                  
                  <div className="space-y-2">
                    {reportResult.qualitativeFeedback.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#050505] border border-[#262626] flex items-start gap-2.5">
                        <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-neutral-300 leading-relaxed">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
