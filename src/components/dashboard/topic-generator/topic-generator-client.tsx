"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { TopicGeneratorHeader } from "./topic-generator-header";
import { TopicGeneratorSearchBar } from "./topic-generator-search-bar";
import { TopicGeneratorTabs } from "./topic-generator-tabs";
import { getTopicGenerations, toggleFavorite, deleteGeneration } from "@/actions/topic-generator";
import { TopicGeneration } from "./types";
import { IconLoader2 } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TopicGeneratorClient() {
  const [generations, setGenerations] = useState<TopicGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const fetchGenerations = useCallback(async () => {
    const result = await getTopicGenerations();
    if (result.success && result.data) {
      // The DB returns objects that match our TopicGeneration interface
      setGenerations(result.data as unknown as TopicGeneration[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  const handleToggleFavorite = (id: string) => {
    // Optimistic update
    setGenerations((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g))
    );
    startTransition(async () => {
      const result = await toggleFavorite(id);
      if (!result.success) {
        // Revert on failure
        setGenerations((prev) =>
          prev.map((g) => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    // Optimistic update
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    startTransition(async () => {
      const result = await deleteGeneration(id);
      if (!result.success) {
        // Refetch on failure
        fetchGenerations();
      }
    });
  };

  const handleGenerated = () => {
    fetchGenerations();
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)] px-2">
      <div className="w-full max-w-5xl mx-auto py-8 space-y-8">
        {/* Header */}
        <TopicGeneratorHeader />

        {/* Search bar & Competitor Selector */}
        <TopicGeneratorSearchBar onGenerated={handleGenerated} />

        {/* Tabs + Results list */}
        {loading ? (
          <div className="space-y-4 w-full">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <TopicGeneratorTabs
            generations={generations}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
