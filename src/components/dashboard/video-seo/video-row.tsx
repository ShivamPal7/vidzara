"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoRowProps } from "./types";

export function VideoRow({ video, onToggleFavorite, onView }: VideoRowProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center justify-between gap-4 px-5 py-4 rounded-xl",
        "border border-border/40 bg-card/50 backdrop-blur-sm",
        "hover:border-border/70 hover:bg-card/80",
        "transition-all duration-200"
      )}
    >
      {/* Title */}
      <span className="text-sm sm:text-[15px] font-medium text-foreground leading-snug truncate">
        {video.title}
      </span>

      {/* Action icons */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
          onClick={() => onToggleFavorite?.(video.id)}
        >
          <Heart
            className={cn(
              "size-4",
              video.isFavorite && "fill-primary text-primary"
            )}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
          onClick={() => onView?.(video.id)}
        >
          <Eye className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}
