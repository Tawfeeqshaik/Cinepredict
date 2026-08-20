import { GoogleGenAI } from '@google/genai';
import { ScriptExtractionMetrics, ScriptQualitativeFeedback } from '../types';

const GENRE_DICTIONARIES: Record<string, string[]> = {
  'Science Fiction': ['space', 'alien', 'galaxy', 'quantum', 'cyber', 'android', 'spaceship', 'orbit', 'teleport', 'hologram', 'ai', 'dystopian', 'terraforming', 'nanotech', 'laser', 'starship', 'cosmos'],
  'Action': ['explosion', 'gunfire', 'pursuit', 'combat', 'sniper', 'chase', 'ambush', 'weapon', 'assassination', 'grenade', 'helicopter', 'assault', 'tactical', 'shootout', 'fistfight', 'martial arts'],
  'Thriller': ['detective', 'hostage', 'conspiracy', 'suspect', 'interrogation', 'surveillance', 'wiretap', 'ransom', 'alibi', 'serial killer', 'undercover', 'poison', 'blackmail', 'fugitive'],
  'Horror': ['demon', 'blood', 'curse', 'corpse', 'shadow', 'screaming', 'haunted', 'nightmare', 'flesh', 'possession', 'creature', 'monstrous', 'graveyard', 'slasher', 'gory', 'paralytic'],
  'Drama': ['courtroom', 'divorce', 'terminal', 'tears', 'tragedy', 'grief', 'funeral', 'confession', 'betrayal', 'legacy', 'reconciliation', 'addiction', 'custody', 'estranged'],
  'Comedy': ['awkward', 'hilarious', 'laughing', 'prank', 'misunderstanding', 'clumsy', 'sarcasm', 'ridiculous', 'blunder', 'punchline', 'satire', 'roast', 'humiliation', 'chaos'],
  'Fantasy': ['spell', 'kingdom', 'dragon', 'wizard', 'enchantment', 'sorcerer', 'magic', 'throne', 'prophecy', 'elven', 'potion', 'relic', 'mythical', 'sword', 'castle'],
  'Romance': ['kiss', 'embrace', 'heartbroken', 'passionate', 'romance', 'wedding', 'lovers', 'tender', 'affection', 'intimate', 'flirt', 'desire', 'chemistry', 'soulmate'],
  'Adventure': ['expedition', 'treasure', 'jungle', 'uncharted', 'survival', 'island', 'ruins', 'voyage', 'cliffhanger', 'peril', 'journey', 'quest'],
  'Crime': ['heist', 'mobster', 'gangster', 'cartel', 'syndicate', 'contraband', 'smuggling', 'launder', 'vault', 'felony', 'extortion']
};

/**
 * Parses script or treatment text to extract quantitative screenplay metrics.
 */
export function extractScriptMetrics(rawText: string, fileName?: string): ScriptExtractionMetrics {
  const cleanText = (rawText || '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 1. Extract Title
  let title = 'Untitled Script Project';
  if (fileName) {
    title = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } else if (lines.length > 0) {
    const firstLine = lines[0].replace(/^(screenplay|script|treatment|written by|by|title:)\s*/i, '').trim();
    if (firstLine.length > 2 && firstLine.length < 60) {
      title = firstLine;
    }
  }

  // 2. Word Count & Page Count
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  // Screenplay industry standard: ~240 words per page (1 page ≈ 1 minute)
  const pageCount = Math.max(1, Math.round(wordCount / 240));
  const estimatedRuntime = Math.min(240, Math.max(70, pageCount));

  // 3. Scene Count (INT./EXT. sluglines)
  const sluglineRegex = /(?:^|\n)\s*(?:INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.|SCENE\s+\d+|I\/E\.)\s+[^\n]+/gi;
  const slugMatches = cleanText.match(sluglineRegex) || [];
  let sceneCount = slugMatches.length;
  if (sceneCount === 0) {
    // If treatment without formal sluglines, approximate 1 scene per 2.5 pages
    sceneCount = Math.max(4, Math.round(pageCount / 2.5));
  }

  // 4. Dialogue vs Action Text Ratio
  let dialogueWordCount = 0;
  let actionWordCount = 0;
  const characterCues: Set<string> = new Set();
  const characterCounts: Record<string, number> = {};

  const nameRegex = /^[A-Z0-9\s.()'-]{2,28}$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSlug = /^(?:INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.|SCENE)/i.test(line);
    if (isSlug) continue;

    // Check if line looks like a character name cue
    if (nameRegex.test(line) && line.length > 1 && line.length < 25 && !line.includes(':') && !line.endsWith('.')) {
      const charName = line.replace(/\s*\(.*?\)\s*/g, '').trim();
      if (charName.length > 1 && !['CUT TO', 'FADE IN', 'FADE OUT', 'THE END', 'DISSOLVE TO', 'CONTINUED', 'FLASHBACK'].includes(charName)) {
        characterCues.add(charName);
        characterCounts[charName] = (characterCounts[charName] || 0) + 1;
        // The following line is likely dialogue
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const nextWords = nextLine.split(/\s+/).length;
          dialogueWordCount += nextWords;
          i++; // Skip the next line since it was processed as dialogue
          continue;
        }
      }
    }

    // Check quotation marks for treatment dialogue
    const quotedMatches = line.match(/"([^"]*)"/g);
    if (quotedMatches) {
      const quotedWords = quotedMatches.reduce((acc, q) => acc + q.split(/\s+/).length, 0);
      dialogueWordCount += quotedWords;
      actionWordCount += Math.max(0, line.split(/\s+/).length - quotedWords);
    } else {
      actionWordCount += line.split(/\s+/).length;
    }
  }

  const totalEvaluatedWords = dialogueWordCount + actionWordCount;
  let dialoguePercentage = totalEvaluatedWords > 0 ? Math.round((dialogueWordCount / totalEvaluatedWords) * 100) : 45;
  let actionPercentage = 100 - dialoguePercentage;

  if (dialoguePercentage === 0 || dialoguePercentage > 90) {
    // Default fallback baseline for treatments
    dialoguePercentage = 42;
    actionPercentage = 58;
  }

  // 5. Detected Characters
  const detectedCharacters = Object.entries(characterCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const characterCount = Math.max(detectedCharacters.length, characterCues.size, 3);

  // 6. Detected Genres & Keywords
  const lowerText = cleanText.toLowerCase();
  const genreScores: Record<string, number> = {};
  const matchedKeywords: string[] = [];

  for (const [genre, keywords] of Object.entries(GENRE_DICTIONARIES)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
        if (!matchedKeywords.includes(kw) && matchedKeywords.length < 12) {
          matchedKeywords.push(kw);
        }
      }
    }
    genreScores[genre] = score;
  }

  const detectedGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .slice(0, 3)
    .map(([g]) => g);

  if (detectedGenres.length === 0) {
    detectedGenres.push('Drama', 'Thriller');
  }

  return {
    title,
    pageCount,
    estimatedRuntime,
    sceneCount,
    dialoguePercentage,
    actionPercentage,
    characterCount,
    detectedCharacters: detectedCharacters.length > 0 ? detectedCharacters : ['Lead Protagonist', 'Primary Antagonist', 'Supporting Character'],
    detectedKeywords: matchedKeywords.slice(0, 8),
    detectedGenres,
    wordCount
  };
}

