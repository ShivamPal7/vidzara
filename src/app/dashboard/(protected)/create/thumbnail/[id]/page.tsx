"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThumbnailDetailsHeader } from "@/components/dashboard/thumbnail/details/thumbnail-details-header";
import { PromptCard } from "@/components/dashboard/thumbnail/details/prompt-card";
import { ConceptCard } from "@/components/dashboard/thumbnail/details/concept-card";
import { getThumbnailDetail } from "@/actions/thumbnail";
import type { ThumbnailDetails } from "@/components/dashboard/thumbnail/types";

// ── Animation variants ───────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// ── Page ─────────────────────────────────────────────────────────────────
export default function ThumbnailDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ThumbnailDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      const result = await getThumbnailDetail(id);
      if (result.success && result.data) {
        setData(result.data as ThumbnailDetails);
      } else if (!result.success) {
        setError("error" in result ? result.error : "Failed to load generation.");
      }
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground mt-4">Loading concepts...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-destructive">{error || "Concepts not found."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-full px-2">
      <motion.div
        className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-10 py-6 sm:py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={sectionVariants}>
          <ThumbnailDetailsHeader
            title={data.title}
            generationId={data.id}
            isFavorite={data.isFavorite}
          />
        </motion.div>

        {/* Prompt Card */}
        <motion.div variants={sectionVariants}>
          <PromptCard
            prompt={data.prompt}
            generationId={data.id}
            onRegenerated={(updated) => setData(updated)}
          />
        </motion.div>

        {/* Concepts Section */}
        <motion.div variants={sectionVariants} className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              Generated Concepts
            </h2>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {data.concepts?.length || 0} Options
            </span>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {data.concepts?.map((concept, index) => (
              <ConceptCard key={concept.id} concept={concept} index={index} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
