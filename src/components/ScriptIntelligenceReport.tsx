import React, { useState } from 'react';
import {
  ProjectSimulationInput,
  PredictionResult,
  ScriptExtractionMetrics,
  ScriptQualitativeFeedback,
  ScriptIntelligenceResult
} from '../types';
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
  FileCheck
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

INT. DETECTIVE HUDSON'S SEDAN - CONTINUOUS
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
    title: "Parallel Hearts (Romantic Drama)",
    genre: "Drama / Romance",
    text: `PARALLEL HEARTS
Written by Sarah Jenkins

INT. ANTIQUE BOOKSHOP - DAY
Sunlight streams through dust motes. Shelves stacked with leather-bound poetry and forgotten letters.

CLAIRE (28, warm, cautious archivist) carefully examines an 1890s journal.

LEO (30, architect, observant smile) stands on the rolling ladder, peering down.

LEO
You've been staring at that same passage for twenty minutes.

CLAIRE
Because whoever wrote this was terrified of admitting what they felt. People were more patient a century ago.

LEO
(stepping down)
Or maybe they just didn't have cell phones to ruin the mystery.

Claire laughs, brushing a stray lock of hair behind her ear. A quiet, charged moment passes between them.

CLAIRE
Are you going to buy that blueprint or just critique my reading speed?`
  }
];

interface ScriptIntelligenceReportProps {
  onSimulate: (input: ProjectSimulationInput) => Promise<PredictionResult>;
}

