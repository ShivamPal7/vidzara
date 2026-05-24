"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentSafetyInputProps {
  className?: string;
  onAnalyze: (content: string) => void;
  isAnalyzing: boolean;
  initialPrompt?: string;
}

export function ContentSafetyInput({ className, onAnalyze, isAnalyzing, initialPrompt = "" }: ContentSafetyInputProps) {
  const [value, setValue] = useState(initialPrompt);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with max-height constraint
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(320, el.scrollHeight);
    el.style.height = `${Math.max(120, nextHeight)}px`;
  }, [value]);

  useEffect(() => {
    if (initialPrompt) {
      setValue(initialPrompt);
    }
  }, [initialPrompt]);

  const handleAnalyze = () => {
    if (!value.trim() || isAnalyzing) return;
    onAnalyze(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // CMD+Enter or CTRL+Enter to analyze
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className={cn("w-full relative max-w-4xl mx-auto space-y-4", className)}
    >
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 transition-all duration-300",
          isFocused && "border-primary/50 shadow-[0_0_20px_-4px] shadow-primary/15"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your video title, description, tags, or full script here..."
          disabled={isAnalyzing}
          className="w-full min-h-[120px] max-h-[320px] overflow-y-auto bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed disabled:opacity-50"
        />

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Press <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">Cmd</kbd> + <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> to analyze
          </p>
          <p className="text-xs text-muted-foreground sm:hidden">
            Check your content against YouTube guidelines
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !value.trim()}
            className="hidden sm:flex rounded-full px-5 gap-2 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all duration-200"
          >
            {isAnalyzing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {isAnalyzing ? "Analyzing..." : "Analyze Content"}
          </Button>
        </div>
      </div>

      <div className="sm:hidden mt-3">
        <Button
          type="button"
          size="sm"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !value.trim()}
          className="w-full rounded-full h-11 gap-2 text-[15px] font-medium shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all duration-200"
        >
          {isAnalyzing ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ShieldCheck className="size-5" />
          )}
          {isAnalyzing ? "Analyzing..." : "Analyze Content"}
        </Button>
      </div>
    </motion.div>
  );
}
