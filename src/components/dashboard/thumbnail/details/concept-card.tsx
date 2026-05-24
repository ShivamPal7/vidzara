"use client";

import { motion } from "framer-motion";
import { Type, Smile, LayoutTemplate, Palette, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ThumbnailConceptDetail } from "../types";

interface ConceptCardProps {
  concept: ThumbnailConceptDetail;
  index: number;
}

export function ConceptCard({ concept, index }: ConceptCardProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center justify-center size-7 sm:size-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold">
          {index + 1}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          Concept Option
        </h3>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {/* Text Idea */}
        <div className="flex flex-col space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Type className="size-3.5 sm:size-4" />
            <span className="text-xs sm:text-sm font-medium">Text on Thumbnail</span>
          </div>
          <div className="flex-1 flex items-center justify-between gap-2 p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40">
            <p className="text-foreground font-semibold leading-tight text-base sm:text-md uppercase">
              &quot;{concept.textIdea}&quot;
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 sm:size-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => copyToClipboard(concept.textIdea, setCopiedText)}
            >
              {copiedText ? <Check className="size-3 sm:size-3.5 text-green-500" /> : <Copy className="size-3 sm:size-3.5" />}
            </Button>
          </div>
        </div>

        {/* Emotion */}
        <div className="flex flex-col space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Smile className="size-3.5 sm:size-4" />
            <span className="text-xs sm:text-sm font-medium">Emotion / Expression</span>
          </div>
          <div className="flex-1 flex items-center p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40">
            <p className="text-foreground text-xs sm:text-sm font-medium">
              {concept.emotion}
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="space-y-2 sm:space-y-3 sm:col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LayoutTemplate className="size-3.5 sm:size-4" />
            <span className="text-xs sm:text-sm font-medium">Visual Composition</span>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40">
            <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed">
              {concept.layout}
            </p>
          </div>
        </div>

        {/* Color Palette */}
        {concept.colors && concept.colors.length > 0 && (
          <div className="space-y-2 sm:space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Palette className="size-3.5 sm:size-4" />
              <span className="text-xs sm:text-sm font-medium">Suggested Palette</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {concept.colors.map((color, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 pr-2 sm:pr-3 rounded-lg border border-border/40 bg-secondary/20">
                  <div
                    className="size-4 sm:size-5 rounded shadow-sm border border-black/10 dark:border-white/10"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] sm:text-xs font-medium text-foreground uppercase tracking-wider">
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* AI Image Generation Prompt */}
        {concept.imagePrompt && (
          <div className="space-y-2 sm:space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-3.5 sm:size-4 text-amber-500" />
              <span className="text-xs sm:text-sm font-medium text-amber-500/90 dark:text-amber-400">AI Image Generator Prompt</span>
            </div>
            <div className="relative flex items-start justify-between gap-3 p-3 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 group/prompt">
              <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed pr-8 select-all font-mono font-medium whitespace-pre-wrap">
                {concept.imagePrompt}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 size-7 sm:size-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 shrink-0"
                onClick={() => copyToClipboard(concept.imagePrompt || "", setCopiedPrompt)}
              >
                {copiedPrompt ? <Check className="size-3.5 sm:size-4 text-green-500" /> : <Copy className="size-3.5 sm:size-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
