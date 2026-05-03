"use client";

import { useState } from "react";
import { HookDetectorInput } from "./hook-detector-input";
import { HookDetectorResults } from "./hook-detector-results";
import { HookDetectorResult } from "./types";
import { generateHookAnalysis } from "@/actions/hook-detector";
import { toast } from "sonner";
import { IconFishHook } from "@tabler/icons-react";
import { motion } from "framer-motion";

export function   HookDetectorClient() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<HookDetectorResult | null>(null);

  const handleAnalyze = async (content: string) => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const result = await generateHookAnalysis({ script: content });
      
      if (!result.success || !result.data) {
        toast.error(result.error || "Failed to analyze hook.");
        return;
      }

      setResults(result.data as HookDetectorResult);
      toast.success("Analysis complete!");
      
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full space-y-8 pb-12 w-full max-w-5xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center space-y-4 py-8"
      >
        <div className="bg-primary/10 p-4 rounded-2xl">
          <IconFishHook className="size-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Hook Detector
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Analyze the first 3-5 seconds of your video script. Ensure you have a strong hook to maximize viewer retention.
          </p>
        </div>
      </motion.div>

      {/* Input Section */}
      <div className="px-2 md:px-0">
        <HookDetectorInput 
          onAnalyze={handleAnalyze} 
          isAnalyzing={isAnalyzing} 
        />
      </div>

      {/* Results Section */}
      <div className="px-2 md:px-0">
        <HookDetectorResults 
          results={results} 
          isVisible={!!results} 
        />
      </div>
    </div>
  );
}
