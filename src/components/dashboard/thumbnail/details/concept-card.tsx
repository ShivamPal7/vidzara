"use client";

import { motion } from "framer-motion";
import {
  IconFileText,
  IconMoodSmile,
  IconTemplate,
  IconPalette,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconUser,
  IconPhoto,
  IconFocus,
  IconSun,
  IconSpace,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ThumbnailConceptDetail } from "../types";

interface ConceptCardProps {
  concept: ThumbnailConceptDetail;
  index: number;
}

export function ConceptCard({ concept, index }: ConceptCardProps) {
  const [copiedTextIndex, setCopiedTextIndex] = useState<number | null>(null);
  const [selectedTextIndex, setSelectedTextIndex] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTextIndex(idx);
    setSelectedTextIndex(idx);
    setTimeout(() => setCopiedTextIndex(null), 2000);
  };

  const handleCopyPrompt = () => {
    const textToInclude = concept.textIdeas && concept.textIdeas[selectedTextIndex]
      ? concept.textIdeas[selectedTextIndex]
      : concept.textIdea;

    let textToCopy = "";
    if (concept.thumbnailPrompt) {
      textToCopy = `YouTube Thumbnail Design Concept & Specs:
- Chosen Text Overlay: "${textToInclude}" (${concept.thumbnailPrompt.textPlacement})
- Primary Subject: ${concept.thumbnailPrompt.subject} (${concept.thumbnailPrompt.facialExpression})
- Background Setting: ${concept.thumbnailPrompt.background}
- Composition & Framing: ${concept.thumbnailPrompt.composition}
- Lighting Style: ${concept.thumbnailPrompt.lighting}
- Color Palette: ${concept.colors.join(", ")} (${concept.thumbnailPrompt.colorsDescription})

AI Image Generation Prompt (Midjourney / DALL-E 3):
${concept.thumbnailPrompt.midjourneyPrompt}`;
    } else {
      textToCopy = `YouTube Thumbnail Design Concept & Specs:
- Chosen Text Overlay: "${textToInclude}"
- Emotion/Expression: ${concept.emotion}
- Visual Composition: ${concept.layout}
- Color Palette: ${concept.colors.join(", ")}

AI Image Generation Prompt:
${concept.imagePrompt || ""}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {index + 1}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          Concept Option {index + 1}
        </h3>
      </div>

      <div className="space-y-6">
        {/* Click-Optimized Text Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconFileText className="size-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Click-Optimized Text Options</span>
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">Click to select & copy</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {concept.textIdeas && concept.textIdeas.length > 0 ? (
              concept.textIdeas.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyText(text, idx)}
                  className={`relative flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 group/item active:scale-[0.98] ${
                    selectedTextIndex === idx
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border/50 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40"
                  }`}
                >
                  <span className="font-extrabold tracking-wide uppercase text-xs sm:text-sm pr-10 text-foreground leading-snug">
                    {text}
                  </span>
                  <div className="absolute right-4 flex items-center justify-center">
                    {selectedTextIndex === idx ? (
                      <IconCheck className="size-4 text-primary animate-in fade-in zoom-in-50 duration-200" />
                    ) : (
                      <IconCopy className="size-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              // Fallback to single textIdea for backward compatibility
              <button
                onClick={() => handleCopyText(concept.textIdea, 0)}
                className={`relative flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 group/item active:scale-[0.98] ${
                  selectedTextIndex === 0
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                    : "border-border/50 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40"
                }`}
              >
                <span className="font-extrabold tracking-wide uppercase text-xs sm:text-sm pr-10 text-foreground leading-snug">
                  {concept.textIdea}
                </span>
                <div className="absolute right-4 flex items-center justify-center">
                  {selectedTextIndex === 0 ? (
                    <IconCheck className="size-4 text-primary" />
                  ) : (
                    <IconCopy className="size-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Structured Visual Prompt Parameters */}
        {concept.thumbnailPrompt ? (
          <div className="space-y-6">
            <div className="border-t border-border/40 my-6" />

            <div className="flex items-center gap-2">
              <IconSparkles className="size-4 text-indigo-500" />
              <span className="text-xs sm:text-sm font-semibold text-foreground">Visual Creation Parameters</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Subject */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/40 space-y-1.5 hover:border-border/80 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconUser className="size-4 text-indigo-500/80" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Subject & Gaze</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {concept.thumbnailPrompt.subject}
                </p>
                <div className="text-[10px] sm:text-xs text-muted-foreground border-t border-border/20 pt-1.5 mt-1.5">
                  <span className="font-semibold text-foreground/70">Expression:</span> {concept.thumbnailPrompt.facialExpression}
                </div>
              </div>

              {/* Background */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/40 space-y-1.5 hover:border-border/80 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconPhoto className="size-4 text-indigo-500/80" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Background Environment</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {concept.thumbnailPrompt.background}
                </p>
              </div>

              {/* Composition */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/40 space-y-1.5 hover:border-border/80 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconFocus className="size-4 text-indigo-500/80" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Composition & Framing</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {concept.thumbnailPrompt.composition}
                </p>
              </div>

              {/* Lighting */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/40 space-y-1.5 hover:border-border/80 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconSun className="size-4 text-indigo-500/80" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Lighting & Accent</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {concept.thumbnailPrompt.lighting}
                </p>
              </div>

              {/* Text Placement */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/40 space-y-1.5 hover:border-border/80 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconSpace className="size-4 text-indigo-500/80" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Text Styling & Placement</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {concept.thumbnailPrompt.textPlacement}
                </p>
              </div>

              {/* Colors */}
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/40 space-y-1.5 hover:border-border/80 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconPalette className="size-4 text-indigo-500/80" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Color Psychology & Palette</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                  {concept.thumbnailPrompt.colorsDescription}
                </p>
                {concept.colors && concept.colors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {concept.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-1 p-1 px-1.5 rounded bg-secondary/30 border border-border/20">
                        <div className="size-3 rounded-sm border border-black/10" style={{ backgroundColor: color }} />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{color}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Complete Image Prompt */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconSparkles className="size-4 text-amber-500" />
                <span className="text-xs sm:text-sm font-semibold text-foreground">AI Image Generation Prompt</span>
              </div>
              
              <div className="relative flex items-start justify-between gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 group/prompt">
                <div className="space-y-2 pr-8 text-xs sm:text-sm leading-relaxed select-all font-mono font-medium text-foreground/90 whitespace-pre-wrap">
                  <p className="text-[10px] sm:text-xs text-amber-400/80 font-semibold border-b border-amber-500/10 pb-1.5 mb-1.5">
                    Preview of visual background prompt (overlay text will be appended on copy):
                  </p>
                  {concept.thumbnailPrompt.midjourneyPrompt}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 size-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 shrink-0 transition-all duration-200"
                  onClick={handleCopyPrompt}
                >
                  {copiedPrompt ? <IconCheck className="size-4 text-green-500 animate-in zoom-in" /> : <IconCopy className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Legacy details fallback
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4 border-t border-border/40 pt-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconMoodSmile className="size-4 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Emotion / Expression</span>
              </div>
              <div className="flex-1 flex items-center p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40">
                <p className="text-foreground text-xs sm:text-sm font-medium">
                  {concept.emotion}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconPalette className="size-4 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Suggested Colors</span>
              </div>
              <div className="flex-1 flex items-center p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40">
                <div className="flex flex-wrap gap-2">
                  {concept.colors && concept.colors.length > 0 ? (
                    concept.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-secondary/50 border border-border/20">
                        <div className="size-4 rounded-sm border border-black/10" style={{ backgroundColor: color }} />
                        <span className="text-xs font-mono uppercase text-foreground">{color}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No palette generated</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconTemplate className="size-4 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Visual Composition</span>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40">
                <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed">
                  {concept.layout}
                </p>
              </div>
            </div>

            {concept.imagePrompt && (
              <div className="space-y-3 sm:col-span-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconSparkles className="size-4 text-amber-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">AI Image Generator Prompt</span>
                </div>
                <div className="relative flex items-start justify-between gap-3 p-3 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 group/prompt">
                  <div className="space-y-2 pr-8 text-xs sm:text-sm leading-relaxed select-all font-mono font-medium text-foreground/90 whitespace-pre-wrap">
                    <p className="text-[10px] sm:text-xs text-amber-400/80 font-semibold border-b border-amber-500/10 pb-1 mb-1">
                      Preview of visual background prompt (overlay text will be appended on copy):
                    </p>
                    {concept.imagePrompt}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 size-7 sm:size-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 shrink-0"
                    onClick={handleCopyPrompt}
                  >
                    {copiedPrompt ? <IconCheck className="size-4 text-green-500 animate-in zoom-in" /> : <IconCopy className="size-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
