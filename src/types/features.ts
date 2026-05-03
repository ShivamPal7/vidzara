import { Feature } from "../../prisma/generated/prisma/enums";

export { Feature };

export interface FeatureMetadata {
  label: string;
  description: string;
  route: string;
}

export const FEATURES: Record<Feature, FeatureMetadata> = {
  [Feature.VIDEO_SEO]: {
    label: 'Video SEO Generator',
    description: 'Generate optimized titles, descriptions, and tags for your videos.',
    route: '/dashboard/create/video-seo',
  },
  [Feature.SCRIPT_WRITER]: {
    label: 'Script Writer',
    description: 'Create engaging scripts for YouTube, Shorts, and Instagram.',
    route: '/dashboard/create/script-writer',
  },
  [Feature.SCRIPT_SHORTENER]: {
    label: 'Script Shortener',
    description: 'Turn long-form scripts into punchy short-form content.',
    route: '/dashboard/optimize/script-shortener',
  },
  [Feature.HOOK_DETECTOR]: {
    label: 'Hook Failure Detector',
    description: 'Analyze your video hooks and get suggestions for improvement.',
    route: '/dashboard/optimize/hook-detector',
  },
  [Feature.CONTENT_SAFETY]: {
    label: 'Content Safety Checker',
    description: 'Ensure your content is safe and follows platform guidelines.',
    route: '/dashboard/optimize/content-safety',
  },
  [Feature.TOPIC_GENERATOR]: {
    label: 'Topic Generator',
    description: 'Find viral topic ideas based on competitor analysis.',
    route: '/dashboard/analyze/topic-generator',
  },
  [Feature.COMPETITORS]: {
    label: 'Competitors',
    description: 'Identify high-performing competitors in your niche.',
    route: '/dashboard/analyze/competitors',
  },
  [Feature.CONSISTENCY_CHECKER]: {
    label: 'Consistency Checker',
    description: 'Track your posting schedule and improve consistency.',
    route: '/dashboard/analyze/consistency-checker',
  },
  [Feature.NICHE_FINDER]: {
    label: 'Niche Finder',
    description: 'Discover profitable niches tailored to your interests.',
    route: '/dashboard/analyze/niche-finder',
  },
  [Feature.THUMBNAIL_CONCEPT]: {
    label: 'Thumbnail Concept',
    description: 'Generate creative concepts for high-CTR thumbnails.',
    route: '/dashboard/create/thumbnail',
  },
  [Feature.GROWTH_DASHBOARD]: {
    label: 'Growth Dashboard',
    description: 'Track your channel growth and get actionable insights.',
    route: '/dashboard/growth',
  },
};
