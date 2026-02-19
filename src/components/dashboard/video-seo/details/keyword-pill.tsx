"use client";

import { cn } from "@/lib/utils";

interface KeywordPillProps {
  keyword: string;
  score: number;
  className?: string;
  onClick?: () => void;
}

export function KeywordPill({ keyword, score, className, onClick }: KeywordPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        "bg-secondary/80 hover:bg-secondary",
        "border border-border/50 hover:border-border",
        "text-sm transition-all duration-200",
        "cursor-pointer select-none",
        className
      )}
    >
      <span className="text-xs font-semibold text-chart-1">{score}</span>
      <span className="text-foreground/90">{keyword}</span>
    </button>
  );
}
