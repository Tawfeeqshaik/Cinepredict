import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { getCleanedDataset } from "./src/data/tmdb_dataset";
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
  simulateScenarios,
  getDataProvenanceStats,
  getAudienceIntelligenceStats,
  getPredictionHistory,
  savePredictionToHistory,
  getAudienceOpportunityRadar,
  getRegionalContentRadar,
  getContentGapDetector,
  getCineAccessStats,
  getPostReleaseDiagnostic,
  getGreenlightSimulator,
  getComparableMovies,
  getPredictionTrackerData
} from "./src/services/ml_engine";
import { routeChatMessage } from "./src/services/chatbot_router";
import { extractScriptMetrics, generateScriptQualitativeFeedback } from "./src/services/script_intelligence";
import { UserProfile, UserRole, ModelAlgorithm } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory User store
const usersStore: Map<string, UserProfile & { passwordHash: string }> = new Map();

// Seed initial demo users
usersStore.set("producer_demo", {
  id: "u_prod_1",
  username: "producer_demo",
  role: "producer",
  likedMovieIds: [19995, 293660],
  createdAt: new Date().toISOString(),
  passwordHash: "demo123"
});

usersStore.set("viewer_demo", {
  id: "u_view_1",
  username: "viewer_demo",
  role: "viewer",
  likedMovieIds: [157336, 27205, 19995],
  createdAt: new Date().toISOString(),
  passwordHash: "demo123"
});

