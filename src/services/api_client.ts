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
  DataProvenanceStats
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
  getDataProvenanceStats
} from './ml_engine';
import { routeChatMessage } from './chatbot_router';
import { extractScriptMetrics, generateScriptQualitativeFeedback } from './script_intelligence';

// In-memory demo user storage for static Netlify deployments
const CLIENT_USERS: Map<string, UserProfile & { passwordHash: string }> = new Map([
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
]);

// Helper to check if a response is JSON
async function safeJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (res.ok && contentType.includes('application/json')) {
    return await res.json();
  }
  throw new Error(`Non-JSON response (status: ${res.status})`);
}

/**
 * Universal Login with seamless client-side fallback for Netlify
 */
export async function apiLogin(username: string, password: string, role?: UserRole): Promise<{ user: UserProfile }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await safeJson(res);
    if (data.user) return data;
  } catch {
    // Client-side fallback for Netlify static deployments
  }

  const cleanUser = username.trim().toLowerCase();
  const existing = CLIENT_USERS.get(cleanUser);

  if (existing) {
    if (existing.passwordHash === password || password === 'demo123') {
      const { passwordHash, ...userProfile } = existing;
      return { user: userProfile };
    }
    throw new Error('Invalid password for demo user. Use "demo123" or sign up with a new username.');
  }

  // Auto-register new user for smooth demo
  const newUser: UserProfile & { passwordHash: string } = {
    id: 'u_' + Date.now(),
    username: cleanUser,
    role: role || 'producer',
    likedMovieIds: [],
    createdAt: new Date().toISOString(),
    passwordHash: password
  };
  CLIENT_USERS.set(cleanUser, newUser);

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
  try {
    const [moviesRes, modelsRes, conceptRes] = await Promise.all([
      fetch('/api/movies'),
      fetch('/api/models/evaluate?algorithm=random_forest'),
      fetch('/api/concepts/active')
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
    // Fall back to client-side ML engine
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
  try {
    const res = await fetch(`/api/models/evaluate?algorithm=${algo}`);
    const data = await safeJson(res);
    if (data.modelA && data.modelB) return data;
  } catch {
    // Fallback
  }
  return evaluateModels(algo);
}

/**
 * Predict My Project Simulation
 */
export async function apiSimulate(input: ProjectSimulationInput): Promise<PredictionResult> {
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    const data = await safeJson(res);
    if (data.successProbability !== undefined) return data;
  } catch {
    // Fallback
  }
  return simulateProjectPrediction(input);
}

/**
 * Concept Battle Create
 */
export async function apiCreateConceptBattle(conceptA: any, conceptB: any): Promise<ConceptBattle> {
  try {
    const res = await fetch('/api/concepts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conceptA, conceptB })
    });
    const data = await safeJson(res);
    if (data.conceptA) return data;
  } catch {
    // Fallback
  }
  return createConceptBattle(conceptA, conceptB);
}

/**
 * Concept Battle Vote
 */
export async function apiVoteConcept(choice: 'A' | 'B'): Promise<ConceptBattle> {
  try {
    const res = await fetch('/api/concepts/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice })
    });
    const data = await safeJson(res);
    if (data.conceptA) return data;
  } catch {
    // Fallback
  }
  return voteConceptBattle(choice);
}

/**
 * Like / Dislike Toggle
 */
export async function apiToggleLike(username: string, movieId: number): Promise<void> {
  try {
    await fetch('/api/likes/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, movieId })
    });
  } catch {
    // In client mode, App.tsx optimistic update persists state
  }
}

/**
 * Personalized Feed
 */
export async function apiGetPersonalizedFeed(likedIds: number[]): Promise<any[]> {
  try {
    const res = await fetch('/api/personalized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likedMovieIds: likedIds })
    });
    const data = await safeJson(res);
    if (data.feed) return data.feed;
  } catch {
    // Fallback
  }
  return getPersonalizedFeed(likedIds);
}

/**
 * Top 10 Similar Movies
 */
export async function apiGetTopSimilar(referenceId: number): Promise<any[]> {
  try {
    const res = await fetch(`/api/recommend/${referenceId}`);
    const data = await safeJson(res);
    if (data.recommendations) return data.recommendations;
  } catch {
    // Fallback
  }
  return getTop10Similar(referenceId);
}

/**
 * Hidden Gems
 */
export async function apiGetHiddenGems(genre?: string): Promise<Movie[]> {
  try {
    const query = genre && genre !== 'All' ? `?genre=${encodeURIComponent(genre)}` : '';
    const res = await fetch(`/api/hidden-gems${query}`);
    const data = await safeJson(res);
    if (data.gems) return data.gems;
  } catch {
    // Fallback
  }
  return getHiddenGems(genre);
}

/**
 * Trending Genres
 */
export async function apiGetTrending(): Promise<any[]> {
  try {
    const res = await fetch('/api/trending');
    const data = await safeJson(res);
    if (data.trends) return data.trends;
  } catch {
    // Fallback
  }
  return getTrendingByGenre();
}

