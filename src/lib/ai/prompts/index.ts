import { Feature } from "../../../../prisma/generated/prisma/enums";
import { VideoSEOPrompt } from "./video-seo";
import { ScriptWriterPrompt } from "./script-writer";
import { ThumbnailConceptPrompt } from "./thumbnail";
import { ContentSafetyPrompt } from "./content-safety";

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
  [Feature.SCRIPT_SHORTENER]: {
    name: "Script Shortener",
    feature: 'SCRIPT_SHORTENER',
    description: "Shorten scripts",
    generatePrompt: () => "Placeholder prompt",
  },
  [Feature.HOOK_DETECTOR]: {
    name: "Hook Detector",
    feature: 'HOOK_DETECTOR',
    description: "Analyze hooks",
    generatePrompt: () => "Placeholder prompt",
  },
  [Feature.CONTENT_SAFETY]: ContentSafetyPrompt,
  [Feature.TOPIC_GENERATOR]: {
    name: "Topic Generator",
    feature: 'TOPIC_GENERATOR',
    description: "Generate topics",
    generatePrompt: () => "Placeholder prompt",
  },
  [Feature.OUTLIER_DETECTOR]: {
    name: "Outlier Detector",
    feature: 'OUTLIER_DETECTOR',
    description: "Detect outliers",
    generatePrompt: () => "Placeholder prompt",
  },
  [Feature.CONSISTENCY_CHECKER]: {
    name: "Consistency Checker",
    feature: 'CONSISTENCY_CHECKER',
    description: "Check consistency",
    generatePrompt: () => "Placeholder prompt",
  },
  [Feature.NICHE_FINDER]: {
    name: "Niche Finder",
    feature: 'NICHE_FINDER',
    description: "Find niches",
    generatePrompt: () => "Placeholder prompt",
  },
  [Feature.THUMBNAIL_CONCEPT]: ThumbnailConceptPrompt,
  [Feature.GROWTH_DASHBOARD]: {
    name: "Growth Dashboard",
    feature: 'GROWTH_DASHBOARD',
    description: "Growth analysis",
    generatePrompt: () => "Placeholder prompt",
  },
};
