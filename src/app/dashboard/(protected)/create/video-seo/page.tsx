"use client";

import { VideoSeoHeader } from "@/components/dashboard/video-seo/video-seo-header";
import { VideoSeoSearchBar } from "@/components/dashboard/video-seo/video-seo-search-bar";
import { VideoSeoTabs } from "@/components/dashboard/video-seo/video-seo-tabs";
import type { Video } from "@/components/dashboard/video-seo/types";

// ── Mock data ──────────────────────────────────────────────────────────
const MOCK_VIDEOS: Video[] = [
  {
    id: "1",
    title: "What Is RESISTANCE Holding Me Back From Success?",
    createdAt: "2025-02-18",
    isFavorite: false,
  },
  {
    id: "2",
    title: "10 YouTube SEO Tips to Rank #1 in 2025",
    createdAt: "2025-02-17",
    isFavorite: true,
  },
  {
    id: "3",
    title: "How I Gained 10K Subscribers in 30 Days — Full Breakdown",
    createdAt: "2025-02-15",
    isFavorite: false,
  },
  {
    id: "4",
    title: "The Perfect Video Script Formula (Works Every Time)",
    createdAt: "2025-02-14",
    isFavorite: true,
  },
  {
    id: "5",
    title: "Why Most YouTubers Fail — And How to Avoid It",
    createdAt: "2025-02-12",
    isFavorite: false,
  },
];

// ── Page ───────────────────────────────────────────────────────────────
export default function VideoSeoPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <VideoSeoHeader />

        {/* Search bar */}
        <VideoSeoSearchBar />

        {/* Tabs + Video list */}
        <VideoSeoTabs videos={MOCK_VIDEOS} />
      </div>
    </div>
  );
}