export const ScriptIntelligenceReport: React.FC<ScriptIntelligenceReportProps> = ({ onSimulate }) => {
  const [scriptText, setScriptText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  // Pipeline states
  const [extracting, setExtracting] = useState(false);
  const [extractedMetrics, setExtractedMetrics] = useState<ScriptExtractionMetrics | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportResult, setReportResult] = useState<ScriptIntelligenceResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable confirmation values
  const [confirmedTitle, setConfirmedTitle] = useState('');
  const [confirmedRuntime, setConfirmedRuntime] = useState(120);
  const [confirmedBudget, setConfirmedBudget] = useState(65000000);
  const [confirmedCastPop, setConfirmedCastPop] = useState(72);
  const [confirmedGenres, setConfirmedGenres] = useState<string[]>(['Science Fiction', 'Action']);
  const [confirmedMonth, setConfirmedMonth] = useState(7);
  const [confirmedStudio, setConfirmedStudio] = useState('Warner Bros.');

  const availableGenres = ['Action', 'Adventure', 'Science Fiction', 'Fantasy', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Crime'];

  // Handle File Upload (PDF, DOCX, TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setScriptText(content);
      await runExtraction(content, file.name);
    };

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
      // Read as text or inform user about client extraction
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
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
      const res = await fetch('/api/script/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fileName })
      });

      const data = await res.json();
      if (data.extraction) {
        const ext: ScriptExtractionMetrics = data.extraction;
        setExtractedMetrics(ext);
        setConfirmedTitle(ext.title);
        setConfirmedRuntime(ext.estimatedRuntime);
        setConfirmedGenres(ext.detectedGenres.length > 0 ? ext.detectedGenres : ['Drama']);
      } else {
        throw new Error('Extraction response missing.');
      }
    } catch (err: any) {
      console.error('Script extraction failed:', err);
      setErrorMsg('Extraction encountered an error. You can still calibrate values manually below.');
      // Local fallback extraction
      const words = text.split(/\s+/).length;
      const pages = Math.max(1, Math.round(words / 240));
      const fallbackExt: ScriptExtractionMetrics = {
        title: fileName || 'Uploaded Script Project',
        pageCount: pages,
        estimatedRuntime: Math.min(220, Math.max(75, pages)),
        sceneCount: Math.max(5, Math.round(pages / 2.5)),
        dialoguePercentage: 45,
        actionPercentage: 55,
        characterCount: 4,
        detectedCharacters: ['Lead Character', 'Antagonist', 'Support'],
        detectedGenres: ['Drama', 'Thriller'],
        detectedKeywords: ['dialogue', 'story', 'scene'],
        wordCount: words
      };
      setExtractedMetrics(fallbackExt);
      setConfirmedTitle(fallbackExt.title);
      setConfirmedRuntime(fallbackExt.estimatedRuntime);
      setConfirmedGenres(fallbackExt.detectedGenres);
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
      const qualRes = await fetch('/api/script/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            ...extractedMetrics,
            title: confirmedTitle,
            estimatedRuntime: confirmedRuntime,
            detectedGenres: confirmedGenres
          },
          text: scriptText
        })
      });

      const qualData = await qualRes.json();
      const qualFeedback: ScriptQualitativeFeedback = qualData.qualitativeFeedback;

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
      setErrorMsg('Analysis failed. Please try again.');
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
    <div className="space-y-8 font-sans">

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
            <span>Honest Quantitative ML + Uncoupled AI Narrative Analysis</span>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed max-w-4xl">
          Upload a screenplay, treatment, or scene outline. CinePredict extracts key screenplay structural dimensions, evaluates the project through the <strong>Model A Pre-Release Machine Learning Pipeline</strong>, and generates distinct, uncoupled <strong>Gemini Qualitative Script Notes</strong> for pacing, three-act structure, and revision opportunities.
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
                      className="px-3 py-1.5 rounded-xl bg-[#050505] border border-[#262626] hover:border-red-600 text-xs text-neutral-300 font-medium transition-all flex items-center gap-1.5"
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
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
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
                  <span>2. Producer Calibration & Confirmation</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Confirm extracted script metrics before feeding to Model A.
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
                      <p className="text-[9px] text-neutral-500 uppercase">Characters</p>
                      <p className="font-bold text-white mt-0.5">{extractedMetrics.characterCount}</p>
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
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
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
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 mt-4 ${
                      analyzing
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#E50914] text-white hover:bg-[#B20710] shadow-xl shadow-red-600/40'
                    }`}
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running Model A Prediction & Gemini Narrative Analysis...</span>
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
                {reportResult.extraction.pageCount} Pages · ~{reportResult.extraction.estimatedRuntime} Mins · {reportResult.extraction.sceneCount} Scenes · {reportResult.extraction.detectedGenres.join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-[#050505] hover:bg-[#181818] text-neutral-300 border border-[#262626] rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analyze Another Script</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#E50914] hover:bg-[#B20710] text-white rounded-xl text-xs font-bold shadow-md transition-all"
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
                        Data-Driven Success Probability (Model A)
                      </h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#050505] border border-red-600/30 text-[10px] font-mono text-red-400 font-bold">
                    PRE-RELEASE
                  </span>
                </div>

                {/* Score & Risk Hero Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-2 ${
                    reportResult.quantitativePrediction.riskLevel === 'Low'
                      ? 'bg-green-950/30 border-green-800/40'
                      : reportResult.quantitativePrediction.riskLevel === 'Moderate'
                      ? 'bg-amber-950/30 border-amber-800/40'
                      : 'bg-red-950/30 border-red-800/40'
                  }`}>
                    <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                      reportResult.quantitativePrediction.riskLevel === 'Low' ? 'text-green-400' : reportResult.quantitativePrediction.riskLevel === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      Model A Predicted Probability
                    </p>
                    <p className="text-4xl font-extrabold text-white font-display">
                      {(reportResult.quantitativePrediction.successProbability * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-neutral-300 font-mono">
                      Calibrated Prob: {(reportResult.quantitativePrediction.calibratedProbability * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#050505] border border-[#262626] flex flex-col justify-between space-y-2">
                    <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                      Risk Classification
                    </p>
                    <p className={`text-2xl font-extrabold font-display ${
                      reportResult.quantitativePrediction.riskLevel === 'Low' ? 'text-green-400' : reportResult.quantitativePrediction.riskLevel === 'Moderate' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {reportResult.quantitativePrediction.riskLevel.toUpperCase()} RISK
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Decision Threshold: {(reportResult.quantitativePrediction.decisionThresholdUsed * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* SHAP Positive Contributors */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest">
                    Key Positive Structural Drivers
                  </p>
                  <div className="space-y-2">
                    {reportResult.quantitativePrediction.topDrivers
                      .filter(d => d.direction === 'positive')
                      .slice(0, 3)
                      .map((driver, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#050505] border border-[#262626] flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white">{driver.displayName}</p>
                            <p className="text-[11px] text-neutral-400">{driver.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* SHAP Limiting Signals */}
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                    Limiting Pre-Release Signals
                  </p>
                  <div className="space-y-2">
                    {reportResult.quantitativePrediction.topDrivers
                      .filter(d => d.direction === 'negative')
                      .slice(0, 3)
                      .map((driver, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#050505] border border-[#262626] flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white">{driver.displayName}</p>
                            <p className="text-[11px] text-neutral-400">{driver.description}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Model A Integrity Disclaimer Tag */}
                <div className="p-3 rounded-xl bg-[#050505] border border-[#262626] text-[10px] text-neutral-500 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>
                    Model A uses only verified pre-release metadata. Post-release popularity and review metrics are isolated to prevent leakage.
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
                    <strong>Qualitative Narrative Analysis:</strong> Generated via deep text evaluation. This analysis is uncoupled and never combined mathematically with Model A's historical probability score.
                  </p>
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
