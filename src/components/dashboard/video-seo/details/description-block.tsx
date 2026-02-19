"use client";

import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

interface DescriptionBlockProps {
  description: string;
  className?: string;
}

export function DescriptionBlock({ description, className }: DescriptionBlockProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(description);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <SectionHeader
        title="Description"
        showRefine
        onCopy={handleCopy}
      />
      <div className="rounded-xl bg-secondary/60 border border-border/40 px-4 py-4">
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
}
