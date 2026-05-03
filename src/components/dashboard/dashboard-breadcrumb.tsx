"use client"

import { usePathname } from "next/navigation"

// Map route segments to display names
const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  create: "Create",
  optimize: "Optimize",
  analyze: "Analyze",
  "video-seo": "Video SEO",
  "script-writer": "Script Writer",
  thumbnail: "Thumbnail Concepts",
  "script-shortener": "Script Shortener",
  "hook-detector": "Hook Detector",
  "content-safety": "Content Safety",
  "topic-generator": "Topic Generator",
  "competitors": "Competitors",
  "niche-finder": "Niche Finder",
  "consistency-checker": "Consistency Checker",
  growth: "Growth",
  history: "History",
  billing: "Billing",
  affiliate: "Affiliate",
  settings: "Settings",
  new: "New Chat",
}

function getLabel(segment: string): string {
  return segmentLabels[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function PageTitle() {
  const pathname = usePathname()

  // Split and filter out empty segments and route groups like (protected)
  const segments = pathname
    .split("/")
    .filter((s) => s && !s.startsWith("("))

  // Walk backwards to find the last segment that has a known label
  let title = "Dashboard"
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segmentLabels[segments[i]]) {
      title = segmentLabels[segments[i]]
      break
    }
  }

  return (
    <h1 className="text-base font-semibold truncate">
      {title}
    </h1>
  )
}
