import {
  UserProfile,
  UserRole,
  Movie,
  DatasetStats,
  ModelMetrics,
  ModelAlgorithm,
  ConceptBattle,
  ProjectSimulationInput,
  PredictionResult,
  ChatMessage,
  ScriptExtractionMetrics,
  ScriptQualitativeFeedback,
  AudienceOpportunity,
  RegionalContentInsight,
  ContentGapItem,
  CineAccessMetrics,
  PostReleaseDiagnostic,
  GreenlightInvestmentScenario,
  ComparableMovieItem,
  PredictionTrackerData,
  AudienceIntelligenceStats,
  DataProvenanceStats,
  AudienceConceptTest,
  AudienceValidationAnalytics,
  ProducerTrackedProject,
  LiveMarketDashboardData
} from '../types';

import { getCleanedDataset } from '../data/tmdb_dataset';
import {
  evaluateModels,
  simulateProjectPrediction,
  getTop10Similar,
  getHiddenGems,
  getTrendingByGenre,
  getPersonalizedFeed,
  getActiveConceptBattle,
  createConceptBattle,
  voteConceptBattle,
  getAudienceOpportunityRadar,
  getRegionalContentRadar,
  getContentGapDetector,
  getCineAccessStats,
  getPostReleaseDiagnostic,
  getGreenlightSimulator,
  getComparableMovies,
  getPredictionTrackerData,
  getAudienceIntelligenceStats,
  getDataProvenanceStats,
  getPredictionHistory,
  savePredictionToHistory,
  simulateScenarios
} from './ml_engine';
import { routeChatMessage } from './chatbot_router';
import { extractScriptMetrics, generateScriptQualitativeFeedback } from './script_intelligence';
import {
  getActiveAudienceTests,
  createAudienceConceptTest,
  submitAudienceVote,
  getAudienceValidationAnalytics,
  getProducerTrackedProjects,
  saveProducerProject,
  getLiveMarketDashboardData
} from './audience_live_engine';

// =========================================================================
// 1. DUAL-MODE API CONFIGURATION (LOCAL IN-BROWSER vs GLOBAL REMOTE API)
// =========================================================================

export type ApiMode = 'local' | 'global' | 'auto';

export interface ApiConfig {
  mode: ApiMode;
  resolvedMode: 'local' | 'global';
  baseUrl: string;
}

const STORAGE_KEYS = {
  MODE: 'cinepredict_api_mode',
  BASE_URL: 'cinepredict_api_base_url',
  USERS: 'cinepredict_users'
};

/**
 * Checks whether the current host environment is a static hosting platform (Netlify, Vercel, etc.)
 */
function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.endsWith('.netlify.app') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.github.io') ||
    host.endsWith('.render.com') ||
    host.includes('pages.dev')
  );
}

/**
 * Get current configured API mode: 'local' | 'global' | 'auto'
 */
export function getApiMode(): ApiMode {
  if (typeof window === 'undefined') return 'local';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.MODE) as ApiMode | null;
    if (saved === 'local' || saved === 'global' || saved === 'auto') return saved;
  } catch {}
  
  // Environment override
  const envMode = (import.meta as any).env?.VITE_API_MODE;
  if (envMode === 'local' || envMode === 'global') return envMode;

  return 'auto';
}

/**
 * Resolves whether the application should call global network APIs or local client engine
 */
export function getResolvedApiMode(): 'local' | 'global' {
  const mode = getApiMode();
  if (mode === 'local') return 'local';
  if (mode === 'global') return 'global';

  // AUTO RESOLUTION:
  // If an explicit backend URL is provided via environment or settings, use global
  const customUrl = getApiBaseUrl();
  if (customUrl) return 'global';

  // If deployed to Netlify or Vercel static hosting, default to zero-latency local mode
  if (isStaticHost()) return 'local';

  // In local development, if running via Express on port 3000, use global; otherwise local
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'global';
  }

  // Standalone Vite dev or preview: use local engine for instant, crash-free execution
  return 'local';
}

/**
 * Get API Base URL (empty string means same-origin relative URLs)
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.BASE_URL);
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, '');
  } catch {}

  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return '';
}

/**
 * Save new API mode & optional custom URL
 */
