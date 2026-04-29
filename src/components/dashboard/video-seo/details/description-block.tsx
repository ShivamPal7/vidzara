"use client";

import { useState } from "react";
import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

interface DescriptionBlockProps {
  description: string;
  generationId: string;
  className?: string;
}

export function DescriptionBlock({ description, generationId, className }: DescriptionBlockProps) {
  const [currentDescription, setCurrentDescription] = useState(description);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDescription);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <SectionHeader
        title="Description"
        showRefine
        generationId={generationId}
        sectionType="description"
        sectionContent={currentDescription}
        onRefined={setCurrentDescription}
        onCopy={handleCopy}
      />
      <div className="rounded-xl bg-secondary/60 border border-border/40 px-4 py-4">
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
          {currentDescription}
        </p>
      </div>
    </div>
  );
}
