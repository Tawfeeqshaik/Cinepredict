export type UserRole = 'producer' | 'viewer';
export type ModelAlgorithm = 'random_forest' | 'logistic_regression' | 'xgboost' | 'svm';

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  likedMovieIds: number[];
  createdAt: string;
}

export interface Movie {
  id: number;
  title: string;
  budget: number;
  revenue: number;
  genres: string[];
  keywords: string[];
  cast: string[];
  crew: { name: string; job: string }[];
  production_companies: string[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date: string;
  release_month: number; // 1-12
  release_year: number;
  runtime: number;
  original_language: string;
  overview: string;
  poster_path?: string;
  top_cast_popularity: number; // Average historical popularity of top 3 billed cast
  success: number; // 1 if vote_average >= 6.5 AND vote_count >= 100, else 0
}

export interface DatasetStats {
  totalRows: number;
  cleanedRows: number;
  zeroBudgetRows: number;
  zeroRevenueRows: number;
  missingDateRows: number;
  duplicateRows: number;
  avgBudgetCleaned: number;
  avgRevenueCleaned: number;
  successRate: number;
  topGenres: { genre: string; count: number; avgRevenue: number; successRate: number }[];
  castPopularityLeakageNote: string;
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface FeatureImportance {
  feature: string;
  displayName: string;
  score: number;
  shapValue: number;
  isPreRelease: boolean;
  category: 'financial' | 'metadata' | 'cast' | 'genre' | 'engagement';
}

export interface TemporalValidationWindow {
  period: string; // e.g. "2005-2010", "2011-2015", "2016-2020", "2021+"
  trainYears: string;
  testYears: string;
  testCount: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  accuracy: number;
}

export interface CalibrationBin {
  predictedBin: number; // e.g. 0.1, 0.3, 0.5, 0.7, 0.9
  meanPredicted: number;
  observedRate: number;
  sampleCount: number;
}

export interface ModelMetrics {
  modelId: 'A' | 'B';
  algorithm: ModelAlgorithm;
  algorithmName: string;
  name: string;
  subtitle: string;
  featuresUsed: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number; // Precision-Recall AUC
  brierScore: number; // Calibration error score (0=perfect, 1=worst)
  logLoss: number;
  cvMeanAccuracy: number; // 5-fold Random CV average
  cvStdDev: number; // 5-fold Random CV std dev
  temporalRocAuc: number; // Out-of-Time Walk-Forward CV ROC-AUC
  temporalPrAuc: number;
  confusionMatrix: ConfusionMatrix;
  rocCurve: { fpr: number; tpr: number }[];
  calibrationBins: CalibrationBin[];
  temporalWindows: TemporalValidationWindow[];
  featureImportances: FeatureImportance[];
  decisionThreshold: number; // Default 0.50, optimized per model
  leakageWarning?: string;
}

export interface ProjectSimulationInput {
  title: string;
  budget: number;
  runtime: number;
  genres: string[];
  release_month: number;
  release_year: number;
  production_company: string;
  top_cast_popularity: number;
  original_language?: string;
  modelAlgorithm?: ModelAlgorithm;
  decisionThreshold?: number;
}

export interface ShapDriver {
  feature: string;
  displayName: string;
  value: string | number;
  impact: number; // positive or negative percentage contribution
  direction: 'positive' | 'negative';
  description: string;
}

export interface FailureRiskFactor {
  feature: string;
  displayName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  negativeImpact: number; // negative percentage
  description: string;
  recommendedIntervention: string;
}

export interface DecisionEngineOutput {
  decisionSummary: string;
  recommendedNextStep: string;
  controllableRisks: string[];
  strengths: string[];
  projectSuccessPotential: 'High' | 'Moderate' | 'Challenging';
  recommendationVerdict: 'Proceed' | 'Proceed with Caution' | 'Reconsider Packaging';
  confidenceContext: string;
}

export interface ScenarioInput {
  id: string;
  name: string; // e.g. "Scenario A: Shorter Runtime"
  budget: number;
  runtime: number;
  genres: string[];
  release_month: number;
  release_year: number;
  top_cast_popularity: number;
}

export interface ScenarioResult {
  scenario: ScenarioInput;
  prediction: PredictionResult;
  deltaProbability: number; // e.g. +6.5% vs baseline
  keyChangedVariables: string[];
  whyImproved: string;
}

export interface SignalConflictResult {
  hasConflict: boolean;
  type: 'NONE' | 'SIGNAL_CONFLICT' | 'AUDIENCE_UPSIDE';
  headline: string;
  explanation: string;
  mlScore: number;
  audienceScore: number;
  delta: number;
}

export interface PredictionReliability {
  coverageScore: number; // e.g. 85%
  isOutOfDomain: boolean;
  outOfDomainWarning?: string;
  leakageStatus: 'PASS' | 'POST-RELEASE LEAKAGE DETECTED';
  dataCoverageStatus: 'EXCELLENT' | 'GOOD' | 'PARTIAL';
}

export interface ModelDebateScore {
  algorithm: ModelAlgorithm;
  algorithmName: string;
  probability: number;
  weight: number;
  rationale: string;
}

export interface ModelDebateInfo {
  scores: ModelDebateScore[];
  consensusRange: string; // e.g. "61% – 72%"
  consensusStatus: 'STRONG AGREEMENT' | 'MODERATE DISAGREEMENT' | 'HIGH DISAGREEMENT';
  consensusProbability: number;
  agreementExplanation: string;
}

export interface MovieDnaDimension {
  id: string;
  dimension: string;
  score: number; // 0 - 100
  label: 'Very Strong' | 'Strong' | 'Moderate' | 'Weak' | 'High Risk';
  explanation: string;
}

export interface WhyNotAnalysis {
  limitingSignals: { signal: string; impact: string; severity: 'HIGH' | 'MEDIUM' }[];
  biggestOpportunity: { variable: string; current: string; recommended: string; estimatedGain: number; rationale: string };
}

export interface CounterfactualOption {
  field: string;
  displayName: string;
  currentValue: string;
  counterfactualValue: string;
  simulatedProbability: number;
  deltaProbability: number;
  impactLevel: 'HIGH IMPACT' | 'MEDIUM IMPACT' | 'LOW IMPACT';
}

export interface SuccessPathStep {
  stepNumber: number;
  title: string;
  action: string;
  probability: number;
  delta: number;
}

export interface VirtualExperimentConfig {
  version: string;
  title: string;
  budget: number;
  runtime: number;
  genres: string[];
  release_month: number;
  top_cast_popularity: number;
  probability: number;
  deltaVsOriginal: number;
  strongestFactor: string;
  weakestFactor: string;
}

export interface VirtualExperimentData {
  configurations: VirtualExperimentConfig[];
  bestConfiguration: VirtualExperimentConfig;
  originalProbability: number;
  improvementDelta: number;
}

export interface RobustnessMetrics {
  stabilityRating: 'STABLE' | 'MODERATE' | 'SENSITIVE';
  estimatedRange: string; // e.g. "58% – 69%"
  perturbedScores: number[];
  stdDev: number;
  minScore: number;
  maxScore: number;
}

export interface NoveltyWarning {
  isDataScarce: boolean;
  isNovel: boolean;
  matchingRecordCount: number;
  warningMessage?: string;
  reliabilityLabel: 'EXCELLENT DATA COVERAGE' | 'MODERATE COVERAGE' | 'LIMITED HISTORICAL EVIDENCE';
}

export interface GreenlightDecisionSupport {
  category: 'STRONG CANDIDATE' | 'NEEDS REVISION' | 'HIGH UNCERTAINTY' | 'HIGH RISK';
  headline: string;
  reasons: string[];
  recommendedAction: string;
}

export interface PredictionResult {
  isSuccess: boolean;
  successProbability: number;
  calibratedProbability: number;
  modelAProbability: number;
  modelBEstimate: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  reliability: PredictionReliability;
  topDrivers: ShapDriver[];
  failureRisks?: FailureRiskFactor[];
  decisionEngine?: DecisionEngineOutput;
  recommendations: string[];
  algorithmUsed?: ModelAlgorithm;
  decisionThresholdUsed: number;
  
