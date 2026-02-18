import { Plan, Feature } from "@prisma/client"

export const DEFAULT_DAILY_LIMIT = 1000 // Safe default for unlimited/unspecified

export const PLAN_LIMITS: Record<Plan, Record<string, number>> = {
  FREE: {
    DEFAULT: 3, // 3 generations per feature per day for Free plan
    "VIDEO_SEO": 3,
    "THUMBNAIL_CONCEPT": 3,
    "CONTENT_SAFETY": 3,
    "TOPIC_GENERATOR": 3,
    "OUTLIER_DETECTOR": 3,
    // Blocked features handled by PlanGuard, but if allowed, limit applies
  },
  LIMITED_PRO: {
    DEFAULT: 50,
    "CONSISTENCY_CHECKER": 5,
    "NICHE_FINDER": 5,
  },
  UNLIMITED_PRO: {
    DEFAULT: 10000, // Effectively unlimited
  }
}

export function getPlanLimit(plan: Plan, feature?: string): number {
  const planConfig = PLAN_LIMITS[plan]
  if (!planConfig) return 0 // Should not happen
  
  if (feature && planConfig[feature]) {
    return planConfig[feature]
  }
  
  return planConfig.DEFAULT
}
