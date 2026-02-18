import { Plan, Feature } from "../lib/prisma"

export const DEFAULT_DAILY_LIMIT = 1000 // Safe default for unlimited/unspecified

export const PLAN_LIMITS: Record<Plan, Record<string, number>> = {
  FREE: {
    DEFAULT: 3,
    [Feature.VIDEO_SEO]: 3,
    [Feature.SCRIPT_WRITER]: 3,
    [Feature.SCRIPT_SHORTENER]: 3,
    [Feature.HOOK_DETECTOR]: 3,
    [Feature.CONTENT_SAFETY]: 3,
    [Feature.TOPIC_GENERATOR]: 3,
    [Feature.OUTLIER_DETECTOR]: 3,
    [Feature.CONSISTENCY_CHECKER]: 3,
    [Feature.NICHE_FINDER]: 3,
    [Feature.THUMBNAIL_CONCEPT]: 3,
    [Feature.GROWTH_DASHBOARD]: 3,
  },
  LIMITED_PRO: {
    DEFAULT: 50,
    [Feature.VIDEO_SEO]: 50,
    [Feature.SCRIPT_WRITER]: 50,
    [Feature.SCRIPT_SHORTENER]: 50,
    [Feature.HOOK_DETECTOR]: 50,
    [Feature.CONTENT_SAFETY]: 50,
    [Feature.TOPIC_GENERATOR]: 50,
    [Feature.OUTLIER_DETECTOR]: 50,
    [Feature.CONSISTENCY_CHECKER]: 50,
    [Feature.NICHE_FINDER]: 50,
    [Feature.THUMBNAIL_CONCEPT]: 50,
    [Feature.GROWTH_DASHBOARD]: 50,
  },
  UNLIMITED_PRO: {
    DEFAULT: 10000, // Effectively unlimited
  }
}

export function getPlanLimit(plan: Plan, feature?: Feature): number {
  const planConfig = PLAN_LIMITS[plan]
  if (!planConfig) return 0 // Should not happen
  
  if (feature && planConfig[feature] !== undefined) {
    return planConfig[feature]
  }
  
  return planConfig.DEFAULT
}
