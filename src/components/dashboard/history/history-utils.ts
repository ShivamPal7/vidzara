import { Feature } from "../../../../prisma/generated/prisma/enums";

export function safeJsonParse(val: any): any {
  if (!val) return {};
  if (typeof val === "object") return val;
  if (typeof val !== "string") return {};

  let cleaned = val.trim();
  
  if (cleaned.includes("```")) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      cleaned = match[1].trim();
    } else {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
      cleaned = cleaned.replace(/\s*```$/i, "");
    }
  }
  
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      const aggressiveClean = cleaned
        .replace(/,\s*([\]}])/g, "$1")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      return JSON.parse(aggressiveClean);
    } catch (innerError) {
      console.error("[safeJsonParse] Failed parsing JSON string:", val, innerError);
      return {};
    }
  }
}

export function getGenerationDisplayData(feature: Feature, output: any): { heading: string; description: string; href: string } {
  let heading = "Generation";
  let description = "View details";
  let href = "/dashboard"; // Default fallback

  // Safely parse output if it's a stringified JSON
  const data = safeJsonParse(output);

  switch (feature) {
    case Feature.SCRIPT_WRITER:
      heading = data.title || "Script Writer";
      description = data.content ? truncate(data.content, 100) : "Script generated successfully.";
      href = "/dashboard/create/script-writer";
      break;
    case Feature.VIDEO_SEO:
      heading = data.titles && data.titles.length > 0 ? data.titles[0] : "Video SEO Generation";
      description = data.description ? truncate(data.description, 100) : "SEO details generated.";
      href = "/dashboard/create/video-seo";
      break;
    case Feature.THUMBNAIL_CONCEPT:
      heading = data.concepts && data.concepts.length > 0 ? data.concepts[0].title : "Thumbnail Concepts";
      description = data.concepts && data.concepts.length > 0 ? truncate(data.concepts[0].visualDescription, 100) : "Visual concepts generated.";
      href = "/dashboard/create/thumbnail";
      break;
    case Feature.HOOK_DETECTOR:
      heading = "Hook Analysis";
      description = data.analysis ? truncate(data.analysis, 100) : "Analysis complete.";
      href = "/dashboard/optimize/hook-detector";
      break;
    case Feature.SCRIPT_SHORTENER:
      heading = "Script Shortener";
      description = data.shortenedScript ? truncate(data.shortenedScript, 100) : "Script shortened.";
      href = "/dashboard/optimize/script-shortener";
      break;
    case Feature.CONTENT_SAFETY:
      heading = "Content Safety Check";
      description = data.reasoning ? truncate(data.reasoning, 100) : "Safety check complete.";
      href = "/dashboard/optimize/content-safety";
      break;
    case Feature.TOPIC_GENERATOR:
      heading = data.topics && data.topics.length > 0 ? data.topics[0].title : "Topic Generator";
      description = data.topics && data.topics.length > 0 ? data.topics[0].angle : "Topics generated.";
      href = "/dashboard/analyze/topic-generator";
      break;
    case Feature.COMPETITORS:
      heading = "Competitor Analysis";
      description = data.recommendedStrategy ? truncate(data.recommendedStrategy, 100) : "Analysis complete.";
      href = "/dashboard/analyze/competitors";
      break;
    case Feature.CONSISTENCY_CHECKER:
      heading = "Consistency Checker";
      description = data.postingFrequency ? data.postingFrequency : "Consistency analyzed.";
      href = "/dashboard/analyze/consistency-checker";
      break;
    case Feature.NICHE_FINDER:
      heading = data.niches && data.niches.length > 0 ? data.niches[0].name : "Niche Finder";
      description = data.niches && data.niches.length > 0 ? truncate(data.niches[0].contentStrategy, 100) : "Niches analyzed.";
      href = "/dashboard/analyze/niche-finder";
      break;
    case Feature.GROWTH_DASHBOARD:
      heading = "Growth Dashboard";
      description = data.summary ? truncate(data.summary, 100) : "Growth dashboard generated.";
      href = "/dashboard/growth"; // Assuming growth dashboard route
      break;
    default:
      heading = String(feature).replace(/_/g, " ");
      break;
  }

  return { heading, description, href };
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(str: string, length: number) {
  if (!str) return "";
  const clean = stripHtml(str);
  if (clean.length <= length) return clean;
  return clean.substring(0, length).trim() + "...";
}

export function formatFeatureName(feature: Feature): string {
  return feature
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

import { 
  IconSparkles, 
  IconScript, 
  IconSearch, 
  IconPhoto, 
  IconScissors, 
  IconShieldCheck, 
  IconBulb, 
  IconUsers, 
  IconCalendarStats, 
  IconTarget, 
  IconChartBar 
} from "@tabler/icons-react";

export function getFeatureIcon(feature: Feature) {
  switch (feature) {
    case Feature.SCRIPT_WRITER: return IconScript;
    case Feature.VIDEO_SEO: return IconSearch;
    case Feature.THUMBNAIL_CONCEPT: return IconPhoto;
    case Feature.HOOK_DETECTOR: return IconSparkles;
    case Feature.SCRIPT_SHORTENER: return IconScissors;
    case Feature.CONTENT_SAFETY: return IconShieldCheck;
    case Feature.TOPIC_GENERATOR: return IconBulb;
    case Feature.COMPETITORS: return IconUsers;
    case Feature.CONSISTENCY_CHECKER: return IconCalendarStats;
    case Feature.NICHE_FINDER: return IconTarget;
    case Feature.GROWTH_DASHBOARD: return IconChartBar;
    default: return IconSparkles;
  }
}

