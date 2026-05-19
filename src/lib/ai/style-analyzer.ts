import { fetchYouTubeTranscript } from "../youtube/transcript-fetcher";
import { generateObject } from "ai";
import { openrouterClient } from "./client";
import { SUPPLEMENTARY_MODELS } from "./models";
import { GeminiProvider } from "./provider";
import { z } from "zod";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VideoStyleAnalysis {
  /** Overall tone descriptor e.g. "dry-wit, conversational, authoritative" */
  toneDescription: string;
  /** Pacing style e.g. "rapid-fire", "slow build", "rhythmic punchy sentences" */
  pacingStyle: string;
  /** How the creator structures videos at a high level */
  structuralPattern: string;
  /** Signature hook techniques extracted from the transcript */
  hookTechniques: string[];
  /** Recurring vocabulary patterns, power-words, or phrases */
  phrasingPatterns: string[];
  /** Estimated avg sentence length: "short", "medium", "long" */
  sentenceRhythm: "short" | "medium" | "long";
  /** Whether they use first-person storytelling */
  usesStorytelling: boolean;
  /** Notable stylistic quirks or signature moves */
  stylisticQuirks: string[];
}

// ── Zod schema (mirrors the type above) ─────────────────────────────────────

const VideoStyleSchema = z.object({
  toneDescription: z.string(),
  pacingStyle: z.string(),
  structuralPattern: z.string(),
  hookTechniques: z.array(z.string()),
  phrasingPatterns: z.array(z.string()),
  sentenceRhythm: z.enum(["short", "medium", "long"]),
  usesStorytelling: z.boolean(),
  stylisticQuirks: z.array(z.string()),
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider selection (mirrors engine.ts strategy)
// ─────────────────────────────────────────────────────────────────────────────

const USE_GEMINI_BACKUP = process.env.AI_PROVIDER === "gemini";

// ── Core function ─────────────────────────────────────────────────────────────

export async function analyzeVideoStyle(
  youtubeUrl: string
): Promise<VideoStyleAnalysis> {
  // 1. Extract video ID
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error(
      "Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link."
    );
  }

  // 2. Fetch transcript
  let transcriptSegments: { text: string }[];
  try {
    transcriptSegments = await fetchYouTubeTranscript(videoId);
  } catch (error: any) {
    console.error("Transcript Extraction Error:", error);
    throw new Error(
      "Could not extract captions from this video. This often happens because YouTube blocks server-side requests. Try providing a proxy or paste the transcript manually."
    );
  }

  if (!transcriptSegments || transcriptSegments.length === 0) {
    throw new Error(
      "This video has no captions available. Please use a video with enabled subtitles for tone matching."
    );
  }

  // Cap at ~8 000 chars to stay within token budget
  const rawTranscript = transcriptSegments
    .map((s) => s.text)
    .join(" ")
    .slice(0, 8000);

  return analyzeTranscriptStyle(rawTranscript);
}

/**
 * Analyzes the style of a provided transcript text using an LLM.
 */
export async function analyzeTranscriptStyle(
  rawTranscript: string
): Promise<VideoStyleAnalysis> {
  // 3. Run LLM style analysis
  const analysisPrompt = buildStyleAnalysisPrompt(rawTranscript);

  if (USE_GEMINI_BACKUP) {
    // ── Gemini backup path ───────────────────────────────────────────────────
    const { data } = await GeminiProvider.generateJSON<VideoStyleAnalysis>(analysisPrompt);
    return data;
  }

  // ── OpenRouter primary path ───────────────────────────────────────────────
  const model = openrouterClient(SUPPLEMENTARY_MODELS.QuickCreate);

  const { object } = await generateObject({
    model,
    schema: VideoStyleSchema,
    prompt: analysisPrompt,
    system:
      "You are an expert in analyzing YouTube creator styles, storytelling techniques, and content tonality. Return only what is asked — no commentary.",
    temperature: 0.3,
  });

  return object;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null;
    }
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.replace("/shorts/", "").split("?")[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

function buildStyleAnalysisPrompt(transcript: string): string {
  return `Analyze the following YouTube video transcript and extract the creator's signature style.

TRANSCRIPT:
"""
${transcript}
"""

Return a structured analysis covering: tone, pacing, structural pattern, hook techniques, phrasing patterns, sentence rhythm, storytelling usage, and stylistic quirks.
Be specific and actionable — the output will instruct an LLM to write a new script in this exact style.`;
}
