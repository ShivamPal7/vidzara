"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { VideoRow } from "./video-row";
import type { VideoListProps } from "./types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function VideoList({ videos, onToggleFavorite, onDelete, className }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No videos yet. Generate your first one!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-col gap-3", className)}
    >
      {videos.map((video) => (
        <motion.div key={video.id} variants={itemVariants as any}>
          <VideoRow
            video={video}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
