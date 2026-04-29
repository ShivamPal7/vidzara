"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { VideoSeoDetailsHeader } from "@/components/dashboard/video-seo/details/video-seo-details-header";
import { PromptCard } from "@/components/dashboard/video-seo/details/prompt-card";
import { TitleBlock } from "@/components/dashboard/video-seo/details/title-block";
import { DescriptionBlock } from "@/components/dashboard/video-seo/details/description-block";
import { TagsBlock } from "@/components/dashboard/video-seo/details/tags-block";
import { HashtagsBlock } from "@/components/dashboard/video-seo/details/hashtags-block";
import { getVideoSeoDetail } from "@/actions/video-seo";
import type { VideoSeoDetails } from "@/components/dashboard/video-seo/types";

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
export default function VideoSeoDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<VideoSeoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      const result = await getVideoSeoDetail(id);
      if (result.success && result.data) {
        setData(result.data as VideoSeoDetails);
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
        <p className="text-sm text-muted-foreground mt-4">Loading generation...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)]">
        <p className="text-sm text-destructive">{error || "Generation not found."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)]">
      <motion.div
        className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={sectionVariants}>
          <VideoSeoDetailsHeader
            title={data.title}
            generationId={data.id}
            isFavorite={data.isFavorite}
          />
        </motion.div>

        {/* Prompt Card */}
        <motion.div variants={sectionVariants}>
          <PromptCard
            prompt={data.prompt}
            suggestedKeywords={data.suggestedKeywords}
            generationId={data.id}
            onRegenerated={(updated) => setData(updated)}
          />
        </motion.div>

        {/* Title Section */}
        <motion.div variants={sectionVariants}>
          <TitleBlock title={data.title} generationId={data.id} />
        </motion.div>

        {/* Description Section */}
        <motion.div variants={sectionVariants}>
          <DescriptionBlock description={data.description} generationId={data.id} />
        </motion.div>

        {/* Tags Section */}
        <motion.div variants={sectionVariants}>
          <TagsBlock tags={data.tags} />
        </motion.div>

        {/* Hashtags Section */}
        <motion.div variants={sectionVariants}>
          <HashtagsBlock hashtags={data.hashtags} />
        </motion.div>
      </motion.div>
    </div>
  );
}
