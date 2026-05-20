import { z } from "zod";
import { Feature } from "../../../prisma/generated/prisma/enums";

/**
 * Centralized Zod response validation schemas per API feature tool.
 * Ensures strict runtime object alignment from AI generation backends.
 */
export const FEATURE_SCHEMAS: Record<Feature, z.ZodSchema<any> | undefined> = {
  [Feature.SCRIPT_WRITER]: z.object({
    title: z.string().describe("Highly engaging clickable YouTube title"),
    content: z.string().describe("Rich script content formatted with semantic HTML tags like <h3> and <p>"),
    refinementSuggestions: z.array(z.string()).length(3).describe("3 short follow-up prompts the user can send to edit this script's TEXT. Write them as direct commands, under 6 words each. Examples: 'Make the hook shorter', 'Add a cliffhanger ending', 'Use simpler words', 'Make it more dramatic'. DO NOT suggest visuals, audio, pacing, or production directions. ONLY text edits."),
  }),
  
  [Feature.VIDEO_SEO]: z.object({
    titles: z.array(z.string()).describe("5 highly engaging, high-CTR optimized titles"),
    description: z.string().describe("SEO optimized description with keyword rich intro and timestamps structure"),
    tags: z.array(z.string()).describe("Targeted keyword tags list"),
  }),
  
  [Feature.THUMBNAIL_CONCEPT]: z.object({
    concepts: z.array(z.object({
      title: z.string(),
      visualDescription: z.string(),
      colorPsychology: z.string(),
      textOverlay: z.string(),
    })).length(3),
  }),
  
  [Feature.HOOK_DETECTOR]: z.object({
    rating: z.enum(["weak", "average", "strong"]),
    analysis: z.string(),
    improvedHooks: z.array(z.string()).length(3),
  }),
  
  [Feature.SCRIPT_SHORTENER]: z.object({
    shortenedScript: z.string(),
    originalWordCount: z.number(),
    newWordCount: z.number(),
    retentionScore: z.number().min(1).max(10),
  }),
  
  [Feature.CONTENT_SAFETY]: z.object({
    isSafe: z.boolean(),
    flaggedCategories: z.array(z.string()),
    confidenceScore: z.number(),
    reasoning: z.string(),
  }),
  
  [Feature.TOPIC_GENERATOR]: z.object({
    topics: z.array(z.object({
      title: z.string(),
      angle: z.string(),
      targetAudience: z.string(),
      viralPotential: z.enum(["High", "Very High", "Extreme"]),
    })).min(3),
  }),
  
  [Feature.COMPETITORS]: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    contentGaps: z.array(z.string()),
    recommendedStrategy: z.string(),
  }),
  
  [Feature.CONSISTENCY_CHECKER]: z.object({
    score: z.number().min(0).max(100).describe("Overall consistency score reflecting posting regularity and brand alignment"),
    isConsistent: z.boolean().describe("Whether the channel meets acceptable consistency standards"),
    postingFrequency: z.string().describe("Human readable posting frequency summary, e.g. '1 video every 3 days' or 'Irregular posting schedule'"),
    deviations: z.array(z.string()).describe("Specific brand, content format, or scheduling deviations"),
    improvementPlan: z.array(z.string()).describe("Actionable list of steps to optimize posting consistency and brand alignment"),
    growthDirection: z.enum(["up", "flat", "down"]).describe("Algorithmic growth velocity based on recent trends"),
    continueDoing: z.array(z.string()).describe("Strong elements that are aligned with the brand and driving engagement"),
    stopDoing: z.array(z.string()).describe("Ineffective elements, topical drifts, or bad habits to stop"),
  }),
  
  [Feature.NICHE_FINDER]: z.object({
    niches: z.array(z.object({
      name: z.string(),
      competitionLevel: z.enum(["Low", "Medium", "High"]),
      viralScore: z.number().min(1).max(100),
      revenueScore: z.number().min(1).max(100),
      competitionScore: z.number().min(1).max(100),
      monetizationPotential: z.string(),
      contentStrategy: z.string(),
    })),
  }),
  
  [Feature.GROWTH_DASHBOARD]: z.object({
    summary: z.string(),
    actionItems: z.array(z.string()),
    projectedGrowth: z.string(),
  }),
};
