"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { ThumbnailHeader } from "@/components/dashboard/thumbnail/thumbnail-header";
import { ThumbnailSearchBar } from "@/components/dashboard/thumbnail/thumbnail-search-bar";
import { ThumbnailTabs } from "@/components/dashboard/thumbnail/thumbnail-tabs";
import { getThumbnailGenerations, toggleFavorite, deleteGeneration } from "@/actions/thumbnail";
import type { Thumbnail } from "@/components/dashboard/thumbnail/types";

// ── Page ───────────────────────────────────────────────────────────────
export default function ThumbnailClient() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const fetchThumbnails = useCallback(async () => {
    const result = await getThumbnailGenerations();
    if (result.success && result.data) {
      setThumbnails(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchThumbnails();
  }, [fetchThumbnails]);

  const handleToggleFavorite = (id: string) => {
    // Optimistic update
    setThumbnails((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
    );
    startTransition(async () => {
      const result = await toggleFavorite(id);
      if (!result.success) {
        // Revert on failure
        setThumbnails((prev) =>
          prev.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    // Optimistic update
    setThumbnails((prev) => prev.filter((v) => v.id !== id));
    startTransition(async () => {
      const result = await deleteGeneration(id);
      if (!result.success) {
        // Refetch on failure
        fetchThumbnails();
      }
    });
  };

  const handleGenerated = () => {
    // Will navigate away, but refetch when user comes back
    fetchThumbnails();
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <ThumbnailHeader />

        {/* Search bar */}
        <ThumbnailSearchBar onGenerated={handleGenerated} />

        {/* Tabs + Thumbnail list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ThumbnailTabs
            thumbnails={thumbnails}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
