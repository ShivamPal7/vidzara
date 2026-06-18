"use client";

import { useState } from "react";
import { HookDetectorInput } from "./hook-detector-input";
import { HookDetectorResults } from "./hook-detector-results";
import { HookDetectorResult } from "./types";
import { generateHookAnalysis } from "@/actions/hook-detector";
import { toast } from "sonner";
import { IconFishHook } from "@tabler/icons-react";
import { motion } from "framer-motion";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getGenerationById } from "@/actions/get-generation";
import { safeJsonParse } from "@/components/dashboard/history/history-utils";

function normalizeHookResult(parsedOutput: any): HookDetectorResult | null {
  if (!parsedOutput) return null;
  if (typeof parsedOutput !== "object") return null;

  const legacyRating = parsedOutput.rating;
  const legacyAnalysis = parsedOutput.analysis;
  const legacyImprovedHooks = parsedOutput.improvedHooks;

  const status = (parsedOutput.status || (legacyRating ? String(legacyRating).toUpperCase() : "WEAK")) as "WEAK" | "AVERAGE" | "STRONG";
  const explanation = parsedOutput.explanation || legacyAnalysis || "";
  let suggestions = parsedOutput.suggestions || [];

  if (suggestions.length === 0 && Array.isArray(legacyImprovedHooks)) {
    suggestions = legacyImprovedHooks.map((h: any) => {
      if (typeof h === "string") {
        return { rewrite: h, reason: "Alternative improved hook." };
      }
      return h;
    });
  }

  return {
    status,
    explanation,
    suggestions,
  };
}

import { useCredits } from "@/components/dashboard/credits-provider";
import { getCreditCost } from "@/lib/credits";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export function HookDetectorClient({ initialData }: { initialData?: any }) {
  const { credits, openCreditGate, deductCreditsLocal } = useCredits();
  const searchParams = useSearchParams();
  const generationId = searchParams.get("generationId");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [results, setResults] = useState<HookDetectorResult | null>(null);

  useEffect(() => {
    async function loadHistoryData() {
      if (!generationId) return;
      setIsLoadingHistory(true);
      try {
        const res = await getGenerationById(generationId);
        if (res.success && res.data) {
          const parsedInput = safeJsonParse(res.data.input);
          const parsedOutput = safeJsonParse(res.data.output);
          
          setInitialPrompt(parsedInput?.script || "");
          setResults(normalizeHookResult(parsedOutput));
        } else {
          toast.error("Failed to load historical generation details.");
        }
      } catch (err) {
        console.error("Error loading historical generation", err);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadHistoryData();
  }, [generationId]);

  const handleAnalyze = async (content: string) => {
    const cost = getCreditCost(Feature.HOOK_DETECTOR, {
      format: content.length > 500 ? "long" : "shorts"
    });

    if (credits !== null && credits < cost) {
      openCreditGate("Hook Failure Detector", cost);
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    deductCreditsLocal(cost);

    try {
      const result = await generateHookAnalysis({ script: content });
      
      if (!result.success || !result.data) {
        deductCreditsLocal(-cost);
        toast.error(result.error || "Failed to analyze hook.");
        return;
      }

      setResults(normalizeHookResult(result.data));
      toast.success("Analysis complete!");
      
    } catch (error) {
      deductCreditsLocal(-cost);
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
          initialPrompt={initialPrompt}
        />
      </div>

      {/* Results Section */}
      <div className="px-2 md:px-0">
        <HookDetectorResults 
          results={results} 
          isVisible={!!results || isLoadingHistory} 
          isLoading={isLoadingHistory}
        />
      </div>
    </div>
  );
}