let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required." });
    }

    const existing = usersStore.get(username);
    if (existing) {
      if (existing.passwordHash === password) {
        const { passwordHash, ...userProfile } = existing;
        return res.json({ user: userProfile });
      } else {
        return res.status(401).json({ error: "Invalid password." });
      }
    }

    // Auto-register new user for smooth demo experience
    const newUser: UserProfile & { passwordHash: string } = {
      id: "u_" + Date.now(),
      username,
      role: "producer",
      likedMovieIds: [],
      createdAt: new Date().toISOString(),
      passwordHash: password
    };
    usersStore.set(username, newUser);

    const { passwordHash, ...userProfile } = newUser;
    return res.json({ user: userProfile });
  });

  // Auth: Likes toggle
  app.post("/api/likes/toggle", (req, res) => {
    const { username, movieId } = req.body;
    if (!username || !movieId) return res.status(400).json({ error: "Invalid parameters" });

    const user = usersStore.get(username);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.likedMovieIds.includes(movieId)) {
      user.likedMovieIds = user.likedMovieIds.filter(id => id !== movieId);
    } else {
      user.likedMovieIds.push(movieId);
    }

    return res.json({ likedMovieIds: user.likedMovieIds });
  });

  // Movies dataset endpoint
  app.get("/api/movies", (_req, res) => {
    const data = getCleanedDataset();
    return res.json(data);
  });

  // Models: Evaluation metrics (Model A vs Model B) with algorithm parameter
  app.get("/api/models/evaluate", (req, res) => {
    const algorithm = (req.query.algorithm as ModelAlgorithm) || "random_forest";
    const metrics = evaluateModels(algorithm);
    return res.json(metrics);
  });

  // Simulation: Predict My Project
  app.post("/api/predict", (req, res) => {
    const input = req.body;
    if (!input || !input.budget || !input.genres) {
      return res.status(400).json({ error: "Missing required project simulation parameters." });
    }
    const result = simulateProjectPrediction(input);
    savePredictionToHistory(input, result);
    return res.json(result);
  });

  // What-If Scenario Simulator endpoint
  app.post("/api/scenarios/simulate", (req, res) => {
    const { baselineInput, scenarios } = req.body;
    if (!baselineInput || !scenarios) {
      return res.status(400).json({ error: "Missing baselineInput or scenarios." });
    }
    const results = simulateScenarios(baselineInput, scenarios || []);
    return res.json(results);
  });

  // Data Provenance endpoint
  app.get("/api/data-provenance", (_req, res) => {
    const provenance = getDataProvenanceStats();
    return res.json(provenance);
  });

  // Producer Live Audience Intelligence endpoint
  app.get("/api/audience/intelligence", (_req, res) => {
    const intelligence = getAudienceIntelligenceStats();
    return res.json(intelligence);
  });

  // Prediction History endpoint
  app.get("/api/predictions/history", (_req, res) => {
    const history = getPredictionHistory();
    return res.json({ history });
  });

  // Concept Validation Loop Endpoints
  app.get("/api/concepts/active", (req, res) => {
    const battle = getActiveConceptBattle();
    return res.json(battle);
  });

  app.post("/api/concepts/create", (req, res) => {
    const { conceptA, conceptB } = req.body;
    const battle = createConceptBattle(conceptA || {}, conceptB || {});
    return res.json(battle);
  });

  app.post("/api/concepts/vote", (req, res) => {
    const { choice } = req.body;
    if (choice !== "A" && choice !== "B") {
      return res.status(400).json({ error: "Choice must be 'A' or 'B'" });
    }
    const updated = voteConceptBattle(choice);
    return res.json(updated);
  });

  // Recommendations: Similar movies
  app.get("/api/recommend/:movieId", (req, res) => {
    const movieId = parseInt(req.params.movieId, 10);
    const results = getTop10Similar(movieId);
    return res.json({ recommendations: results });
  });

  // Personalization: For You Feed
  app.post("/api/personalized", (req, res) => {
    const { likedMovieIds } = req.body;
    const feed = getPersonalizedFeed(likedMovieIds || []);
    return res.json({ feed });
  });

  // Hidden Gems & Trending
  app.get("/api/hidden-gems", (req, res) => {
    const genre = req.query.genre as string;
    const gems = getHiddenGems(genre);
    return res.json({ gems });
  });

  app.get("/api/trending", (req, res) => {
    const trends = getTrendingByGenre();
    return res.json({ trends });
  });

  // Audience Opportunity Radar
  app.get("/api/opportunity-radar", (_req, res) => {
    const opportunities = getAudienceOpportunityRadar();
    return res.json({ opportunities });
  });

  // Regional Content Radar (Indian & Global Cinema)
  app.get("/api/regional-radar", (_req, res) => {
    const regional = getRegionalContentRadar();
    return res.json({ regional });
  });

  // Content Gap Detector
  app.get("/api/content-gaps", (_req, res) => {
    const gaps = getContentGapDetector();
    return res.json({ gaps });
  });

  // CineAccess Accessibility Metrics
  app.get("/api/cineaccess", (_req, res) => {
    const cineaccess = getCineAccessStats();
    return res.json(cineaccess);
  });

  // Post-Release Performance Diagnostic
  app.get("/api/post-release-diagnostic/:movieId", (req, res) => {
    const movieId = parseInt(req.params.movieId, 10);
    const diagnostic = getPostReleaseDiagnostic(movieId);
    if (!diagnostic) return res.status(404).json({ error: "Movie not found" });
    return res.json(diagnostic);
  });

  // Greenlight Investment Simulator
  app.post("/api/greenlight-simulator", (req, res) => {
    const input = req.body;
    if (!input || !input.budget) return res.status(400).json({ error: "Input with budget required" });
    const scenarios = getGreenlightSimulator(input);
    return res.json({ scenarios });
  });

  // Comparable Movies Finder
  app.post("/api/comparable-movies", (req, res) => {
    const input = req.body;
    if (!input) return res.status(400).json({ error: "Input required" });
    const comparables = getComparableMovies(input, 5);
    return res.json({ comparables });
  });

  // Prediction Tracker Data
  app.get("/api/prediction-tracker", (req, res) => {
    const algorithm = (req.query.algorithm as ModelAlgorithm) || 'random_forest';
    const trackerData = getPredictionTrackerData(algorithm);
    return res.json(trackerData);
  });

  // Likes toggle
  app.post("/api/likes/toggle", (req, res) => {
    const { username, movieId } = req.body;
    if (!username) return res.status(400).json({ error: "Username required." });
    const cleanUsername = username.trim().toLowerCase();
    const user = usersStore.get(cleanUsername);
    if (!user) return res.status(404).json({ error: "User not found." });

    const numId = parseInt(movieId, 10);
    const index = user.likedMovieIds.indexOf(numId);
    if (index >= 0) {
      user.likedMovieIds.splice(index, 1);
    } else {
      user.likedMovieIds.push(numId);
    }

    const { passwordHash, ...userPublic } = user;
    return res.json({ success: true, user: userPublic });
  });

  // Grounded Chatbot API (Route intent first, with Gemini API context augmentation)
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message text is required." });

    // 1. Route through deterministic grounded intent router
    const routedMsg = routeChatMessage(message);

    // If a clear intent was matched, return immediately with dataset-grounded data
    if (routedMsg.intentMatched && routedMsg.intentMatched !== 'general_grounded') {
      return res.json({ response: routedMsg });
    }

    // 2. Otherwise try Gemini API grounding if key exists
    const ai = getGemini();
    if (ai) {
      try {
        const datasetSummary = `You are CinePredict AI Assistant. You answer questions strictly grounded in the TMDB 5000 movie dataset analysis.
Key findings: Model A (Pre-release) accuracy is ~82% using budget, cast, genres, seasonality. Model B (Post-release) accuracy is ~95% but suffers from target leakage due to vote_count & popularity.

User Question: ${message}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: datasetSummary,
        });

        const replyText = response.text || routedMsg.text;
        return res.json({
          response: {
            ...routedMsg,
            text: replyText
          }
        });
      } catch (err) {
        console.error("Gemini API error fallback:", err);
      }
    }

    // Return standard grounded message
    return res.json({ response: routedMsg });
  });

  // Script Intelligence: Extraction Pipeline
  app.post("/api/script/extract", (req, res) => {
    const { text, fileName } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Script/treatment text is required." });
    }
    const extraction = extractScriptMetrics(text, fileName);
    return res.json({ extraction });
  });

  // Script Intelligence: Gemini Qualitative Analysis
  app.post("/api/script/analyze", async (req, res) => {
    const { metrics, text } = req.body;
    if (!metrics || !text) {
      return res.status(400).json({ error: "Metrics and script text are required." });
    }
    const ai = getGemini();
    const qualitativeFeedback = await generateScriptQualitativeFeedback(metrics, text, ai);
    return res.json({ qualitativeFeedback });
  });

  // --- VITE / SERVING SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CinePredict server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
