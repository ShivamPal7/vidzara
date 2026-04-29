"use client";

import { useState } from "react";
import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

interface TitleBlockProps {
  title: string;
  generationId: string;
  className?: string;
}

export function TitleBlock({ title, generationId, className }: TitleBlockProps) {
  const [currentTitle, setCurrentTitle] = useState(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTitle);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <SectionHeader
        title="Title"
        showRefine
        generationId={generationId}
        sectionType="title"
        sectionContent={currentTitle}
        onRefined={setCurrentTitle}
        onCopy={handleCopy}
      />
      <div className="rounded-xl bg-secondary/60 border border-border/40 px-4 py-3.5">
        <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
          {currentTitle}
        </p>
      </div>
    </div>
  );
}
