import { Feature } from "../../../../prisma/generated/prisma/enums";
import { VideoSEOPrompt } from "./video-seo";
import { ScriptWriterPrompt } from "./script-writer";
import { ThumbnailConceptPrompt } from "./thumbnail";
import { ContentSafetyPrompt } from "./content-safety";
import { TopicGeneratorPrompt } from "./topic-generator";
import { ScriptShortenerPrompt } from "./script-shortener";
import { HookDetectorPrompt } from "./hook-detector";
import { NicheFinderPrompt } from "./niche-finder";

export interface PromptTemplate {
  name: string;
  feature: Feature;
  description: string;
  generatePrompt: (input: any, context?: any) => string;
}

export const PROMPTS: Record<Feature, PromptTemplate> = {
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
    description: "Check consistency",
    generatePrompt: () => "Placeholder prompt",
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
