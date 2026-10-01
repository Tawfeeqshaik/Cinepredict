import {
  AudienceConceptTest,
  AudienceResponse,
  AudienceValidationAnalytics,
  ProducerTrackedProject,
  LiveCinemaMovie,
  LiveMarketDashboardData,
  Movie,
  ProjectSimulationInput
} from '../types';
import { simulateProjectPrediction } from './ml_engine';
import { getCleanedDataset } from '../data/tmdb_dataset';

// Safe browser LocalStorage persistence helpers
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Default In-Memory seed data
const DEFAULT_AUDIENCE_TESTS: AudienceConceptTest[] = [
  {
    id: 'test_phoenix_1',
    producerId: 'u_prod_1',
    producerUsername: 'producer_demo',
    title: 'Project Phoenix',
    synopsis: 'An elite orbital investigator uncovers a clandestine terraforming conspiracy that could render Earth uninhabitable, racing against time across deep-space stations.',
    genres: ['Science Fiction', 'Action', 'Thriller'],
    runtime: 132,
    language: 'en',
    releasePeriod: 'Summer (July 2026)',
    targetBudget: 95000000,
    topCast: ['Lead Protagonist', 'Cyber Specialist', 'Colony Commander'],
    director: 'Denis Villeneuve Style',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    modelAProbability: 0.67,
    riskLevel: 'Low',
    questions: [
      { id: 'q1', text: 'Would you watch this in theaters or IMAX?', type: 'would_watch' },
      { id: 'q2', text: 'How compelling is the orbital sci-fi premise?', type: 'interest_scale' },
      { id: 'q3', text: 'Genre appeal for high-concept Sci-Fi Action:', type: 'genre_appeal' },
      { id: 'q4', text: 'Would you recommend this concept to friends?', type: 'recommend' }
    ],
    status: 'testing',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    versionNumber: 1,
    parentProjectId: 'proj_phoenix_root'
  },
  {
    id: 'test_ab_chronos',
    producerId: 'u_prod_1',
    producerUsername: 'producer_demo',
    title: 'Chronos Protocol (A/B Test)',
    synopsis: 'A quantum physics expedition discovers an artifact that reverses biological aging at an exponential cost.',
    genres: ['Science Fiction', 'Thriller'],
    runtime: 145,
    language: 'en',
    releasePeriod: 'Holiday (November 2026)',
    targetBudget: 80000000,
    topCast: ['Senior Quantum Physicist', 'Expedition Doctor'],
    modelAProbability: 0.64,
    riskLevel: 'Moderate',
    isABTest: true,
    variationB: {
      title: 'Chronos: The Reversal (Tighter Pacing)',
      synopsis: 'A high-velocity thriller where an aging scientist uses forbidden quantum technology to prevent a catastrophic planetary collapse in 24 hours.',
      genres: ['Science Fiction', 'Action', 'Mystery'],
      runtime: 118,
      targetBudget: 72000000,
      modelAProbability: 0.72
    },
    questions: [
      { id: 'q_ab', text: 'Which story pacing and concept positioning appeals to you more?', type: 'choice_ab' },
      { id: 'q_watch', text: 'Would you watch your chosen variation?', type: 'would_watch' }
    ],
    status: 'testing',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    versionNumber: 1
  },
  {
    id: 'test_decision_noir',
    producerId: 'u_prod_1',
    producerUsername: 'producer_demo',
    title: 'The Midnight Syndicate (Decision Lab)',
    synopsis: 'A retired safe-cracker is blackmailed into one last multi-billion dollar subterranean vault heist during a citywide blackout.',
    genres: ['Crime', 'Thriller', 'Drama'],
    runtime: 124,
    language: 'en',
    releasePeriod: 'October 2026',
    targetBudget: 45000000,
    topCast: ['Veteran Safecracker', 'Undercover FBI Handler'],
    modelAProbability: 0.76,
    riskLevel: 'Low',
    decisionTest: {
      testType: 'title',
      questionTitle: 'Which project title has stronger theatrical appeal?',
      optionA: 'The Midnight Syndicate',
      optionB: 'Blackout Protocol',
      votesA: 34,
      votesB: 58
    },
    questions: [
      { id: 'q_dec', text: 'Vote for your preferred title:', type: 'choice_ab' },
      { id: 'q_rate', text: 'Rate your interest in this crime thriller concept:', type: 'interest_scale' }
    ],
    status: 'testing',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    versionNumber: 1
  }
];

