"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { VideoSeoHeader } from "@/components/dashboard/video-seo/video-seo-header";
import { VideoSeoSearchBar } from "@/components/dashboard/video-seo/video-seo-search-bar";
import { VideoSeoTabs } from "@/components/dashboard/video-seo/video-seo-tabs";
import { getVideoSeoGenerations, toggleFavorite, deleteGeneration } from "@/actions/video-seo";
import type { Video } from "@/components/dashboard/video-seo/types";

// ── Page ───────────────────────────────────────────────────────────────
export default function VideoSeoPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const fetchVideos = useCallback(async () => {
    const result = await getVideoSeoGenerations();
    if (result.success && result.data) {
      setVideos(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleToggleFavorite = (id: string) => {
    // Optimistic update
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
    );
    startTransition(async () => {
      const result = await toggleFavorite(id);
      if (!result.success) {
        // Revert on failure
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    // Optimistic update
    setVideos((prev) => prev.filter((v) => v.id !== id));
    startTransition(async () => {
      const result = await deleteGeneration(id);
      if (!result.success) {
        // Refetch on failure
        fetchVideos();
      }
    });
  };

  const handleGenerated = () => {
    // Will navigate away, but refetch when user comes back
    fetchVideos();
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <VideoSeoHeader />

        {/* Search bar */}
        <VideoSeoSearchBar onGenerated={handleGenerated} />

        {/* Tabs + Video list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <VideoSeoTabs
            videos={videos}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
