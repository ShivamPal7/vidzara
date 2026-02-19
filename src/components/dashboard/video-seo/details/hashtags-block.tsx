"use client";

import { useState } from "react";
import { Copy, Check, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HashtagsBlockProps {
  hashtags: string[];
  className?: string;
}

export function HashtagsBlock({ hashtags, className }: HashtagsBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Hashtags</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-chart-1" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Hashtag pills */}
      <div className="rounded-xl bg-secondary/60 border border-border/40 px-4 py-4">
        <div className="flex flex-wrap gap-2 items-center">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5",
                "bg-secondary/80 border border-border/50",
                "text-sm text-primary font-medium",
                "hover:bg-secondary hover:border-border transition-all duration-200"
              )}
            >
              <Hash className="size-3 text-primary/70" />
              {tag.replace(/^#/, "")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
