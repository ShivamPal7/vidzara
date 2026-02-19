"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoOptions, type SeoOption } from "./seo-options";
import type { VideoSeoSearchBarProps } from "./types";

const DEFAULT_OPTIONS: SeoOption[] = [
  { id: "title", label: "Title", description: "Generate optimized video titles", enabled: true },
  { id: "description", label: "Description", description: "Generate SEO-friendly descriptions", enabled: true },
  { id: "tags", label: "Tags", description: "Generate relevant video tags", enabled: true },
  { id: "hashtags", label: "Hashtags", description: "Generate trending hashtags", enabled: true },
];

export function VideoSeoSearchBar({ className }: VideoSeoSearchBarProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [options, setOptions] = useState<SeoOption[]>(DEFAULT_OPTIONS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToggle = useCallback((id: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, enabled: !opt.enabled } : opt))
    );
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const generateButton = (
    <Button
      size="sm"
      className="rounded-full h-9 px-5 gap-2 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all duration-200"
    >
      <Sparkles className="size-4" />
      Generate
    </Button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className={cn("w-full relative", className)}
    >
      {/* Input pill */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl sm:rounded-full border border-border/50 bg-card/60 backdrop-blur-sm px-4 sm:px-5 h-auto sm:h-14 py-2.5 sm:py-0 transition-all duration-300",
          isFocused && "border-primary/50 shadow-[0_0_20px_-4px] shadow-primary/15"
        )}
      >
        {/* Filter icon */}
        <button
          type="button"
          onClick={() => setOptionsOpen((prev) => !prev)}
          className={cn(
            "shrink-0 self-start sm:self-center flex items-center justify-center size-9 rounded-full transition-colors duration-200",
            optionsOpen
              ? "text-foreground bg-muted/60"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <SlidersHorizontal className="size-[18px]" />
        </button>

        {/* Textarea — starts as 1 line, auto-grows */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Make a video about..."
          rows={1}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed py-1 sm:py-0 max-h-32 sm:max-h-none sm:!h-auto"
          style={{ overflow: "hidden" }}
        />

        {/* Generate button — desktop only (inside pill) */}
        <div className="hidden sm:block shrink-0">
          {generateButton}
        </div>
      </div>

      {/* Generate button — mobile only (outside pill, full width) */}
      <div className="sm:hidden mt-3">
        <Button
          size="sm"
          className="w-full rounded-full h-10 gap-2 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all duration-200"
        >
          <Sparkles className="size-4" />
          Generate
        </Button>
      </div>

      {/* Options panel */}
      <SeoOptions
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={options}
        onToggle={handleToggle}
      />
    </motion.div>
  );
}