export function setApiConfig(mode: ApiMode, customUrl?: string): ApiConfig {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEYS.MODE, mode);
      if (customUrl !== undefined) {
        window.localStorage.setItem(STORAGE_KEYS.BASE_URL, customUrl.trim());
      }
      window.dispatchEvent(new CustomEvent('cinepredict_api_config_change', {
        detail: { mode, baseUrl: getApiBaseUrl(), resolvedMode: getResolvedApiMode() }
      }));
    } catch {}
  }
  return getApiConfig();
}

/**
 * Get full active API configuration
 */
export function getApiConfig(): ApiConfig {
  return {
    mode: getApiMode(),
    resolvedMode: getResolvedApiMode(),
    baseUrl: getApiBaseUrl()
  };
}

/**
 * Test connectivity and measure latency to the target backend API
 */
export function testApiConnection(targetUrl?: string): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const url = (targetUrl !== undefined ? targetUrl.trim().replace(/\/+$/, '') : getApiBaseUrl()) + '/api/movies';
  const start = performance.now();

  return fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
    .then(async (res) => {
      const latencyMs = Math.round(performance.now() - start);
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        return { ok: true, message: `Connected successfully (${latencyMs}ms)`, latencyMs };
      }
      return { ok: false, message: `Server returned status ${res.status} (${ct})`, latencyMs };
    })
    .catch((err) => {
      const latencyMs = Math.round(performance.now() - start);
      return { ok: false, message: err.message || 'Connection failed or blocked by CORS', latencyMs };
    });
}

// =========================================================================
// 2. CLIENT-SIDE PERSISTED DEMO USERS (NETLIFY / VERCEL COMPATIBLE)
// =========================================================================

function loadPersistedUsers(): Map<string, UserProfile & { passwordHash: string }> {
  const defaultUsers: [string, UserProfile & { passwordHash: string }][] = [
    [
      'producer_demo',
      {
        id: 'u_prod_1',
        username: 'producer_demo',
        role: 'producer',
        likedMovieIds: [19995, 293660],
        createdAt: new Date().toISOString(),
        passwordHash: 'demo123'
      }
    ],
    [
      'viewer_demo',
      {
        id: 'u_view_1',
        username: 'viewer_demo',
        role: 'viewer',
        likedMovieIds: [157336, 27205, 19995],
        createdAt: new Date().toISOString(),
        passwordHash: 'demo123'
      }
    ]
  ];

  if (typeof window === 'undefined') return new Map(defaultUsers);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return new Map(parsed);
      }
    }
  } catch {}

  return new Map(defaultUsers);
}

function savePersistedUsers(users: Map<string, UserProfile & { passwordHash: string }>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(Array.from(users.entries())));
  } catch {}
}

const CLIENT_USERS = loadPersistedUsers();

// Helper to safely parse JSON or throw
async function safeJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (res.ok && contentType.includes('application/json')) {
    return await res.json();
  }
  throw new Error(`Non-JSON response (status: ${res.status})`);
}

function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

// =========================================================================
// 3. API CLIENT METHODS (DUAL-MODE WITH ZERO-LATENCY LOCAL FALLBACK)
// =========================================================================

/**
 * Universal Login: Supports Global server or persistent Local Client Storage
 */
export async function apiLogin(username: string, password: string, role?: UserRole): Promise<{ user: UserProfile }> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await safeJson(res);
      if (data.user) return data;
    } catch (err) {
      console.warn('[CinePredict] Global API login unavailable, using Local Engine:', err);
    }
  }

  // Local Persistent Execution
  const cleanUser = username.trim().toLowerCase();
  const existing = CLIENT_USERS.get(cleanUser);

  if (existing) {
    if (existing.passwordHash === password || password === 'demo123') {
      const { passwordHash, ...userProfile } = existing;
      return { user: userProfile };
    }
    throw new Error('Invalid password for demo user. Use "demo123" or sign up with a new username.');
  }

  // Auto-register new user for smooth demo experience
  const newUser: UserProfile & { passwordHash: string } = {
    id: 'u_' + Date.now(),
    username: cleanUser,
    role: role || 'producer',
    likedMovieIds: [],
    createdAt: new Date().toISOString(),
    passwordHash: password
  };
  CLIENT_USERS.set(cleanUser, newUser);
  savePersistedUsers(CLIENT_USERS);

  const { passwordHash, ...userProfile } = newUser;
  return { user: userProfile };
}