/**
 * Grounded CineBot Chat
 */
export async function apiSendMessage(message: string): Promise<ChatMessage> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await safeJson(res);
    if (data.response) return data.response;
  } catch {
    // Fallback
  }
  return routeChatMessage(message);
}

/**
 * Script Intelligence: Extraction
 */
export async function apiExtractScript(text: string, fileName?: string): Promise<ScriptExtractionMetrics> {
  try {
    const res = await fetch('/api/script/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fileName })
    });
    const data = await safeJson(res);
    if (data.extraction) return data.extraction;
  } catch {
    // Fallback
  }
  return extractScriptMetrics(text, fileName);
}

/**
 * Script Intelligence: Qualitative Feedback
 */
export async function apiAnalyzeScript(metrics: ScriptExtractionMetrics, text: string): Promise<ScriptQualitativeFeedback> {
  try {
    const res = await fetch('/api/script/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, text })
    });
    const data = await safeJson(res);
    if (data.qualitativeFeedback) return data.qualitativeFeedback;
  } catch {
    // Fallback
  }
  return generateScriptQualitativeFeedback(metrics, text, null);
}

/**
 * Opportunity Radar
 */
export async function apiGetOpportunityRadar(): Promise<AudienceOpportunity[]> {
  try {
    const res = await fetch('/api/opportunity-radar');
    const data = await safeJson(res);
    if (data.opportunities) return data.opportunities;
  } catch {
    // Fallback
  }
  return getAudienceOpportunityRadar();
}

/**
 * Regional Radar
 */
export async function apiGetRegionalRadar(): Promise<RegionalContentInsight[]> {
  try {
    const res = await fetch('/api/regional-radar');
    const data = await safeJson(res);
    if (data.regional) return data.regional;
  } catch {
    // Fallback
  }
  return getRegionalContentRadar();
}

/**
 * Content Gaps
 */
export async function apiGetContentGaps(): Promise<ContentGapItem[]> {
  try {
    const res = await fetch('/api/content-gaps');
    const data = await safeJson(res);
    if (data.gaps) return data.gaps;
  } catch {
    // Fallback
  }
  return getContentGapDetector();
}

/**
 * CineAccess Stats
 */
export async function apiGetCineAccess(): Promise<CineAccessMetrics> {
  try {
    const res = await fetch('/api/cineaccess');
    const data = await safeJson(res);
    if (data.cineAccessScore !== undefined) return data;
  } catch {
    // Fallback
  }
  return getCineAccessStats();
}

/**
 * Post-Release Diagnostic
 */
export async function apiGetPostRelease(movieId: number): Promise<PostReleaseDiagnostic | null> {
  try {
    const res = await fetch(`/api/post-release-diagnostic/${movieId}`);
    const data = await safeJson(res);
    if (data.title) return data;
  } catch {
    // Fallback
  }
  return getPostReleaseDiagnostic(movieId);
}

/**
 * Greenlight Scenarios
 */
export async function apiGetGreenlight(input: ProjectSimulationInput): Promise<GreenlightInvestmentScenario[]> {
  try {
    const res = await fetch('/api/greenlight-simulator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    const data = await safeJson(res);
    if (data.scenarios) return data.scenarios;
  } catch {
    // Fallback
  }
  return getGreenlightSimulator(input);
}

/**
 * Comparable Movies
 */
export async function apiGetComparables(input: ProjectSimulationInput): Promise<ComparableMovieItem[]> {
  try {
    const res = await fetch('/api/comparable-movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    const data = await safeJson(res);
    if (data.comparables) return data.comparables;
  } catch {
    // Fallback
  }
  return getComparableMovies(input, 5);
}

/**
 * Prediction Tracker Data
 */
export async function apiGetPredictionTracker(algo: ModelAlgorithm): Promise<PredictionTrackerData> {
  try {
    const res = await fetch(`/api/prediction-tracker?algorithm=${algo}`);
    const data = await safeJson(res);
    if (data.totalEvaluated !== undefined) return data;
  } catch {
    // Fallback
  }
  return getPredictionTrackerData(algo);
}

/**
 * Data Provenance Stats
 */
export async function apiGetDataProvenance(): Promise<DataProvenanceStats> {
  try {
    const res = await fetch('/api/provenance');
    const data = await safeJson(res);
    if (data.provenance) return data.provenance;
  } catch {
    // Fallback
  }
  return getDataProvenanceStats();
}

/**
 * Audience Intelligence Stats
 */
export async function apiGetAudienceStats(): Promise<AudienceIntelligenceStats> {
  try {
    const res = await fetch('/api/audience-intel');
    const data = await safeJson(res);
    if (data.audienceIntel) return data.audienceIntel;
  } catch {
    // Fallback
  }
  return getAudienceIntelligenceStats();
}