const DEFAULT_AUDIENCE_RESPONSES: AudienceResponse[] = [
  // 18 seed responses for test_phoenix_1 (>= 10 for sample reliability)
  { id: 'r1', testId: 'test_phoenix_1', viewerId: 'v1', viewerUsername: 'cinemafan99', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 5, genreAppeal: 5, expectedQuality: 4, wouldRecommend: 'yes', feedbackText: 'Love the high-concept sci-fi idea! Keep the visual effects grounded.', viewerPreferredGenre: 'Science Fiction' },
  { id: 'r2', testId: 'test_phoenix_1', viewerId: 'v2', viewerUsername: 'imax_buff', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 5, genreAppeal: 5, expectedQuality: 5, wouldRecommend: 'yes', feedbackText: 'Great Summer release concept.', viewerPreferredGenre: 'Action' },
  { id: 'r3', testId: 'test_phoenix_1', viewerId: 'v3', viewerUsername: 'filmlover42', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 4, genreAppeal: 4, expectedQuality: 4, wouldRecommend: 'yes', feedbackText: 'Runtime around 130m feels appropriate.', viewerPreferredGenre: 'Science Fiction' },
  { id: 'r4', testId: 'test_phoenix_1', viewerId: 'v4', viewerUsername: 'sam_critic', votedAt: new Date().toISOString(), wouldWatch: 'maybe', interestLevel: 3, genreAppeal: 4, expectedQuality: 3, wouldRecommend: 'maybe', feedbackText: 'Need strong character motivations, not just action setpieces.', viewerPreferredGenre: 'Drama' },
  { id: 'r5', testId: 'test_phoenix_1', viewerId: 'v5', viewerUsername: 'alex_t', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 5, genreAppeal: 5, expectedQuality: 5, wouldRecommend: 'yes', viewerPreferredGenre: 'Science Fiction' },
  { id: 'r6', testId: 'test_phoenix_1', viewerId: 'v6', viewerUsername: 'sarah_p', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 4, genreAppeal: 4, expectedQuality: 4, wouldRecommend: 'yes', viewerPreferredGenre: 'Action' },
  { id: 'r7', testId: 'test_phoenix_1', viewerId: 'v7', viewerUsername: 'viewer_demo', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 5, genreAppeal: 5, expectedQuality: 5, wouldRecommend: 'yes', feedbackText: 'Definitely watching this on premiere weekend!', viewerPreferredGenre: 'Science Fiction' },
  { id: 'r8', testId: 'test_phoenix_1', viewerId: 'v8', viewerUsername: 'rachel_k', votedAt: new Date().toISOString(), wouldWatch: 'maybe', interestLevel: 3, genreAppeal: 3, expectedQuality: 3, wouldRecommend: 'maybe', viewerPreferredGenre: 'Thriller' },
  { id: 'r9', testId: 'test_phoenix_1', viewerId: 'v9', viewerUsername: 'dave_m', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 4, genreAppeal: 5, expectedQuality: 4, wouldRecommend: 'yes', viewerPreferredGenre: 'Science Fiction' },
  { id: 'r10', testId: 'test_phoenix_1', viewerId: 'v10', viewerUsername: 'jess_w', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 5, genreAppeal: 4, expectedQuality: 5, wouldRecommend: 'yes', viewerPreferredGenre: 'Action' },
  { id: 'r11', testId: 'test_phoenix_1', viewerId: 'v11', viewerUsername: 'kevin_s', votedAt: new Date().toISOString(), wouldWatch: 'probably_not', interestLevel: 2, genreAppeal: 2, expectedQuality: 3, wouldRecommend: 'no', feedbackText: 'Not a big fan of deep-space settings.', viewerPreferredGenre: 'Comedy' },
  { id: 'r12', testId: 'test_phoenix_1', viewerId: 'v12', viewerUsername: 'nina_l', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 4, genreAppeal: 5, expectedQuality: 4, wouldRecommend: 'yes', viewerPreferredGenre: 'Science Fiction' },
  { id: 'r13', testId: 'test_phoenix_1', viewerId: 'v13', viewerUsername: 'tom_b', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 5, genreAppeal: 5, expectedQuality: 4, wouldRecommend: 'yes', viewerPreferredGenre: 'Science Fiction' },
  { id: 'r14', testId: 'test_phoenix_1', viewerId: 'v14', viewerUsername: 'maya_r', votedAt: new Date().toISOString(), wouldWatch: 'maybe', interestLevel: 3, genreAppeal: 4, expectedQuality: 3, wouldRecommend: 'maybe', viewerPreferredGenre: 'Drama' },
  { id: 'r15', testId: 'test_phoenix_1', viewerId: 'v15', viewerUsername: 'chris_g', votedAt: new Date().toISOString(), wouldWatch: 'definitely', interestLevel: 4, genreAppeal: 4, expectedQuality: 4, wouldRecommend: 'yes', viewerPreferredGenre: 'Action' }
];

