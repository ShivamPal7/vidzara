"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeywordPill } from "./keyword-pill";
import { cn } from "@/lib/utils";
import type { SuggestedKeyword } from "../types";

interface PromptCardProps {
  prompt: string;
  suggestedKeywords: SuggestedKeyword[];
  className?: string;
}

export function PromptCard({ prompt, suggestedKeywords, className }: PromptCardProps) {
  const [promptValue, setPromptValue] = useState(prompt);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-5 sm:p-6 space-y-5",
        "glass-1",
        className
      )}
    >
      {/* Editable prompt input */}
      <textarea
        value={promptValue}
        onChange={(e) => setPromptValue(e.target.value)}
        rows={2}
        className={cn(
          "w-full rounded-xl bg-secondary/60 border border-border/40 px-4 py-3",
          "text-sm text-foreground/90 leading-relaxed resize-none",
          "outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]",
          "transition-all duration-200 placeholder:text-muted-foreground"
        )}
        placeholder="Enter your video topic or prompt..."
      />

      {/* Suggested keywords */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground font-medium">Use top related keyword</p>
        <div className="flex flex-wrap gap-2">
          {suggestedKeywords.map((kw) => (
            <KeywordPill key={kw.keyword} keyword={kw.keyword} score={kw.score} />
          ))}
        </div>
      </div>

      {/* Add Keyword link */}
      <button
        type="button"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
      >
        Add Keyword
      </button>

      {/* Regenerate button */}
      <div>
        <Button size="sm" className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
