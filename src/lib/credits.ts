import { Feature } from "../../prisma/generated/prisma/enums";

export interface CreditCostContext {
  duration?: string | number; // For script writer: 1, 2, 3 (shorts), or 5, 10, 15, 20, 30 (long)
  format?: "short" | "long" | string; // For script writer / hook detector / content safety
  count?: number; // For script shortener (number of shorts) / topic generator (number of channels)
  options?: {
    title?: boolean;
    description?: boolean;
    tags?: boolean;
    hashtags?: boolean;
  }; // For video SEO
  wordCount?: number; // For content safety check
  channelsCount?: number; // For topic generator
  isOwnChannel?: boolean; // For growth dashboard
}

export function getCreditCost(feature: Feature, context?: CreditCostContext): number {
  switch (feature) {
    case Feature.SCRIPT_WRITER: {
      const format = context?.format || "long";
      const durationVal = parseFloat(String(context?.duration || "10"));
      
      if (format === "short" || durationVal <= 3) {
        // Shorts / Reels Scripts
        if (durationVal <= 1) return 1;
        if (durationVal <= 2) return 2;
        return 3;
      } else {
        // Long Form Scripts
        if (durationVal <= 5) return 3; // custom mapping for 5 mins
        if (durationVal <= 10) return 5;
        if (durationVal <= 20) return 10;
        if (durationVal <= 30) return 15;
        return 30; // 60 mins or above
      }
    }
    
    case Feature.SCRIPT_SHORTENER: {
      const count = context?.count || 1;
      return count * 2; // 1 short generated -> 2 credits
    }
    
    case Feature.VIDEO_SEO: {
      // If options are specified, calculate based on selected parts
      if (context?.options) {
        const { title, description, tags, hashtags } = context.options;
        // If all are selected, full package = 5 credits
        if (title && description && tags && hashtags) {
          return 5;
        }
        let cost = 0;
        if (title) cost += 1;
        if (description) cost += 2;
        if (tags) cost += 1;
        if (hashtags) cost += 1;
        return cost || 5; // default to 5 if none selected or if it's full SEO
      }
      return 5; // default full SEO package = 5 credits
    }
    
    case Feature.HOOK_DETECTOR: {
      const format = context?.format || "short";
      return format === "long" ? 5 : 2; // Reels/Shorts hook = 2 credits, Long-form hook = 5 credits
    }
    
    case Feature.CONTENT_SAFETY: {
      const format = context?.format || "short";
      return format === "long" ? 10 : 2; // Shorts/Reels = 2 credits, Long-form = 10 credits
    }
    
    case Feature.TOPIC_GENERATOR: {
      const count = context?.channelsCount || context?.count || 1;
      return count > 1 ? 10 : 2; // 1 channel analysis = 2 credits, 2-5 channels = 10 credits
    }
    
    case Feature.COMPETITORS: {
      return 5; // 1 competitor analysis = 5 credits
    }
    
    case Feature.THUMBNAIL_CONCEPT: {
      return 5; // 1 concept generation = 5 credits
    }
    
    case Feature.GROWTH_DASHBOARD: {
      // Own channel is free
      if (context?.isOwnChannel) return 0;
      return 0; // Growth dashboard is currently free!
    }
    
    case Feature.NICHE_FINDER: {
      return 10; // 1 niche analysis = 10 credits
    }
    
    case Feature.CONSISTENCY_CHECKER: {
      return 2; // 1 channel consistency check = 2 credits
    }
    
    default:
      return 0;
  }
}
