"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagPillProps {
  keyword: string;
  score: number;
  className?: string;
  onRemove?: () => void;
}

export function TagPill({ keyword, score, className, onRemove }: TagPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "bg-secondary/80 border border-border/50",
        "text-sm transition-all duration-200",
        "hover:bg-secondary hover:border-border",
        className
      )}
    >
      <span className="text-xs font-semibold text-chart-1">{score}</span>
      <span className="text-foreground/90">{keyword}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        aria-label={`Remove ${keyword}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
