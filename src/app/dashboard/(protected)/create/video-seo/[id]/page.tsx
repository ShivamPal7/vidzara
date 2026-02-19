"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { VideoSeoDetailsHeader } from "@/components/dashboard/video-seo/details/video-seo-details-header";
import { PromptCard } from "@/components/dashboard/video-seo/details/prompt-card";
import { TitleBlock } from "@/components/dashboard/video-seo/details/title-block";
import { DescriptionBlock } from "@/components/dashboard/video-seo/details/description-block";
import { TagsBlock } from "@/components/dashboard/video-seo/details/tags-block";
import { HashtagsBlock } from "@/components/dashboard/video-seo/details/hashtags-block";
import type { VideoSeoDetails } from "@/components/dashboard/video-seo/types";

// ── Mock data ────────────────────────────────────────────────────────────
const mockVideoSeo: VideoSeoDetails = {
  id: "1",
  prompt:
    "I want to make my new video on resistance. How its our biggest enemy and stoping me from the sucess",
  title: "What Is RESISTANCE Holding Me Back From Success?",
  description:
    "Discover the hidden forces that are holding you back from achieving your goals and unlocking your full potential. In this video, we'll explore the concept of resistance and how it can silently sabotage your efforts, preventing you from reaching success. Learn how to recognize the signs of resistance, overcome self-doubt, and break through the barriers that are standing in your way. By understanding and addressing resistance, you can gain the clarity and momentum you need to achieve your dreams and live a more fulfilling life. Tune in to gain valuable insights and practical advice on how to overcome resistance and unlock your path to success.",
  suggestedKeywords: [
    { keyword: "anime recap", score: 80 },
    { keyword: "manga recap", score: 77 },
    { keyword: "manhwa", score: 77 },
    { keyword: "movie recap", score: 77 },
    { keyword: "manhwa recap", score: 76 },
  ],
  tags: [
    { keyword: "anime recap", score: 80 },
    { keyword: "movie recap", score: 77 },
    { keyword: "manga recap", score: 77 },
    { keyword: "manhwa", score: 77 },
    { keyword: "manhwa recap", score: 76 },
    { keyword: "motivation", score: 75 },
    { keyword: "recap manhwa", score: 71 },
    { keyword: "anime recaps", score: 68 },
    { keyword: "mindset", score: 67 },
    { keyword: "procrastination", score: 65 },
    { keyword: "success", score: 66 },
    { keyword: "manga recaps", score: 64 },
    { keyword: "anime summary", score: 63 },
    { keyword: "self-improvement", score: 63 },
    { keyword: "breakthrough", score: 62 },
    { keyword: "personal growth", score: 61 },
    { keyword: "productivity", score: 61 },
    { keyword: "creative block", score: 61 },
    { keyword: "resistance", score: 58 },
    { keyword: "fear of failure", score: 57 },
  ],
  hashtags: [
    "resistance", "motivation", "success", "mindset", "selfimprovement",
    "personalgrowth", "productivity", "overcomeresistance", "breakthrough",
    "fearoffailure", "procrastination", "creativeblock", "goalsetting",
    "discipline", "focus",
  ],
};

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

  // In the future, fetch data by id. For now use mock.
  const data = { ...mockVideoSeo, id };

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
          <VideoSeoDetailsHeader title={data.title} />
        </motion.div>

        {/* Prompt Card */}
        <motion.div variants={sectionVariants}>
          <PromptCard
            prompt={data.prompt}
            suggestedKeywords={data.suggestedKeywords}
          />
        </motion.div>

        {/* Title Section */}
        <motion.div variants={sectionVariants}>
          <TitleBlock title={data.title} />
        </motion.div>

        {/* Description Section */}
        <motion.div variants={sectionVariants}>
          <DescriptionBlock description={data.description} />
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
