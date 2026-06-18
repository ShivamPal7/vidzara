import { Feature } from "../../prisma/generated/prisma/enums";

export interface CreditCostContext {
  duration?: string | number; // For script writer: 1, 2, 3 (shorts), or 5, 10, 15, 20, 30 (long)
  format?: "short" | "long" | string; // For script writer
  count?: number; // For script shortener (number of shorts)
  options?: {
    title?: boolean;
    description?: boolean;
    tags?: boolean;
    hashtags?: boolean;
  }; // For video SEO
  wordCount?: number;
  channelsCount?: number;
  isOwnChannel?: boolean;
}

/**
 * Centralized Credits Configuration for Vidzara.
 * Maps each Feature type to a fixed credit cost (excluding Feature.SCRIPT_WRITER and Feature.SCRIPT_SHORTENER).
 */
export const FEATURE_CREDIT_COSTS: Record<Exclude<Feature, "SCRIPT_WRITER" | "SCRIPT_SHORTENER">, number> = {
  [Feature.VIDEO_SEO]: 5,
  [Feature.HOOK_DETECTOR]: 2,         // Fixed 2 credits (removed long/short concept)
  [Feature.CONTENT_SAFETY]: 5,        // Fixed 5 credits (removed long/short concept)
  [Feature.TOPIC_GENERATOR]: 2,       // Fixed 2 credits (removed competitor-count scaling)
  [Feature.COMPETITORS]: 5,          // Fixed 5 credits
  [Feature.THUMBNAIL_CONCEPT]: 5,     // Fixed 5 credits
  [Feature.NICHE_FINDER]: 10,         // Fixed 10 credits
  [Feature.CONSISTENCY_CHECKER]: 2,   // Fixed 2 credits
  [Feature.GROWTH_DASHBOARD]: 0,      // Free
  [Feature.CHAT]: 1,                  // 1 credit per message
};

// Unit cost for Script Shortener (per short generated)
export const SCRIPT_SHORTENER_UNIT_COST = 2;

/**
 * Main credit cost lookup function.
 */
export function getCreditCost(feature: Feature, context?: CreditCostContext): number {
  switch (feature) {
    case Feature.SCRIPT_WRITER: {
      const format = context?.format || "youtube";
      const durationVal = parseFloat(String(context?.duration || "10"));
      const isShort = format === "short" || format === "insta" || format === "instagram" || format === "tiktok" || durationVal <= 3;
      
      if (isShort) {
        return 3; // Minimum 3 credits
      } else {
        if (durationVal <= 5) return 3; // Minimum 3 credits
        if (durationVal <= 10) return 5;
        if (durationVal <= 20) return 10;
        if (durationVal <= 30) return 15;
        return 30;
      }
    }
    
    case Feature.SCRIPT_SHORTENER: {
      const count = context?.count || 1;
      return count * SCRIPT_SHORTENER_UNIT_COST; // 2 credits per short
    }
    
    default:
      // Return fixed credit cost from the centralized config mapping
      return FEATURE_CREDIT_COSTS[feature as Exclude<Feature, "SCRIPT_WRITER" | "SCRIPT_SHORTENER">] ?? 0;
  }
}
