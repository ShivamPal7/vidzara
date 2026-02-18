import { Plan, Feature, PLAN_FEATURES } from '@/types/plans';

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
}

export interface AccessContext {
  platform?: string; // e.g. 'YouTube', 'Shorts', 'Instagram'
  // Add other context properties as needed
}

/**
 * Checks if a user on a specific plan can access a given feature.
 * optionally checking context-specific restrictions (e.g. Platform).
 */
export function checkFeatureAccess(
  plan: Plan,
  feature: Feature,
  context?: AccessContext
): FeatureAccessResult {
  const planRules = PLAN_FEATURES[plan];

  if (!planRules) {
    // Should not happen if types are correct
    return {
      allowed: false,
      reason: 'Invalid plan',
    };
  }

  const featureRule = planRules[feature];

  // 1. Check if feature is globally allowed for this plan
  if (!featureRule || !featureRule.allowed) {
    return {
      allowed: false,
      reason: `This feature is not available on the ${plan} plan.`,
      upgradeRequired: true,
    };
  }

  // 2. Check context-specific restrictions (e.g. Platform)
  if (context?.platform && featureRule.platforms) {
    if (!featureRule.platforms.includes(context.platform)) {
      return {
        allowed: false,
        reason: `${context.platform} is not supported on the ${plan} plan for this feature.`,
        upgradeRequired: true,
      };
    }
  }

  // 3. If we made it here, access is allowed
  return {
    allowed: true,
  };
}