/**
 * Generates qualitative script feedback using Gemini LLM (with grounded fallback).
 */
export async function generateScriptQualitativeFeedback(
  metrics: ScriptExtractionMetrics,
  rawText: string,
  aiClient: GoogleGenAI | null
): Promise<ScriptQualitativeFeedback> {
  const primaryGenre = metrics.detectedGenres[0] || 'Drama';
  const snippet = rawText.slice(0, 4000); // 4k characters context

  if (aiClient) {
    try {
      const prompt = `You are a top Hollywood script consultant and development executive. Analyze the following screenplay/treatment extract:

METRICS:
- Title: ${metrics.title}
- Primary Genres: ${metrics.detectedGenres.join(', ')}
- Page Count: ${metrics.pageCount} pages (~${metrics.estimatedRuntime} mins runtime)
- Scene Count: ${metrics.sceneCount} scenes
- Dialogue Ratio: ${metrics.dialoguePercentage}% vs Action Ratio: ${metrics.actionPercentage}%
- Speaking Characters: ${metrics.detectedCharacters.join(', ')}

EXCERPT:
"""
${snippet}
"""

Provide an honest, constructive, and highly specific script analysis in JSON format.
Follow this EXACT JSON schema:
{
  "pacingAnalysis": {
    "dialogueVsActionNote": "1-2 sentences evaluating dialogue-to-action proportion for this genre",
    "pacingVerdict": "e.g. Action-Driven Pacing / Dialogue-Centric Rhythm / Well-Balanced Theatrical Flow",
    "genreComparison": "Comparison to typical ${primaryGenre} industry norms (e.g. Action typically averages 35% dialogue / 65% action)"
  },
  "threeActStructure": {
    "act1Notes": "Specific diagnostic notes on Act 1 setup, inciting incident, and hook (approx p. 1-30)",
    "act2Notes": "Specific diagnostic notes on Act 2 confrontation, midpoint escalation, and stakes (approx p. 30-85)",
    "act3Notes": "Specific diagnostic notes on Act 3 climax, resolution, and emotional payoff (approx p. 85-115)"
  },
  "suggestions": [
    "Concrete, actionable script revision directive 1 (e.g. Act 2 midpoint reversal note)",
    "Concrete, actionable script revision directive 2 (e.g. character agency or dialogue subtext note)",
    "Concrete, actionable script revision directive 3 (e.g. opening sequence hook or pacing economy note)",
    "Concrete, actionable script revision directive 4 (e.g. thematic resolution or stakes elevation note)"
  ]
}

Return ONLY valid JSON. No markdown code fences, no extra text.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      const cleanedJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        pacingAnalysis: {
          dialogueVsActionNote: parsed.pacingAnalysis?.dialogueVsActionNote || `Dialogue represents ${metrics.dialoguePercentage}% of content, creating an active narrative rhythm.`,
          pacingVerdict: parsed.pacingAnalysis?.pacingVerdict || 'Well-Balanced Theatrical Flow',
          genreComparison: parsed.pacingAnalysis?.genreComparison || `Aligned with typical ${primaryGenre} benchmarks.`
        },
        threeActStructure: {
          act1Notes: parsed.threeActStructure?.act1Notes || 'Act 1 efficiently establishes core narrative stakes and character motivations within the opening 25 minutes.',
          act2Notes: parsed.threeActStructure?.act2Notes || 'Act 2 sustains escalation with clear obstacles, though pacing may benefit from a sharper midpoint reversal.',
          act3Notes: parsed.threeActStructure?.act3Notes || 'Act 3 brings decisive conflict resolution and emotional closure to character arcs.'
        },
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length >= 3 ? parsed.suggestions : [
          `Tighten Act 2 midpoint pacing to accelerate stakes before the climax.`,
          `Enhance subtext in secondary dialogue exchanges to deepen character relationships.`,
          `Consider front-loading the inciting incident within the first 12 pages for stronger theatrical hook.`,
          `Ensure antagonist motivations are grounded with distinct opposing philosophical conviction.`
        ],
        isAIGenerated: true,
        analyzedAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn('Gemini script analysis fallback triggered:', err);
    }
  }

  // Grounded Film-Theory Fallback
  return generateGroundedFallbackFeedback(metrics);
}

function generateGroundedFallbackFeedback(metrics: ScriptExtractionMetrics): ScriptQualitativeFeedback {
  const primaryGenre = metrics.detectedGenres[0] || 'Drama';
  const isHighAction = metrics.actionPercentage >= 55;
  const isHighDialogue = metrics.dialoguePercentage >= 55;

  let pacingVerdict = 'Balanced Theatrical Pacing';
  let dialogueNote = `Dialogue comprises ${metrics.dialoguePercentage}% and action description ${metrics.actionPercentage}% of the script.`;
  let genreComparison = `Standard ${primaryGenre} theatrical releases typically balance 40-50% dialogue with 50-60% visual action beats.`;

  if (isHighAction) {
    pacingVerdict = 'Visually Driven / High-Kinetic Pace';
    dialogueNote = `Action sequences dominate at ${metrics.actionPercentage}%, prioritizing visual momentum and kinetic pacing.`;
  } else if (isHighDialogue) {
    pacingVerdict = 'Character-Dense / Dialogue-Centric Rhythm';
    dialogueNote = `Dialogue heavy at ${metrics.dialoguePercentage}%, emphasizing character interpersonal dynamics and thematic discourse.`;
  }

  const suggestions: string[] = [];

  if (metrics.estimatedRuntime > 140) {
    suggestions.push(`Estimated runtime (~${metrics.estimatedRuntime} mins / ${metrics.pageCount} pgs) is extended for ${primaryGenre}. Consider trimming pages 45–75 to improve theatrical showtime frequency.`);
  } else if (metrics.estimatedRuntime < 90) {
    suggestions.push(`Estimated runtime (~${metrics.estimatedRuntime} mins) is compact. Expanding the Act 2 midpoint obstacle sequence could deepen character investment.`);
  } else {
    suggestions.push(`Runtime estimate of ~${metrics.estimatedRuntime} mins aligns well with theatrical programming sweet-spots.`);
  }

  if (isHighDialogue && ['Action', 'Science Fiction', 'Thriller'].includes(primaryGenre)) {
    suggestions.push(`For ${primaryGenre}, increase visual storytelling by converting key expository dialogue blocks into active cinematic set-pieces.`);
  } else if (isHighAction && ['Drama', 'Romance'].includes(primaryGenre)) {
    suggestions.push(`Expand intimate character dialogue exchanges to amplify emotional resonance in climactic scenes.`);
  } else {
    suggestions.push(`Pacing balance between dialogue (${metrics.dialoguePercentage}%) and action (${metrics.actionPercentage}%) is well-calibrated for ${primaryGenre}.`);
  }

  suggestions.push(`Ensure the central antagonist's philosophy directly challenges the protagonist's core flaw before the Act 2 crisis.`);
  suggestions.push(`Verify the opening 10 pages deliver a definitive world-building hook before introducing the primary inciting incident.`);

  return {
    pacingAnalysis: {
      dialogueVsActionNote: dialogueNote,
      pacingVerdict,
      genreComparison
    },
    threeActStructure: {
      act1Notes: `Act I (pp. 1–${Math.round(metrics.pageCount * 0.25)}): Establishes character status quo, primary genre tone, and inciting disruption.`,
      act2Notes: `Act II (pp. ${Math.round(metrics.pageCount * 0.25) + 1}–${Math.round(metrics.pageCount * 0.75)}): Escalates conflict across ${Math.round(metrics.sceneCount * 0.5)} scenes, peaking at the central midpoint reversal.`,
      act3Notes: `Act III (pp. ${Math.round(metrics.pageCount * 0.75) + 1}–${metrics.pageCount}): Drives momentum toward the climactic showdown and resolution.`
    },
    suggestions,
    isAIGenerated: false,
    analyzedAt: new Date().toISOString()
  };
}
