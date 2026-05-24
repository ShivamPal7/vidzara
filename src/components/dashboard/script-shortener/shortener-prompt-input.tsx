"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Loader2, ClipboardPaste, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShortenerPromptInputProps {
  className?: string;
  onAnalyze: (content: string, count: number) => void;
  isAnalyzing: boolean;
  initialPrompt?: string;
}

export function ShortenerPromptInput({ className, onAnalyze, isAnalyzing, initialPrompt = "" }: ShortenerPromptInputProps) {
  const [value, setValue] = useState(initialPrompt);
  const [count, setCount] = useState("3");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with maximum height limit
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(350, Math.max(160, el.scrollHeight))}px`;
  }, [value]);

  useEffect(() => {
    if (initialPrompt) {
      setValue(initialPrompt);
    }
  }, [initialPrompt]);

  const handleAnalyze = () => {
    if (!value.trim() || isAnalyzing) return;
    onAnalyze(value.trim(), parseInt(count, 10));
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
          placeholder="Paste your long-form video script here... We'll extract the best moments and turn them into engaging shorts."
          disabled={isAnalyzing}
          className="w-full min-h-[160px] bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed disabled:opacity-50 overflow-y-auto"
        />

        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-border/50 gap-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setValue(text);
                } catch (err) {
                  console.error("Failed to paste from clipboard", err);
                }
              }}
              className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <ClipboardPaste className="size-4 mr-2" />
              <span className="text-sm font-medium">Paste</span>
            </Button>

            <div className="hidden sm:flex items-center gap-2 border-l border-border/50 pl-3">
              <span className="text-xs text-muted-foreground">Shorts:</span>
              <Select value={count} onValueChange={setCount} disabled={isAnalyzing}>
                <SelectTrigger className="h-8 w-[110px] bg-transparent border-border/50 text-xs">
                  <SelectValue placeholder="Count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Short</SelectItem>
                  <SelectItem value="2">2 Shorts</SelectItem>
                  <SelectItem value="3">3 Shorts</SelectItem>
                  <SelectItem value="4">4 Shorts</SelectItem>
                  <SelectItem value="5">5 Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <p className="text-xs text-muted-foreground hidden md:block pl-3 border-l border-border/50">
              Press <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">Cmd</kbd> + <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">Enter</kbd>
            </p>
          </div>
          
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
              <Sparkles className="size-4" />
            )}
            {isAnalyzing ? "Extracting Shorts..." : "Generate Shorts"}
          </Button>
        </div>
      </div>

      <div className="sm:hidden mt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between bg-card/60 border border-border/50 rounded-xl p-3">
           <span className="text-sm text-muted-foreground">Number of Shorts:</span>
           <Select value={count} onValueChange={setCount} disabled={isAnalyzing}>
             <SelectTrigger className="h-9 w-[120px] bg-transparent border-border/50 text-sm">
               <SelectValue placeholder="Count" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="1">1 Short</SelectItem>
               <SelectItem value="2">2 Shorts</SelectItem>
               <SelectItem value="3">3 Shorts</SelectItem>
               <SelectItem value="4">4 Shorts</SelectItem>
               <SelectItem value="5">5 Shorts</SelectItem>
             </SelectContent>
           </Select>
        </div>

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
            <Sparkles className="size-5" />
          )}
          {isAnalyzing ? "Extracting Shorts..." : "Generate Shorts"}
        </Button>
      </div>
    </motion.div>
  );
}
