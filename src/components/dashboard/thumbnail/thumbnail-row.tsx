"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ThumbnailRowProps } from "./types";

export function ThumbnailRow({ thumbnail, onToggleFavorite, onDelete }: ThumbnailRowProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center justify-between gap-4 px-5 py-4 rounded-xl",
        "border border-border/40 bg-card/50 backdrop-blur-sm",
        "hover:border-border/70 hover:bg-card/80",
        "transition-all duration-200 cursor-pointer"
      )}
      onClick={() => router.push(`/dashboard/create/thumbnail/${thumbnail.id}`)}
    >
      {/* Title */}
      <span className="text-sm sm:text-[15px] font-medium text-foreground leading-snug truncate">
        {thumbnail.title}
      </span>

      {/* Action icons */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(thumbnail.id);
          }}
        >
          <Heart
            className={cn(
              "size-4",
              thumbnail.isFavorite && "fill-primary text-primary"
            )}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/create/thumbnail/${thumbnail.id}`);
          }}
        >
          <Eye className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(thumbnail.id);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}
