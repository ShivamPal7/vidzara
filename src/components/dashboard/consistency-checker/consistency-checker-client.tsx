"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConsistencyCheckerHeader } from "./consistency-checker-header";
import { ConsistencyCheckerSearchBar } from "./consistency-checker-search-bar";
import { ConsistencyCheckerResults } from "./consistency-checker-results";
import { analyzeChannelConsistency } from "@/actions/consistency-checker";
import type { ChannelSearchResult, ConsistencyData } from "./types";
import { toast } from "sonner";
import { IconChartDots } from "@tabler/icons-react";

export function ConsistencyCheckerClient() {
  const [data, setData] = useState<ConsistencyData | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChannelSelect = (channel: ChannelSearchResult) => {
    startTransition(async () => {
      const result = await analyzeChannelConsistency(channel);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || "Failed to analyse channel.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <ConsistencyCheckerHeader />

        {/* Search bar */}
        <ConsistencyCheckerSearchBar
          onSelect={handleChannelSelect}
          loading={isPending}
        />

        {/* Results or empty state */}
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground"
            >
              <div className="h-10 w-10 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center animate-pulse">
                <IconChartDots className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Fetching channel data…</p>
                <p className="text-xs text-muted-foreground">
                  Pulling upload history and calculating consistency stats.
                </p>
              </div>
            </motion.div>
          ) : data ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConsistencyCheckerResults data={data} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground"
            >
              <div className="h-12 w-12 rounded-2xl border border-dashed border-border flex items-center justify-center">
                <IconChartDots className="h-6 w-6 opacity-30" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">No channel selected</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Search for a YouTube channel above to see detailed upload frequency and consistency analysis.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
