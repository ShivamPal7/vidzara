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
      textIdea: z.string().describe("Engaging short click-optimized text on the thumbnail (max 4 words)"),
      emotion: z.string().describe("Suggested facial expression or emotion"),
      layout: z.string().describe("Detailed description of composition layout"),
      colors: z.array(z.string()).describe("Suggested high-contrast hex color codes"),
      imagePrompt: z.string().optional().describe("A highly detailed AI image generator prompt for Midjourney/Stable Diffusion (if enabled)"),
    })),
  }),
  
  [Feature.HOOK_DETECTOR]: z.object({
    status: z.enum(["WEAK", "AVERAGE", "STRONG"]).describe("Grade classification of the hook strength"),
    explanation: z.string().describe("A professional explanation of the strength/weakness of the current hook"),
    suggestions: z.array(
      z.object({
        rewrite: z.string().describe("The rewritten hook text optimized for maximum engagement"),
        reason: z.string().describe("Explanation of why this specific rewrite is effective"),
      })
    ).length(3).describe("Exactly 3 rewritten, highly optimized hook suggestions"),
  }),
  
  [Feature.SCRIPT_SHORTENER]: z.object({
    shorts: z.array(z.object({
      title: z.string().describe("Catchy internal title for the short"),
      hook: z.string().describe("Punchy, attention grabbing opening (first 3 seconds)"),
      body: z.string().describe("Core value or story content"),
      cta: z.string().describe("Quick natural call to action"),
      visuals: z.string().describe("Brief suggestion for visual composition/b-roll"),
    })),
  }),
  
  [Feature.CONTENT_SAFETY]: z.object({
    score: z.number().min(0).max(100).describe("Overall safety score from 0 (very risky) to 100 (perfectly safe)"),
    summary: z.string().describe("A professional 1-2 sentence summary of the safety analysis"),
    highlights: z.array(
      z.object({
        text: z.string().describe("The exact risky phrase or segment from the input text"),
        type: z.enum(["clickbait", "policy", "algorithm"]).describe("The category classification of the issue"),
        reason: z.string().describe("A professional explanation of why this phrase is risky"),
      })
    ).describe("List of policy issues, clickbait phrasing, or algorithmic risks found in the text"),
    suggestions: z.array(
      z.object({
        original: z.string().describe("The original risky phrase/segment"),
        rewrite: z.string().describe("A safe, optimized rewrite that preserves intent"),
        reason: z.string().describe("Explanation of why the rewrite is safer or better"),
      })
    ).describe("List of safe, compliant suggested rewrites for flagged issues"),
  }),
  
  [Feature.TOPIC_GENERATOR]: z.object({
    topContentAnalysis: z.string().describe("A 2-3 sentence analysis of what formats or topics are currently working for this channel based on their outliers."),
    improvements: z.array(z.string()).describe("List of specific, actionable improvements"),
    viralIdeas: z.array(z.object({
      title: z.string().describe("A highly clickable, optimized title for the idea"),
      topic: z.string().describe("The general topic category"),
      reason: z.string().describe("Why this specific idea will perform well"),
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