/**
 * Fetch Initial Dataset, Model Evaluation & Active Battle
 */
export async function apiFetchInitialData(): Promise<{
  movies: Movie[];
  stats: DatasetStats;
  modelA: ModelMetrics;
  modelB: ModelMetrics;
  conceptBattle: ConceptBattle;
}> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const [moviesRes, modelsRes, conceptRes] = await Promise.all([
        fetch(buildApiUrl('/api/movies')),
        fetch(buildApiUrl('/api/models/evaluate?algorithm=random_forest')),
        fetch(buildApiUrl('/api/concepts/active'))
      ]);

      const moviesData = await safeJson(moviesRes);
      const modelsData = await safeJson(modelsRes);
      const conceptData = await safeJson(conceptRes);

      if (moviesData.movies && modelsData.modelA && modelsData.modelB) {
        return {
          movies: moviesData.movies,
          stats: moviesData.stats,
          modelA: modelsData.modelA,
          modelB: modelsData.modelB,
          conceptBattle: conceptData
        };
      }
    } catch {
      // Fallback to local engine below
    }
  }

  const dataset = getCleanedDataset();
  const models = evaluateModels('random_forest');
  const conceptBattle = getActiveConceptBattle();

  return {
    movies: dataset.movies,
    stats: dataset.stats,
    modelA: models.modelA,
    modelB: models.modelB,
    conceptBattle
  };
}

/**
 * Algorithm Switch Evaluation
 */
export async function apiSelectAlgorithm(algo: ModelAlgorithm): Promise<{ modelA: ModelMetrics; modelB: ModelMetrics }> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl(`/api/models/evaluate?algorithm=${algo}`));
      const data = await safeJson(res);
      if (data.modelA && data.modelB) return data;
    } catch {}
  }

  return evaluateModels(algo);
}

/**
 * Predict My Project Simulation
 */
export async function apiSimulate(input: ProjectSimulationInput): Promise<PredictionResult> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/predict'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = await safeJson(res);
      if (data.successProbability !== undefined) return data;
    } catch {}
  }

  const result = simulateProjectPrediction(input);
  savePredictionToHistory(input, result);
  return result;
}

/**
 * Concept Battle Create
 */
export async function apiCreateConceptBattle(conceptA: any, conceptB: any): Promise<ConceptBattle> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/concepts/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptA, conceptB })
      });
      const data = await safeJson(res);
      if (data.conceptA) return data;
    } catch {}
  }

  return createConceptBattle(conceptA, conceptB);
}

/**
 * Concept Battle Vote
 */
export async function apiVoteConcept(choice: 'A' | 'B'): Promise<ConceptBattle> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/concepts/vote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice })
      });
      const data = await safeJson(res);
      if (data.conceptA) return data;
    } catch {}
  }

  return voteConceptBattle(choice);
}

/**
 * Like / Dislike Toggle with Local Storage Persistence
 */
export async function apiToggleLike(username: string, movieId: number): Promise<void> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      await fetch(buildApiUrl('/api/likes/toggle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, movieId })
      });
    } catch {}
  }

  // Update client-side user store
  const cleanUser = username.trim().toLowerCase();
  const user = CLIENT_USERS.get(cleanUser);
  if (user) {
    const numId = typeof movieId === 'number' ? movieId : parseInt(movieId, 10);
    const idx = user.likedMovieIds.indexOf(numId);
    if (idx >= 0) {
      user.likedMovieIds.splice(idx, 1);
    } else {
      user.likedMovieIds.push(numId);
    }
    CLIENT_USERS.set(cleanUser, user);
    savePersistedUsers(CLIENT_USERS);
  }
}

/**
 * Personalized Feed
 */
export async function apiGetPersonalizedFeed(likedIds: number[]): Promise<any[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/personalized'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedMovieIds: likedIds })
      });
      const data = await safeJson(res);
      if (data.feed) return data.feed;
    } catch {}
  }

  return getPersonalizedFeed(likedIds);
}

/**
 * Top 10 Similar Movies
 */
