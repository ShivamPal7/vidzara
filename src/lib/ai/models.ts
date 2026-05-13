import { Feature } from "../../../prisma/generated/prisma/enums";
import * as SystemPrompts from "./system-prompts";

/**
 * Supported OpenRouter model identifiers.
 */
export type OpenRouterModel =
  | "google/gemini-2.5-flash"
  | "google/gemini-2.5-pro"
  | "anthropic/claude-4.5-sonnet"
  | "deepseek/deepseek-v4-pro"
  | "deepseek/deepseek-v4"
  | "moonshotai/kimi-k2.6"
  | "openai/gpt-4o"
  | "google/gemini-2.0-flash-exp"
  | "google/gemini-2.0-flash-lite-preview-02-05:free";

export interface FeatureRoutingConfig {
  /**
   * Primary targeted models for execution. Index 0 is primary, remaining act as automatic fallbacks.
   */
  models: OpenRouterModel[];
  temperature: number;
  systemPrompt?: string;
}

/**
 * Centralized Model Selection Engine.
 * ─────────────────────────────────────────────────────────────────────────────
 * To change models for any feature, update the `models` array below.
 * Index 0 = primary model. Any additional entries = automatic server-side fallbacks.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const FEATURE_MODELS: Record<Feature, FeatureRoutingConfig> = {

  // ── Script Writer → Claude Sonnet 4.5 ────────────────────────────────────
  [Feature.SCRIPT_WRITER]: {
    models: ["anthropic/claude-4.5-sonnet"],
    temperature: 0.72,
    systemPrompt: SystemPrompts.SCRIPT_WRITER_SYSTEM,
  },

  // ── Video SEO Generator → DeepSeek V4 Pro ────────────────────────────────
  [Feature.VIDEO_SEO]: {
    models: ["deepseek/deepseek-v4-pro"],
    temperature: 0.38,
    systemPrompt: SystemPrompts.VIDEO_SEO_SYSTEM,
  },

  // ── Topic Generator → Gemini 2.5 Flash + DeepSeek V4 ────────────────────
  [Feature.TOPIC_GENERATOR]: {
    models: ["google/gemini-2.5-flash", "deepseek/deepseek-v4"],
    temperature: 0.82,
    systemPrompt: SystemPrompts.TOPIC_GENERATOR_SYSTEM,
  },

  // ── Thumbnail Concepts → Claude Sonnet 4.5 ───────────────────────────────
  [Feature.THUMBNAIL_CONCEPT]: {
    models: ["anthropic/claude-4.5-sonnet"],
    temperature: 0.65,
    systemPrompt: SystemPrompts.THUMBNAIL_CONCEPT_SYSTEM,
  },

  // ── Script Shortener → Kimi K2.6 ─────────────────────────────────────────
  [Feature.SCRIPT_SHORTENER]: {
    models: ["moonshotai/kimi-k2.6"],
    temperature: 0.52,
    systemPrompt: SystemPrompts.SCRIPT_SHORTENER_SYSTEM,
  },

  // ── Hook Detector → Claude Sonnet 4.5 ────────────────────────────────────
  [Feature.HOOK_DETECTOR]: {
    models: ["anthropic/claude-4.5-sonnet"],
    temperature: 0.48,
    systemPrompt: SystemPrompts.HOOK_DETECTOR_SYSTEM,
  },

  // ── Content Safety → Gemini 2.5 Pro ──────────────────────────────────────
  [Feature.CONTENT_SAFETY]: {
    models: ["google/gemini-2.5-pro"],
    temperature: 0.08,
    systemPrompt: SystemPrompts.CONTENT_SAFETY_SYSTEM,
  },

  // ── Competitors Analysis → Gemini 2.5 Pro ────────────────────────────────
  [Feature.COMPETITORS]: {
    models: ["google/gemini-2.5-pro"],
    temperature: 0.45,
    systemPrompt: SystemPrompts.COMPETITORS_SYSTEM,
  },

  // ── Niche Finder → Claude Sonnet 4.5 ─────────────────────────────────────
  [Feature.NICHE_FINDER]: {
    models: ["anthropic/claude-4.5-sonnet"],
    temperature: 0.72,
    systemPrompt: SystemPrompts.NICHE_FINDER_SYSTEM,
  },

  // ── Consistency Checker → Gemini 2.5 Flash ───────────────────────────────
  [Feature.CONSISTENCY_CHECKER]: {
    models: ["google/gemini-2.5-flash"],
    temperature: 0.28,
    systemPrompt: SystemPrompts.CONSISTENCY_CHECKER_SYSTEM,
  },

  // ── Growth Dashboard → GPT-4o ─────────────────────────────────────────────
  [Feature.GROWTH_DASHBOARD]: {
    models: ["openai/gpt-4o"],
    temperature: 0.42,
    systemPrompt: SystemPrompts.GROWTH_DASHBOARD_SYSTEM,
  },
};

/**
 * Supplementary model mappings for features not yet in the Prisma Feature enum.
 */
export const SUPPLEMENTARY_MODELS = {
  QuickCreate: "google/gemini-2.5-flash" as OpenRouterModel,
};
