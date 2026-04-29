"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regenerateThumbnail } from "@/actions/thumbnail";
import type { ThumbnailDetails } from "../types";

interface PromptCardProps {
  prompt: string;
  generationId: string;
  onRegenerated: (data: ThumbnailDetails) => void;
}

export function PromptCard({ prompt, generationId, onRegenerated }: PromptCardProps) {
  const [value, setValue] = useState(prompt);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = () => {
    if (!value.trim() || isPending) return;
    setError(null);
    
    startTransition(async () => {
      const res = await regenerateThumbnail({
        generationId,
        content: value.trim(),
      });
      
      if (res.success && res.data) {
        onRegenerated(res.data as ThumbnailDetails);
      } else {
        setError("Regeneration failed. Please try again.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-5 sm:p-6 space-y-4 backdrop-blur-sm shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-4" />
          <h3 className="text-sm font-medium">Refine Concept Prompt</h3>
        </div>
        
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          disabled={isPending}
          className={cn(
            "w-full rounded-xl bg-secondary/40 border border-border/40 px-4 py-3 mt-2",
            "text-sm text-foreground/90 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
            "disabled:opacity-50"
          )}
          placeholder="Adjust your prompt to get different results..."
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Tip: Be specific about colors and emotions for better results.
          </p>
        )}
        
        <Button
          onClick={handleRegenerate}
          disabled={isPending || !value.trim()}
          size="sm"
          className="w-full sm:w-auto rounded-full gap-2 px-6 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {isPending ? "Regenerating..." : "Regenerate Concepts"}
        </Button>
      </div>
    </div>
  );
}

