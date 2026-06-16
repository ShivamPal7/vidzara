"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefinePopover } from "./refine-popover";

interface TitleBlockProps {
  title: string;
  titles?: string[];
  generationId: string;
  className?: string;
}

export function TitleBlock({ title, titles, generationId, className }: TitleBlockProps) {
  const [currentTitles, setCurrentTitles] = useState<string[]>(() => {
    if (titles && titles.length > 0) return titles;
    return [title];
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleRefine = (newTitle: string, index: number) => {
    setCurrentTitles((prev) => {
      const updated = [...prev];
      updated[index] = newTitle;
      return updated;
    });
  };

  // We show up to 3 titles as requested
  const displayTitles = currentTitles.slice(0, 3);

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-base font-semibold text-foreground">Title Options</h3>
      <div className="space-y-3">
        {displayTitles.map((t, idx) => (
          <div
            key={idx}
            className={cn(
              "group relative rounded-xl bg-secondary/60 border border-border/40 px-4 py-3.5",
              "flex items-center justify-between gap-4 transition-all duration-200 hover:bg-secondary/80"
            )}
          >
            <div className="space-y-1 flex-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                Title Option {idx + 1}
              </span>
              <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                {t}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <RefinePopover
                generationId={generationId}
                section="title"
                content={t}
                onRefined={(newVal) => handleRefine(newVal, idx)}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleCopy(t, idx)}
                className="text-muted-foreground hover:text-foreground"
              >
                {copiedIndex === idx ? (
                  <Check className="size-3.5 text-chart-1" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