export async function apiGetTopSimilar(referenceId: number): Promise<any[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl(`/api/recommend/${referenceId}`));
      const data = await safeJson(res);
      if (data.recommendations) return data.recommendations;
    } catch {}
  }

  return getTop10Similar(referenceId);
}

/**
 * Hidden Gems
 */
export async function apiGetHiddenGems(genre?: string): Promise<Movie[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const query = genre && genre !== 'All' ? `?genre=${encodeURIComponent(genre)}` : '';
      const res = await fetch(buildApiUrl(`/api/hidden-gems${query}`));
      const data = await safeJson(res);
      if (data.gems) return data.gems;
    } catch {}
  }

  return getHiddenGems(genre);
}

/**
 * Trending Genres
 */
export async function apiGetTrending(): Promise<any[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/trending'));
      const data = await safeJson(res);
      if (data.trends) return data.trends;
    } catch {}
  }

  return getTrendingByGenre();
}

/**
 * Grounded CineBot Chat
 */
export async function apiSendMessage(message: string): Promise<ChatMessage> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await safeJson(res);
      if (data.response) return data.response;
    } catch {}
  }

  return routeChatMessage(message);
}

/**
 * Script Intelligence: Extraction
 */
export async function apiExtractScript(text: string, fileName?: string): Promise<ScriptExtractionMetrics> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/script/extract'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fileName })
      });
      const data = await safeJson(res);
      if (data.extraction) return data.extraction;
    } catch {}
  }

  return extractScriptMetrics(text, fileName);
}

/**
 * Script Intelligence: Qualitative Feedback
 */
export async function apiAnalyzeScript(metrics: ScriptExtractionMetrics, text: string): Promise<ScriptQualitativeFeedback> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/script/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, text })
      });
      const data = await safeJson(res);
      if (data.qualitativeFeedback) return data.qualitativeFeedback;
    } catch {}
  }

  return generateScriptQualitativeFeedback(metrics, text, null);
}

/**
 * Opportunity Radar
 */
export async function apiGetOpportunityRadar(): Promise<AudienceOpportunity[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/opportunity-radar'));
      const data = await safeJson(res);
      if (data.opportunities) return data.opportunities;
    } catch {}
  }

  return getAudienceOpportunityRadar();
}

/**
 * Regional Radar
 */
export async function apiGetRegionalRadar(): Promise<RegionalContentInsight[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/regional-radar'));
      const data = await safeJson(res);
      if (data.regional) return data.regional;
    } catch {}
  }

  return getRegionalContentRadar();
}

/**
 * Content Gaps
 */
export async function apiGetContentGaps(): Promise<ContentGapItem[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/content-gaps'));
      const data = await safeJson(res);
      if (data.gaps) return data.gaps;
    } catch {}
  }

  return getContentGapDetector();
}

/**
 * CineAccess Stats
 */
export async function apiGetCineAccess(): Promise<CineAccessMetrics> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/cineaccess'));
      const data = await safeJson(res);
      if (data.cineAccessScore !== undefined) return data;
    } catch {}
  }

  return getCineAccessStats();
}

/**
 * Post-Release Diagnostic
 */
export async function apiGetPostRelease(movieId: number): Promise<PostReleaseDiagnostic | null> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl(`/api/post-release-diagnostic/${movieId}`));
      const data = await safeJson(res);
      if (data.title) return data;
    } catch {}
  }

  return getPostReleaseDiagnostic(movieId);
}

/**
 * Greenlight Scenarios
 */
export async function apiGetGreenlight(input: ProjectSimulationInput): Promise<GreenlightInvestmentScenario[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/greenlight-simulator'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = await safeJson(res);
      if (data.scenarios) return data.scenarios;
    } catch {}
  }

  return getGreenlightSimulator(input);
}

/**
 * Comparable Movies
 */
export async function apiGetComparables(input: ProjectSimulationInput): Promise<ComparableMovieItem[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/comparable-movies'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const data = await safeJson(res);
      if (data.comparables) return data.comparables;
    } catch {}
  }

  return getComparableMovies(input, 5);
}

/**
 * Prediction Tracker Data
 */
