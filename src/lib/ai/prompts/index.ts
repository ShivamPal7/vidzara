import { Feature } from "../../../../prisma/generated/prisma/enums";
import { VideoSEOPrompt } from "./video-seo";
import { ScriptWriterPrompt } from "./script-writer";
import { ThumbnailConceptPrompt } from "./thumbnail";
import { ContentSafetyPrompt } from "./content-safety";
import { TopicGeneratorPrompt } from "./topic-generator";
import { ScriptShortenerPrompt } from "./script-shortener";
import { HookDetectorPrompt } from "./hook-detector";
import { NicheFinderPrompt } from "./niche-finder";
// ConsistencyCheckerPrompt removed — feature now uses pure YouTube API math, no AI.

export interface PromptTemplate {
  name: string;
  feature: Feature;
  description: string;
  generatePrompt: (input: any, context?: any) => string;
}

const rawPrompts: Record<Feature, PromptTemplate> = {
  // To be populated with specific feature prompts
  [Feature.VIDEO_SEO]: VideoSEOPrompt,
  [Feature.SCRIPT_WRITER]: ScriptWriterPrompt,
  [Feature.SCRIPT_SHORTENER]: ScriptShortenerPrompt,
  [Feature.HOOK_DETECTOR]: HookDetectorPrompt,
  [Feature.CONTENT_SAFETY]: ContentSafetyPrompt,
  [Feature.TOPIC_GENERATOR]: TopicGeneratorPrompt,
  [Feature.COMPETITORS]: {
    name: "Competitors",
    feature: 'COMPETITORS',
    description: "Analyze competitors",
    generatePrompt: () => "Placeholder prompt",
  },
  [Feature.CONSISTENCY_CHECKER]: {
    name: "Consistency Checker",
    feature: 'CONSISTENCY_CHECKER',
    description: "No AI — uses pure YouTube API stats",
    generatePrompt: () => "",
  },
  [Feature.NICHE_FINDER]: NicheFinderPrompt,
  [Feature.THUMBNAIL_CONCEPT]: ThumbnailConceptPrompt,
  [Feature.GROWTH_DASHBOARD]: {
    name: "Growth Dashboard",
    feature: 'GROWTH_DASHBOARD',
    description: "Growth analysis",
    generatePrompt: () => "Placeholder prompt",
  },
};

export const PROMPTS = Object.fromEntries(
  Object.entries(rawPrompts).map(([key, template]) => [
    key,
    {
      ...template,
      generatePrompt: (input: any, context?: any) => {
        const base = template.generatePrompt(input, context);
        if (!base) return "";
        const currentYear = new Date().getFullYear();
        return `${base}

CRITICAL SYSTEM DIRECTIVE (CURRENT YEAR):
- The current year is ${currentYear}.
- If you generate any video titles, scripts, outlines, metadata descriptions, tags, or recommendations that reference the present/current year, you MUST use "${currentYear}". Do NOT use "2024" or "2025".
- Only mention previous years (like 2024 or 2025) if explicitly describing historical comparisons or past events.
`;
      }
    }
  ])
) as Record<Feature, PromptTemplate>;
