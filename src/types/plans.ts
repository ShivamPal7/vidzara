import { Feature } from './features';

import { Plan } from "../../prisma/generated/prisma/enums";

export { Plan, Feature };


export interface PlanMetadata {
  label: string;
  priceCheckInterval: 'monthly' | 'yearly'; // Simplified for now
}

export const PLAN_LABELS: Record<Plan, string> = {
  [Plan.FREE]: 'Free',
  [Plan.LIMITED_PRO]: 'Limited Pro',
  [Plan.UNLIMITED_PRO]: 'Unlimited Pro',
};

// Define specific constraints for features that have sub-restrictions
export type FeatureConstraint = {
  allowed: boolean;
  limit?: number; // Daily limit, etc.
  platforms?: string[]; // e.g., 'YouTube', 'Shorts', 'Instagram'
  maxDuration?: number; // e.g., 60 seconds
  advancedFeatures?: boolean; // e.g., tone slider
};

// Access Matrix
export const PLAN_FEATURES: Record<Plan, Record<Feature, FeatureConstraint>> = {
  [Plan.FREE]: {
    [Feature.VIDEO_SEO]: { allowed: true, limit: 3 }, // Example limit
    [Feature.SCRIPT_WRITER]: { allowed: true, platforms: ['Shorts', 'Instagram'] }, // No Long scripts
    [Feature.SCRIPT_SHORTENER]: { allowed: false },
    [Feature.HOOK_DETECTOR]: { allowed: false },
    [Feature.CONTENT_SAFETY]: { allowed: true, limit: 3 },
    [Feature.TOPIC_GENERATOR]: { allowed: true, limit: 3 },
    [Feature.COMPETITORS]: { allowed: true, limit: 3 },
    [Feature.CONSISTENCY_CHECKER]: { allowed: false },
    [Feature.NICHE_FINDER]: { allowed: false },
    [Feature.THUMBNAIL_CONCEPT]: { allowed: true, limit: 3 },
    [Feature.GROWTH_DASHBOARD]: { allowed: true, advancedFeatures: false }, // Basic view
  },
  [Plan.LIMITED_PRO]: {
    [Feature.VIDEO_SEO]: { allowed: true },
    [Feature.SCRIPT_WRITER]: { allowed: true, platforms: ['Shorts', 'Instagram'] }, // Shorts only
    [Feature.SCRIPT_SHORTENER]: { allowed: false },
    [Feature.HOOK_DETECTOR]: { allowed: true, platforms: ['Shorts'] }, // Shorts only
    [Feature.CONTENT_SAFETY]: { allowed: true },
    [Feature.TOPIC_GENERATOR]: { allowed: true },
    [Feature.COMPETITORS]: { allowed: true },
    [Feature.CONSISTENCY_CHECKER]: { allowed: true, limit: 5 },
    [Feature.NICHE_FINDER]: { allowed: true, limit: 5 },
    [Feature.THUMBNAIL_CONCEPT]: { allowed: true },
    [Feature.GROWTH_DASHBOARD]: { allowed: true, advancedFeatures: true }, // Full dashboard
  },
  [Plan.UNLIMITED_PRO]: {
    [Feature.VIDEO_SEO]: { allowed: true },
    [Feature.SCRIPT_WRITER]: { allowed: true, platforms: ['YouTube', 'Shorts', 'Instagram'] },
    [Feature.SCRIPT_SHORTENER]: { allowed: true },
    [Feature.HOOK_DETECTOR]: { allowed: true },
    [Feature.CONTENT_SAFETY]: { allowed: true },
    [Feature.TOPIC_GENERATOR]: { allowed: true },
    [Feature.COMPETITORS]: { allowed: true },
    [Feature.CONSISTENCY_CHECKER]: { allowed: true },
    [Feature.NICHE_FINDER]: { allowed: true },
    [Feature.THUMBNAIL_CONCEPT]: { allowed: true },
    [Feature.GROWTH_DASHBOARD]: { allowed: true, advancedFeatures: true },
  },
};
