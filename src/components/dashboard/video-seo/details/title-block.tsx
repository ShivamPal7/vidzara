"use client";

import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

interface TitleBlockProps {
  title: string;
  className?: string;
}

export function TitleBlock({ title, className }: TitleBlockProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(title);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <SectionHeader
        title="Title"
        showRefine
        onCopy={handleCopy}
      />
      <div className="rounded-xl bg-secondary/60 border border-border/40 px-4 py-3.5">
        <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
          {title}
        </p>
      </div>
    </div>
  );
}