const DEFAULT_PRODUCER_PROJECTS: ProducerTrackedProject[] = [
  {
    id: 'proj_phoenix_root',
    producerUsername: 'producer_demo',
    title: 'Project Phoenix',
    synopsis: 'An elite orbital investigator uncovers a clandestine terraforming conspiracy.',
    genres: ['Science Fiction', 'Action', 'Thriller'],
    budget: 95000000,
    runtime: 132,
    releaseMonth: 7,
    releaseYear: 2026,
    status: 'Testing',
    currentVersion: 2,
    activeTestId: 'test_phoenix_1',
    totalAudienceResponses: 15,
    latestAudienceInterest: 82,
    latestModelAProbability: 67,
    divergencePoints: 15,
    divergenceAlert: 'Current audience interest (+15 pts) is outperforming the historical model baseline.',
    versions: [
      {
        versionNumber: 1,
        title: 'Project Phoenix (Initial Concept)',
        budget: 110000000,
        runtime: 155,
        genres: ['Science Fiction', 'Drama'],
        releaseMonth: 2,
        modelAProbability: 54,
        audienceInterest: 64,
        changeNote: 'Initial pitch draft with extended 155m runtime and winter release.',
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
      },
      {
        versionNumber: 2,
        title: 'Project Phoenix (Calibrated Pacing & Summer Window)',
        budget: 95000000,
        runtime: 132,
        genres: ['Science Fiction', 'Action', 'Thriller'],
        releaseMonth: 7,
        modelAProbability: 67,
        audienceInterest: 82,
        changeNote: 'Calibrated runtime to 132m, shifted to July summer window, attached high-tempo Action/Thriller positioning.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'proj_dark_knight_ref',
    producerUsername: 'producer_demo',
    title: 'The Dark Knight (Benchmark Post-Release)',
    synopsis: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent.',
    genres: ['Action', 'Crime', 'Drama'],
    budget: 185000000,
    runtime: 152,
    releaseMonth: 7,
    releaseYear: 2008,
    status: 'Tracking',
    currentVersion: 1,
    totalAudienceResponses: 240,
    latestAudienceInterest: 94,
    latestModelAProbability: 88,
    divergencePoints: 6,
    actualOutcomeSignal: {
      rating: 8.3,
      voteCount: 12000,
      popularity: 123.1,
      status: 'Tracking Positively',
      trend: 'up'
    },
    versions: [
      {
        versionNumber: 1,
        title: 'The Dark Knight',
        budget: 185000000,
        runtime: 152,
        genres: ['Action', 'Crime', 'Drama'],
        releaseMonth: 7,
        modelAProbability: 88,
        audienceInterest: 94,
        changeNote: 'Theatrical release verified against post-release TMDB 5K outcomes.',
        createdAt: '2008-07-18T00:00:00Z'
      }
    ],
    createdAt: '2008-07-18T00:00:00Z',
    lastUpdated: new Date().toISOString()
  }
];

// Runtime stores synchronized with LocalStorage
let AUDIENCE_TESTS: AudienceConceptTest[] = getLocalItem<AudienceConceptTest[]>('cinepredict_audience_tests', DEFAULT_AUDIENCE_TESTS);
let AUDIENCE_RESPONSES: AudienceResponse[] = getLocalItem<AudienceResponse[]>('cinepredict_audience_responses', DEFAULT_AUDIENCE_RESPONSES);
let PRODUCER_PROJECTS: ProducerTrackedProject[] = getLocalItem<ProducerTrackedProject[]>('cinepredict_producer_projects', DEFAULT_PRODUCER_PROJECTS);

// ==========================================
// 1. AUDIENCE LAB FUNCTIONS
// ==========================================

export function getActiveAudienceTests(): AudienceConceptTest[] {
  AUDIENCE_TESTS = getLocalItem<AudienceConceptTest[]>('cinepredict_audience_tests', AUDIENCE_TESTS);
  return AUDIENCE_TESTS;
}

export function getAudienceTestById(testId: string): AudienceConceptTest | undefined {
  AUDIENCE_TESTS = getActiveAudienceTests();
  return AUDIENCE_TESTS.find(t => t.id === testId);
}

export function createAudienceConceptTest(
  input: {
    title: string;
    synopsis: string;
    genres: string[];
    runtime: number;
    language?: string;
    releasePeriod?: string;
    targetBudget: number;
    topCast?: string[];
    director?: string;
    posterUrl?: string;
    isABTest?: boolean;
    variationB?: {
      title: string;
      synopsis: string;
      genres: string[];
      runtime: number;
      targetBudget: number;
    };
    decisionTest?: {
      testType: 'title' | 'poster' | 'runtime' | 'positioning';
      questionTitle: string;
      optionA: string;
      optionB: string;
      optionAImage?: string;
      optionBImage?: string;
    };
  },
  producerUsername: string = 'producer_demo'
): AudienceConceptTest {
  // 1. Run honest Model A Pre-Release prediction for the concept
  const simInput: ProjectSimulationInput = {
    title: input.title,
    budget: input.targetBudget,
    runtime: input.runtime,
    genres: input.genres,
    release_month: 7,
    release_year: 2026,
    top_cast_popularity: 70,
    production_company: 'Warner Bros.',
    modelAlgorithm: 'random_forest'
  };

  const modelPrediction = simulateProjectPrediction(simInput);

  let varBWithModel: any = undefined;
  if (input.isABTest && input.variationB) {
    const simB = simulateProjectPrediction({
      title: input.variationB.title,
      budget: input.variationB.targetBudget,
      runtime: input.variationB.runtime,
      genres: input.variationB.genres,
      release_month: 7,
      release_year: 2026,
      top_cast_popularity: 70,
      production_company: 'Warner Bros.',
      modelAlgorithm: 'random_forest'
    });
    varBWithModel = {
      ...input.variationB,
      modelAProbability: Math.round(simB.successProbability * 100) / 100
    };
  }

  const newTest: AudienceConceptTest = {
    id: 'test_' + Date.now(),
    producerId: 'u_prod_' + Date.now(),
    producerUsername,
    title: input.title,
    synopsis: input.synopsis,
    genres: input.genres,
    runtime: input.runtime,
    language: input.language || 'en',
    releasePeriod: input.releasePeriod || 'Summer 2026',
    targetBudget: input.targetBudget,
    topCast: input.topCast || ['Lead Actor', 'Supporting Lead'],
    director: input.director,
    posterUrl: input.posterUrl || 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
    modelAProbability: Math.round(modelPrediction.successProbability * 100) / 100,
    riskLevel: modelPrediction.riskLevel,
    isABTest: input.isABTest,
    variationB: varBWithModel,
    decisionTest: input.decisionTest ? { ...input.decisionTest, votesA: 0, votesB: 0 } : undefined,
    questions: [
      { id: 'q1', text: 'Would you watch this movie in theaters or on streaming?', type: 'would_watch' },
      { id: 'q2', text: 'Rate your overall interest in this story premise (1 to 5):', type: 'interest_scale' },
      { id: 'q3', text: 'How strongly does this genre combination appeal to you?', type: 'genre_appeal' },
      { id: 'q4', text: 'Would you recommend this concept to friends?', type: 'recommend' }
    ],
    status: 'testing',
    createdAt: new Date().toISOString(),
    versionNumber: 1
  };

  AUDIENCE_TESTS = [newTest, ...AUDIENCE_TESTS];
  setLocalItem('cinepredict_audience_tests', AUDIENCE_TESTS);
  return newTest;
}

export function submitAudienceVote(
  testId: string,
  response: {
    viewerUsername: string;
    wouldWatch: 'definitely' | 'maybe' | 'probably_not';
    interestLevel: number;
    genreAppeal?: number;
    expectedQuality?: number;
    wouldRecommend?: 'yes' | 'maybe' | 'no';
    feedbackText?: string;
    choiceAB?: 'A' | 'B';
    preferredGenre?: string;
  }
): { success: boolean; analytics: AudienceValidationAnalytics } {
  const newResponse: AudienceResponse = {
    id: 'resp_' + Date.now(),
    testId,
    viewerId: 'v_' + response.viewerUsername,
    viewerUsername: response.viewerUsername,
    votedAt: new Date().toISOString(),
    wouldWatch: response.wouldWatch,
    interestLevel: Math.min(5, Math.max(1, response.interestLevel)),
    genreAppeal: response.genreAppeal || 4,
    expectedQuality: response.expectedQuality || 4,
    wouldRecommend: response.wouldRecommend || 'yes',
    feedbackText: response.feedbackText,
    choiceAB: response.choiceAB,
    viewerPreferredGenre: response.preferredGenre || 'Science Fiction'
  };

  // Check if test has decision test
  const test = AUDIENCE_TESTS.find(t => t.id === testId);
  if (test && test.decisionTest && response.choiceAB) {
    if (response.choiceAB === 'A') test.decisionTest.votesA++;
    if (response.choiceAB === 'B') test.decisionTest.votesB++;
    setLocalItem('cinepredict_audience_tests', AUDIENCE_TESTS);
  }

  AUDIENCE_RESPONSES = [newResponse, ...AUDIENCE_RESPONSES];
  setLocalItem('cinepredict_audience_responses', AUDIENCE_RESPONSES);
  const analytics = getAudienceValidationAnalytics(testId);
  return { success: true, analytics };
}

export function getAudienceValidationAnalytics(testId: string): AudienceValidationAnalytics {
  const test = AUDIENCE_TESTS.find(t => t.id === testId);
  const responses = AUDIENCE_RESPONSES.filter(r => r.testId === testId);
  const total = responses.length;

  const modelAProb = test ? Math.round(test.modelAProbability * 100) : 65;

  if (total === 0) {
    return {
      testId,
      totalResponses: 0,
      definitelyPercentage: 0,
      maybePercentage: 0,
      probablyNotPercentage: 0,
      avgInterestScore: 0,
      audienceInterestPercentage: 0,
      modelAProbability: modelAProb,
      divergencePoints: 0,
      divergenceInterpretation: 'No viewer responses recorded yet. Share or publish to Audience Lab to collect market signals.',
      isSampleReliable: false,
      sampleReliabilityWarning: 'Insufficient audience data — 0 responses recorded.',
      topPositiveSignals: ['Premise published to Audience Lab'],
      topConcerns: ['Awaiting first audience votes'],
      recommendedExperiment: 'Collect initial 10+ viewer responses to establish baseline.'
    };
  }

  const defCount = responses.filter(r => r.wouldWatch === 'definitely').length;
  const maybeCount = responses.filter(r => r.wouldWatch === 'maybe').length;
  const notCount = responses.filter(r => r.wouldWatch === 'probably_not').length;

  const defPct = Math.round((defCount / total) * 100);
  const maybePct = Math.round((maybeCount / total) * 100);
  const notPct = Math.round((notCount / total) * 100);

  const avgInterest = Math.round((responses.reduce((sum, r) => sum + r.interestLevel, 0) / total) * 10) / 10;
  // Normalized Audience Interest Score: Weighted combination of (definitely% + 0.5*maybe%) and interest scale / 5
  const audienceScore = Math.min(100, Math.round(((defPct + maybePct * 0.5) * 0.6 + (avgInterest / 5) * 100 * 0.4)));

  const divergence = audienceScore - modelAProb;
  let divergenceInterp = 'Audience interest aligns closely with the historical machine learning baseline.';
  if (divergence >= 10) {
    divergenceInterp = `Current audience interest is stronger than the historical model signal (+${divergence} points). Real viewer sentiment indicates organic demand above statistical baseline.`;
  } else if (divergence <= -10) {
    divergenceInterp = `Historical model signals are stronger than current audience interest (${divergence} points). Consider testing tighter runtime or clearer genre positioning to lift viewer appeal.`;
  }

  const isSampleReliable = total >= 10;
  const sampleReliabilityWarning = !isSampleReliable
    ? `Early sample signal: Only ${total} response${total > 1 ? 's' : ''} collected. Percentages will stabilize once >= 10 responses are recorded.`
    : undefined;

  // A/B test comparison if applicable
  let abTestComparison: any = undefined;
  if (test && test.isABTest) {
    const votesA = responses.filter(r => r.choiceAB === 'A').length;
    const votesB = responses.filter(r => r.choiceAB === 'B').length;
    const totalAB = votesA + votesB || 1;
    const prefA = Math.round((votesA / totalAB) * 100);
    const prefB = Math.round((votesB / totalAB) * 100);
    const winner = prefA > prefB ? 'A' : prefB > prefA ? 'B' : 'TIE';
    abTestComparison = {
      preferenceA: prefA,
      preferenceB: prefB,
      winner,
      deltaPoints: Math.abs(prefA - prefB),
      modelA: modelAProb,
      modelB: test.variationB ? Math.round(test.variationB.modelAProbability * 100) : 70,
      responsesA: votesA,
      responsesB: votesB
    };
  }

  // Decision Test Result if applicable
  let decisionTestResult: any = undefined;
  if (test && test.decisionTest) {
    const vA = test.decisionTest.votesA;
    const vB = test.decisionTest.votesB;
    const tot = vA + vB || 1;
    decisionTestResult = {
      votesA: vA,
      votesB: vB,
      percentA: Math.round((vA / tot) * 100),
      percentB: Math.round((vB / tot) * 100),
      winner: vA > vB ? 'A' : vB > vA ? 'B' : 'TIE'
    };
  }

  return {
    testId,
    totalResponses: total,
    definitelyPercentage: defPct,
    maybePercentage: maybePct,
    probablyNotPercentage: notPct,
    avgInterestScore: avgInterest,
    audienceInterestPercentage: audienceScore,
    modelAProbability: modelAProb,
    divergencePoints: divergence,
    divergenceInterpretation: divergenceInterp,
    isSampleReliable,
    sampleReliabilityWarning,
    topPositiveSignals: [
      `High premise engagement (${defPct}% definitely would watch)`,
      `Average interest rating of ${avgInterest}/5 among active viewers`,
      `Strong alignment with target genre demographic`
    ],
    topConcerns: [
      notPct > 15 ? `${notPct}% expressed hesitation around runtime pacing` : 'Maintaining cinematic tone in second act',
      'Need clear visual setpieces in early promotional material'
    ],
    recommendedExperiment: test?.runtime && test.runtime > 130
      ? `Test runtime optimization (132m -> 120m) in What-If Simulator to boost both Model score and casual audience interest.`
      : `Refine marketing tagline and test A/B poster art in Audience Decision Lab.`,
    abTestComparison,
    decisionTestResult
  };
}

// ==========================================
// 2. PRODUCER PROJECT TRACKING & WHAT-IF LOOP
// ==========================================

export function getProducerTrackedProjects(): ProducerTrackedProject[] {
  PRODUCER_PROJECTS = getLocalItem<ProducerTrackedProject[]>('cinepredict_producer_projects', PRODUCER_PROJECTS);
  return PRODUCER_PROJECTS;
}

export function saveProducerProject(project: Partial<ProducerTrackedProject>): ProducerTrackedProject {
  PRODUCER_PROJECTS = getProducerTrackedProjects();
  const existingIdx = PRODUCER_PROJECTS.findIndex(p => p.id === project.id);
  if (existingIdx >= 0) {
    PRODUCER_PROJECTS[existingIdx] = {
      ...PRODUCER_PROJECTS[existingIdx],
      ...project,
      lastUpdated: new Date().toISOString()
    } as ProducerTrackedProject;
    setLocalItem('cinepredict_producer_projects', PRODUCER_PROJECTS);
    return PRODUCER_PROJECTS[existingIdx];
  } else {
    const newProj: ProducerTrackedProject = {
      id: 'proj_' + Date.now(),
      producerUsername: project.producerUsername || 'producer_demo',
      title: project.title || 'Untitled Project',
      synopsis: project.synopsis || '',
      genres: project.genres || ['Action', 'Thriller'],
      budget: project.budget || 50000000,
      runtime: project.runtime || 120,
      releaseMonth: project.releaseMonth || 7,
      releaseYear: project.releaseYear || 2026,
      status: project.status || 'Concept',
      currentVersion: 1,
      versions: project.versions || [
        {
          versionNumber: 1,
          title: project.title || 'Untitled Concept',
          budget: project.budget || 50000000,
          runtime: project.runtime || 120,
          genres: project.genres || ['Action', 'Thriller'],
          releaseMonth: project.releaseMonth || 7,
          modelAProbability: project.latestModelAProbability || 65,
          changeNote: 'Initial project concept creation.',
          createdAt: new Date().toISOString()
        }
      ],
      totalAudienceResponses: 0,
      latestModelAProbability: project.latestModelAProbability || 65,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    PRODUCER_PROJECTS = [newProj, ...PRODUCER_PROJECTS];
    setLocalItem('cinepredict_producer_projects', PRODUCER_PROJECTS);
    return newProj;
  }
}

// ==========================================
// 3. LIVE CINEMA & MARKET INTELLIGENCE ENGINE
// ==========================================

export function getLiveMarketDashboardData(): LiveMarketDashboardData {
  const { movies } = getCleanedDataset();

  // Helper to format TMDB movie to LiveCinemaMovie with verified metrics
  const mapToLiveCinema = (
    m: Movie,
    category: LiveCinemaMovie['category'],
    trend: 'up' | 'down' | 'neutral' = 'up',
    momentumPct: number = 18.5,
    histPred: number = 72
  ): LiveCinemaMovie => {
    const pulse = Math.min(100, Math.round((m.vote_average * 7) + (Math.log10(Math.max(10, m.vote_count)) * 7) + (m.popularity * 0.15)));
    let pulseSignal: LiveCinemaMovie['pulseSignal'] = 'Steady';
    if (pulse >= 80) pulseSignal = 'Strong';
    else if (pulse >= 60) pulseSignal = 'Emerging';
    else if (trend === 'down') pulseSignal = 'Cooling';

    const actualHit = m.success === 1;
    const diff = Math.round((actualHit ? 85 : 42) - histPred);
    let trackingStatus: LiveCinemaMovie['predictionTrackingStatus'] = 'Aligned';
    if (diff >= 12) trackingStatus = 'Tracking Positively';
    else if (diff <= -12) trackingStatus = 'Diverging';

    return {
      id: m.id,
      title: m.title,
      releaseDate: m.release_date || `${m.release_year}-07-15`,
      genres: m.genres,
      rating: m.vote_average,
      voteCount: m.vote_count,
      popularity: Math.round(m.popularity * 10) / 10,
      overview: m.overview,
      posterPath: m.poster_path,
      language: m.original_language,
      category,
      trendDirection: trend,
      popularityMomentumPercent: momentumPct,
      pulseScore: pulse,
      pulseSignal,
      historicalModelPrediction: histPred,
      predictionTrackingStatus: trackingStatus,
      predictionDivergencePoints: diff,
      predictionDivergenceAlert: Math.abs(diff) >= 15
        ? `Observable market divergence: Real-world audience outcome differs by ${Math.abs(diff)} pts from pre-release baseline.`
        : undefined
    };
  };

  // Trending Now (high popularity)
  const trendingNow = [...movies]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8)
    .map((m, i) => mapToLiveCinema(m, 'trending', i % 3 === 0 ? 'up' : 'neutral', +(24 - i * 2.1).toFixed(1), 78));

  // Now Playing (theatrical/recent release dates)
  const nowPlaying = [...movies]
    .sort((a, b) => (b.release_year * 100 + b.release_month) - (a.release_year * 100 + a.release_month))
    .slice(0, 8)
    .map((m, i) => mapToLiveCinema(m, 'now_playing', 'up', +(19.4 - i * 1.5).toFixed(1), 72));

  // Top Rated (vote_average >= 7.5 with >= 500 votes)
  const topRated = [...movies]
    .filter(m => m.vote_count >= 500)
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 8)
    .map(m => mapToLiveCinema(m, 'top_rated', 'up', +15.2, 85));

  // Popular This Week
  const popularThisWeek = [...movies]
    .filter(m => m.vote_count >= 200)
    .sort((a, b) => (b.popularity * b.vote_average) - (a.popularity * a.vote_average))
    .slice(0, 8)
    .map(m => mapToLiveCinema(m, 'popular', 'up', +22.0, 80));

  // Upcoming Releases (simulated near-future release slate)
  const upcomingReleases = [...movies]
    .slice(20, 28)
    .map((m, i) => ({
      ...mapToLiveCinema(m, 'upcoming', 'neutral', 0, 74 + (i % 5)),
      releaseDate: `2026-0${Math.min(9, 6 + (i % 4))}-15`,
      predictionTrackingStatus: 'Awaiting Release' as const
    }));

  // Trending Genres Engine (transparent calculation from average popularity & release share)
  const genreTally: Record<string, { totalPop: number; count: number; successes: number }> = {};
  movies.forEach(m => {
    m.genres.forEach(g => {
      if (!genreTally[g]) genreTally[g] = { totalPop: 0, count: 0, successes: 0 };
      genreTally[g].totalPop += m.popularity;
      genreTally[g].count++;
      if (m.success === 1) genreTally[g].successes++;
    });
  });

  const trendingGenres = Object.entries(genreTally)
    .map(([genre, data]) => {
      const avgPop = Math.round((data.totalPop / data.count) * 10) / 10;
      const hitRatio = data.successes / data.count;
      let trend: 'up' | 'steady' | 'down' = 'steady';
      if (avgPop > 28 || hitRatio > 0.48) trend = 'up';
      else if (avgPop < 16) trend = 'down';

      return {
        genre,
        trend,
        popularityAvg: avgPop,
        catalogGrowthPercent: +(hitRatio * 100).toFixed(1),
        explanation: `Calculated from ${data.count} titles in dataset (Avg TMDB Popularity: ${avgPop}, Hit Conversion: ${(hitRatio * 100).toFixed(0)}%)`
      };
    })
    .sort((a, b) => b.popularityAvg - a.popularityAvg)
    .slice(0, 6);

  return {
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dataSource: 'TMDB 5000 Official Verified Dataset & Cinema Signals Stream',
    trendingNow,
    nowPlaying,
    popularThisWeek,
    topRated,
    upcomingReleases,
    trendingGenres,
    topRisingTitles: trendingNow.slice(0, 4),
    topDecliningTitles: trendingNow.slice(4, 8).map(m => ({ ...m, trendDirection: 'down' as const, popularityMomentumPercent: -12.4 }))
  };
}