  // Advanced Prediction Command Center Extensions
  modelDebate?: ModelDebateInfo;
  movieDna?: MovieDnaDimension[];
  whyNot?: WhyNotAnalysis;
  counterfactuals?: CounterfactualOption[];
  virtualExperiment?: VirtualExperimentData;
  successPath?: SuccessPathStep[];
  robustness?: RobustnessMetrics;
  noveltyWarning?: NoveltyWarning;
  decisionSupport?: GreenlightDecisionSupport;
}

export interface SavedPredictionRecord {
  id: string;
  timestamp: string;
  title: string;
  budget: number;
  runtime: number;
  genres: string[];
  release_month: number;
  release_year: number;
  top_cast_popularity: number;
  algorithmUsed: ModelAlgorithm;
  successProbability: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  predictionResult: PredictionResult;
}

export interface DataProvenanceStats {
  primaryDataset: string;
  secondaryDataset: string;
  totalRecords: number;
  validRecords: number;
  removedRecords: number;
  deduplicatedRecords: number;
  zeroBudgetHandled: number;
  zeroRevenueHandled: number;
  missingValuesHandled: number;
  featureCount: number;
  lastTrainingTime: string;
}

export interface AudienceIntelligenceStats {
  totalAudienceVotes: number;
  activeBattlesCount: number;
  topAudienceGenres: { genre: string; voteShare: number }[];
  audienceModelDisagreementIndex: number; // 0 - 100
  recentActivitySummary: string;
}

export interface ConceptVariation {
  id: string;
  title: string;
  budget: number;
  runtime: number;
  genres: string[];
  release_month: number;
  release_year: number;
  top_cast_popularity: number;
  logline: string;
  modelAProbability: number;
  votes: number;
}

export interface ConceptBattle {
  id: string;
  createdAt: string;
  conceptA: ConceptVariation;
  conceptB: ConceptVariation;
  signalConflict?: SignalConflictResult;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  intentMatched?: string;
  groundedData?: {
    type: 'movies' | 'chart' | 'shap' | 'model_compare' | 'hidden_gems' | 'scenarios' | 'risks' | 'provenance';
    title?: string;
    items?: any[];
    summaryStats?: Record<string, any>;
  };
}

export interface RecommendationReason {
  movieId: number;
  matchScore: number; // 0 - 100%
  matchedGenres: string[];
  matchedKeywords: string[];
  reasonText: string;
}

export interface AudienceOpportunity {
  segment: string; // e.g. "Tamil + Thriller", "Action + Summer Window"
  demandScore: number; // 0-100 derived from average popularity & vote count
  supplyScore: number; // 0-100 derived from catalog percentage
  opportunityGap: number; // demandScore - supplyScore
  status: 'HIGH OPPORTUNITY' | 'MEDIUM OPPORTUNITY' | 'BALANCED';
  whyItMatters: string;
}

export interface RegionalContentInsight {
  languageCode: string; // e.g. "hi", "ta", "en", "fr"
  languageName: string; // e.g. "Hindi", "Tamil", "English", "French"
  titleCount: number;
  avgRating: number;
  avgPopularity: number;
  hitRate: number; // percentage of movies satisfying success criteria
  topGenres: { genre: string; count: number }[];
  demandVsSupplyRatio: number;
}

export interface ContentGapItem {
  combination: string; // e.g. "Horror in October", "Drama + Low Budget"
  category: 'Language + Genre' | 'Genre + Seasonality' | 'Runtime + Audience Preference';
  engagementIndex: number;
  catalogSharePercentage: number;
  gapSeverity: 'HIGH OPPORTUNITY' | 'MEDIUM OPPORTUNITY' | 'LOW OPPORTUNITY' | 'INSUFFICIENT DATA';
  strategicNote: string;
}

export interface CineAccessMetrics {
  totalTitlesWithLanguageData: number;
  languagesSupportedCount: number;
  topLanguages: { code: string; name: string; count: number }[];
  subtitleAccessibilityPercentage: number;
  cineAccessScore: number; // 0-100 score based on language diversity & multi-lingual coverage
}

export interface PostReleaseDiagnostic {
  movieId: number;
  title: string;
  releaseYear: number;
  budget: number;
  actualVoteAverage: number;
  actualVoteCount: number;
  actualRevenue: number;
  predictedRevenue: number;
  absoluteError: number; // in $M
  percentageError: number; // in %
  actualTarget: number;
  predictedProbability: number;
  predictedRiskLevel: 'Low' | 'Moderate' | 'High';
  predictionGap: number; // actual (100 or 0) - predictedProbability
  outcomeVerdict: 'Overperformed Model' | 'Underperformed Model' | 'Aligned with Model';
  modelAssociatedFactors: { factor: string; direction: 'positive' | 'negative'; description: string }[];
}

export interface GreenlightInvestmentScenario {
  tier: 'LOW BUDGET ($15M)' | 'MEDIUM BUDGET ($50M)' | 'HIGH BUDGET ($120M)';
  budget: number;
  predictedSuccessProbability: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  comparableHitsCount: number;
  roiPotentialNote: string;
}

export interface ComparableMovieItem {
  movie: Movie;
  similarityScore: number; // 0 - 100%
  sharedAttributes: string[];
  reason: string;
}

export interface PredictionTrackerData {
  totalEvaluated: number;
  overallAccuracy: number;
  overallRocAuc: number;
  cvMeanAccuracy: number;
  confusionMatrix: ConfusionMatrix;
  calibrationBins: CalibrationBin[];
  rocCurve: { fpr: number; tpr: number }[];
  temporalWindows: TemporalValidationWindow[];
}

export interface ScriptExtractionMetrics {
  title: string;
  pageCount: number;
  estimatedRuntime: number; // ~1 page = 1 min
  sceneCount: number;
  dialoguePercentage: number; // 0-100
  actionPercentage: number; // 0-100
  characterCount: number;
  detectedCharacters: string[];
  detectedGenres: string[];
  detectedKeywords: string[];
  wordCount: number;
  // Enhanced Screenplay Dimensions
  intExtRatio?: { intCount: number; extCount: number; ratioText: string };
  locations?: string[];
  protagonist?: string;
  antagonist?: string;
  actStructure?: { act1Scenes: number; act2Scenes: number; act3Scenes: number };
  conflictDensity?: 'High' | 'Moderate' | 'Low' | 'Not detected';
  pacing?: 'Fast / Kinetic' | 'Moderate / Steady' | 'Deliberate / Atmospheric' | 'Not detected';
  emotionalProgression?: string;
  themes?: string[];
  stakes?: string;
  climax?: string;
  endingType?: 'Definitive / Resolved' | 'Ambiguous' | 'Cliffhanger' | 'Tragic' | 'Not detected';
  franchisePotential?: 'Standalone' | 'High Sequel Potential' | 'Franchise Starter' | 'Not detected';
  productionComplexity?: 'Moderate / Standard' | 'High VFX / Multi-Location' | 'Low / Single-Location' | 'Not detected';
  evidenceStrength?: 'Strong' | 'Moderate' | 'Limited' | 'Insufficient';
  smallSampleWarning?: boolean;
  modelConfidence?: 'High' | 'Medium' | 'Low' | 'Very Low';
  scoreBreakdown?: {
    category: string;
    score: number; // 0-100
    weight: string; // e.g. "20%"
    direction: 'positive' | 'negative' | 'neutral';
    status: 'Available' | 'Not available' | 'Estimated';
    explanation: string;
  }[];
  positiveSignals?: string[];
  negativeSignals?: string[];
}

export interface ScriptQualitativeFeedback {
  pacingAnalysis: {
    dialogueVsActionNote: string;
    pacingVerdict: string;
    genreComparison: string;
  };
  threeActStructure: {
    act1Notes: string;
    act2Notes: string;
    act3Notes: string;
  };
  suggestions: string[];
  isAIGenerated: boolean;
  analyzedAt: string;
}

export interface ScriptIntelligenceResult {
  extraction: ScriptExtractionMetrics;
  quantitativePrediction: PredictionResult;
  qualitativeFeedback: ScriptQualitativeFeedback;
}

// ==========================================
// AUDIENCE LAB & LIVE CINEMA INTELLIGENCE TYPES
// ==========================================

export interface DecisionTestOption {
  testType: 'title' | 'poster' | 'runtime' | 'positioning';
  questionTitle: string;
  optionA: string;
  optionB: string;
  optionAImage?: string;
  optionBImage?: string;
  votesA: number;
  votesB: number;
}

export interface AudienceQuestion {
  id: string;
  text: string;
  type: 'would_watch' | 'interest_scale' | 'genre_appeal' | 'expected_quality' | 'recommend' | 'text_feedback' | 'choice_ab';
  options?: string[];
}

export interface AudienceConceptTest {
  id: string;
  producerId: string;
  producerUsername: string;
  title: string;
  synopsis: string;
  genres: string[];
  runtime: number;
  language: string;
  releasePeriod: string;
  targetBudget: number;
  topCast: string[];
  director?: string;
  posterUrl?: string;
  modelAProbability: number; // Pre-Release ML prediction (kept secret from viewer prior to voting)
  riskLevel: 'Low' | 'Moderate' | 'High';
  questions: AudienceQuestion[];
  isABTest?: boolean;
  variationB?: {
    title: string;
    synopsis: string;
    genres: string[];
    runtime: number;
    targetBudget: number;
    modelAProbability: number;
  };
  decisionTest?: DecisionTestOption;
  status: 'testing' | 'pre-production' | 'released' | 'archived';
  createdAt: string;
  versionNumber: number;
  parentProjectId?: string;
}

export interface AudienceResponse {
  id: string;
  testId: string;
  viewerId: string;
  viewerUsername: string;
  votedAt: string;
  wouldWatch: 'definitely' | 'maybe' | 'probably_not';
  interestLevel: number; // 1 to 5
  genreAppeal?: number; // 1 to 5
  expectedQuality?: number; // 1 to 5
  wouldRecommend?: 'yes' | 'maybe' | 'no';
  feedbackText?: string;
  choiceAB?: 'A' | 'B';
  viewerPreferredGenre?: string;
}

export interface AudienceValidationAnalytics {
  testId: string;
  totalResponses: number;
  definitelyPercentage: number;
  maybePercentage: number;
  probablyNotPercentage: number;
  avgInterestScore: number; // e.g. 4.1 / 5
  audienceInterestPercentage: number; // e.g. 82%
  modelAProbability: number; // e.g. 64%
  divergencePoints: number; // e.g. +18
  divergenceInterpretation: string;
  isSampleReliable: boolean; // true if >= 10 responses
  sampleReliabilityWarning?: string;
  topPositiveSignals: string[];
  topConcerns: string[];
  recommendedExperiment: string;
  segmentation?: {
    byGenre: { genre: string; count: number; avgInterest: number }[];
    isDataSufficient: boolean;
  };
  abTestComparison?: {
    preferenceA: number;
    preferenceB: number;
    winner: 'A' | 'B' | 'TIE';
    deltaPoints: number;
    modelA: number;
    modelB: number;
    responsesA: number;
    responsesB: number;
  };
  decisionTestResult?: {
    votesA: number;
    votesB: number;
    percentA: number;
    percentB: number;
    winner: 'A' | 'B' | 'TIE';
  };
}

export interface ConceptVersionRecord {
  versionNumber: number;
  title: string;
  budget: number;
  runtime: number;
  genres: string[];
  releaseMonth: number;
  modelAProbability: number;
  audienceInterest?: number;
  changeNote: string;
  createdAt: string;
}

export interface ProducerTrackedProject {
  id: string;
  producerUsername: string;
  title: string;
  synopsis: string;
  genres: string[];
  budget: number;
  runtime: number;
  releaseMonth: number;
  releaseYear: number;
  status: 'Concept' | 'Testing' | 'Pre-Production' | 'Released' | 'Tracking' | 'Completed';
  currentVersion: number;
  versions: ConceptVersionRecord[];
  activeTestId?: string;
  totalAudienceResponses: number;
  latestAudienceInterest?: number;
  latestModelAProbability: number;
  divergencePoints?: number;
  divergenceAlert?: string;
  actualOutcomeSignal?: {
    rating: number;
    voteCount: number;
    popularity: number;
    status: 'Tracking Positively' | 'Diverging' | 'Aligned' | 'Awaiting Release';
    trend: 'up' | 'steady' | 'down';
  };
  createdAt: string;
  lastUpdated: string;
}

export interface LiveCinemaMovie {
  id: number;
  title: string;
  releaseDate: string;
  genres: string[];
  rating: number; // TMDB vote_average
  voteCount: number; // TMDB vote_count
  popularity: number; // TMDB popularity
  overview: string;
  posterPath?: string;
  language: string;
  category: 'trending' | 'now_playing' | 'popular' | 'top_rated' | 'upcoming';
  trendDirection: 'up' | 'down' | 'neutral';
  popularityMomentumPercent?: number; // e.g. +29.7%
  pulseScore: number; // 0-100 composite pulse index
  pulseSignal: 'Strong' | 'Steady' | 'Cooling' | 'Emerging';
  historicalModelPrediction?: number; // Pre-release model prediction if recorded
  predictionTrackingStatus?: 'Tracking Positively' | 'Diverging' | 'Aligned' | 'Awaiting Release';
  predictionDivergencePoints?: number;
  predictionDivergenceAlert?: string;
}

export interface LiveMarketDashboardData {
  lastUpdated: string;
  dataSource: string;
  trendingNow: LiveCinemaMovie[];
  nowPlaying: LiveCinemaMovie[];
  popularThisWeek: LiveCinemaMovie[];
  topRated: LiveCinemaMovie[];
  upcomingReleases: LiveCinemaMovie[];
  trendingGenres: {
    genre: string;
    trend: 'up' | 'steady' | 'down';
    popularityAvg: number;
    catalogGrowthPercent: number;
    explanation: string;
  }[];
  topRisingTitles: LiveCinemaMovie[];
  topDecliningTitles: LiveCinemaMovie[];
}