export async function apiGetPredictionTracker(algo: ModelAlgorithm): Promise<PredictionTrackerData> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl(`/api/prediction-tracker?algorithm=${algo}`));
      const data = await safeJson(res);
      if (data.totalEvaluated !== undefined) return data;
    } catch {}
  }

  return getPredictionTrackerData(algo);
}

/**
 * Data Provenance Stats (supports /api/data-provenance and /api/provenance)
 */
export async function apiGetDataProvenance(): Promise<DataProvenanceStats> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/data-provenance'));
      const data = await safeJson(res);
      if (data.provenance || data.totalRows !== undefined) return data.provenance || data;
    } catch {}
  }

  return getDataProvenanceStats();
}

/**
 * Audience Intelligence Stats (supports /api/audience/intelligence and /api/audience-intel)
 */
export async function apiGetAudienceStats(): Promise<AudienceIntelligenceStats> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/audience/intelligence'));
      const data = await safeJson(res);
      if (data.audienceIntel || data.totalAudienceVotesRecorded !== undefined) return data.audienceIntel || data;
    } catch {}
  }

  return getAudienceIntelligenceStats();
}

/**
 * Prediction History
 */
export async function apiGetPredictionHistory(): Promise<any[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/predictions/history'));
      const data = await safeJson(res);
      if (data.history) return data.history;
    } catch {}
  }

  return getPredictionHistory();
}

/**
 * Simulate What-If Scenarios
 */
export async function apiSimulateScenarios(baselineInput: any, scenarios: any[]): Promise<any[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/scenarios/simulate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baselineInput, scenarios })
      });
      const data = await safeJson(res);
      if (data.scenarioResults) return data.scenarioResults;
    } catch {}
  }

  return simulateScenarios(baselineInput, scenarios).scenarioResults;
}

/**
 * Fetch all active Audience Tests
 */
export async function apiGetAudienceTests(): Promise<AudienceConceptTest[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/audience/tests'));
      const data = await safeJson(res);
      if (data.tests) return data.tests;
    } catch {}
  }

  return getActiveAudienceTests();
}

/**
 * Create a new Audience Concept Test
 */
export async function apiCreateAudienceTest(
  testData: any,
  producerUsername: string = 'producer_demo'
): Promise<AudienceConceptTest> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/audience/tests/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testData, producerUsername })
      });
      const data = await safeJson(res);
      if (data.test) return data.test;
    } catch {}
  }

  return createAudienceConceptTest(testData, producerUsername);
}

/**
 * Submit a viewer vote in the Audience Lab
 */
export async function apiVoteAudienceTest(
  testId: string,
  response: any
): Promise<{ success: boolean; analytics: AudienceValidationAnalytics }> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/audience/tests/vote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, response })
      });
      const data = await safeJson(res);
      if (data.analytics) return data;
    } catch {}
  }

  return submitAudienceVote(testId, response);
}

/**
 * Get Audience Validation Analytics
 */
export async function apiGetAudienceAnalytics(testId: string): Promise<AudienceValidationAnalytics> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl(`/api/audience/analytics/${testId}`));
      const data = await safeJson(res);
      if (data.analytics) return data.analytics;
    } catch {}
  }

  return getAudienceValidationAnalytics(testId);
}

/**
 * Get Producer Tracked Projects
 */
export async function apiGetProducerProjects(): Promise<ProducerTrackedProject[]> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/producer/projects'));
      const data = await safeJson(res);
      if (data.projects) return data.projects;
    } catch {}
  }

  return getProducerTrackedProjects();
}

/**
 * Save Producer Tracked Project or Version
 */
export async function apiSaveProducerProject(project: Partial<ProducerTrackedProject>): Promise<ProducerTrackedProject> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/producer/projects/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      });
      const data = await safeJson(res);
      if (data.project) return data.project;
    } catch {}
  }

  return saveProducerProject(project);
}

/**
 * Get Live Cinema & Market Dashboard Data
 */
export async function apiGetLiveMarket(): Promise<LiveMarketDashboardData> {
  const mode = getResolvedApiMode();

  if (mode === 'global') {
    try {
      const res = await fetch(buildApiUrl('/api/live-cinema/market'));
      const data = await safeJson(res);
      if (data.market) return data.market;
    } catch {}
  }

  return getLiveMarketDashboardData();
}
