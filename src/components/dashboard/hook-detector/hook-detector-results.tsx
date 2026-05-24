"use client";

import { motion } from "framer-motion";
import { HookDetectorResult } from "./types";
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, ArrowRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HookDetectorResultsProps {
  results: HookDetectorResult | null;
  isVisible: boolean;
  isLoading?: boolean;
}

export function HookDetectorResults({ results, isVisible, isLoading }: HookDetectorResultsProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
        {/* Grade Card Skeleton */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-14 w-14 rounded-xl bg-muted shrink-0" />
          <div className="space-y-2 flex-1 w-full">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </div>
        
        {/* Suggestions Skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/20 p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-4 w-5/6 bg-muted rounded" />
                </div>
                <div className="h-10 w-full bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isVisible || !results) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Hook copied to clipboard!");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "STRONG":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          label: "Strong Hook",
        };
      case "AVERAGE":
        return {
          icon: AlertTriangle,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          label: "Average Hook",
        };
      case "WEAK":
      default:
        return {
          icon: XCircle,
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
          label: "Weak Hook",
        };
    }
  };

  const config = getStatusConfig(results.status);
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Grade Card */}
      <div className={cn("p-6 rounded-2xl border backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center gap-6 transition-colors duration-300", config.bg, config.border)}>
        <div className={cn("p-4 rounded-xl flex-shrink-0", "bg-background/50")}>
          <StatusIcon className={cn("size-8", config.color)} />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className={cn("text-xl font-semibold", config.color)}>{config.label}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {results.explanation}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      {results.suggestions && results.suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Lightbulb className="size-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">Better Hook Suggestions</h3>
          </div>
          
          <div className="grid gap-4">
            {results.suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative rounded-xl border border-border/50 bg-card/40 hover:bg-card/60 backdrop-blur-sm p-5 transition-all hover:border-primary/30"
              >
                <div className="absolute top-4 right-4 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary bg-background/50 md:bg-transparent"
                    onClick={() => copyToClipboard(suggestion.rewrite)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1 pr-8">
                      Suggestion {index + 1}
                    </span>
                    <p className="text-foreground text-[15px] font-medium leading-relaxed">
                      "{suggestion.rewrite}"
                    </p>
                  </div>
                  
                  <div className="flex gap-2.5 items-start bg-primary/5 rounded-lg p-3">
                    <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestion.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
