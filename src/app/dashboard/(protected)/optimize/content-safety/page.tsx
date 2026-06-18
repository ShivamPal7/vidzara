"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getGenerationById } from "@/actions/get-generation";
import { ContentSafetyHeader } from "@/components/dashboard/content-safety/content-safety-header";
import { ContentSafetyInput } from "@/components/dashboard/content-safety/content-safety-input";
import { ContentSafetyResults } from "@/components/dashboard/content-safety/content-safety-results";
import { ContentSafetyResult } from "@/components/dashboard/content-safety/types";
import { ShieldCheck } from "lucide-react";
import { generateContentSafety } from "@/actions/content-safety";
import { toast } from "sonner";
import { safeJsonParse } from "@/components/dashboard/history/history-utils";

import { useCredits } from "@/components/dashboard/credits-provider";
import { getCreditCost } from "@/lib/credits";
import { Feature } from "../../../../../../prisma/generated/prisma/enums";

function normalizeContentSafetyResult(parsedOutput: any): ContentSafetyResult | null {
  if (!parsedOutput) return null;
  if (typeof parsedOutput !== "object") return null;

  const score = parsedOutput.score !== undefined 
    ? parsedOutput.score 
    : (parsedOutput.confidenceScore !== undefined 
        ? Math.round(parsedOutput.confidenceScore) 
        : (parsedOutput.isSafe ? 100 : 40));
        
  const summary = parsedOutput.summary || parsedOutput.reasoning || "Content safety check complete.";
  const highlights = parsedOutput.highlights || (parsedOutput.flaggedCategories && Array.isArray(parsedOutput.flaggedCategories)
    ? parsedOutput.flaggedCategories.map((cat: string) => ({
        text: `Potentially flagged content in category: ${cat}`,
        reason: "Identified during initial safety analysis.",
        type: "policy" as const,
      }))
    : []);
    
  const suggestions = parsedOutput.suggestions || [];

  return {
    score,
    summary,
    highlights,
    suggestions,
  };
}

export default function ContentSafetyPage() {
  const { credits, openCreditGate, deductCreditsLocal } = useCredits();
  const searchParams = useSearchParams();
  const generationId = searchParams.get("generationId");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [result, setResult] = useState<ContentSafetyResult | null>(null);

  useEffect(() => {
    async function loadHistoryData() {
      if (!generationId) return;
      setIsLoadingHistory(true);
      try {
        const res = await getGenerationById(generationId);
        if (res.success && res.data) {
          const parsedInput = safeJsonParse(res.data.input);
          const parsedOutput = safeJsonParse(res.data.output);
          
          setInitialPrompt(parsedInput?.content || "");
          setResult(normalizeContentSafetyResult(parsedOutput));
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
    const cost = getCreditCost(Feature.CONTENT_SAFETY, {
      format: content.length > 2000 ? "long" : "shorts"
    });

    if (credits !== null && credits < cost) {
      openCreditGate("Content Safety Checker", cost);
      return;
    }

    setIsAnalyzing(true);
    setResult(null); // Clear previous result to show skeleton
    
    try {
      const response = await generateContentSafety({ content });
      
      if (response.success && response.data) {
        deductCreditsLocal(cost);
        setResult(normalizeContentSafetyResult(response.data));
      } else {
        toast.error(response.error || "Failed to analyze content");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showSkeleton = isAnalyzing || isLoadingHistory;

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-5xl mx-auto py-8 px-2 sm:px-6 lg:px-8 space-y-8">
        
        <ContentSafetyHeader />
        
        <ContentSafetyInput 
          onAnalyze={handleAnalyze} 
          isAnalyzing={isAnalyzing} 
          initialPrompt={initialPrompt}
        />
        
        {(result || showSkeleton) ? (
          <ContentSafetyResults result={result || undefined} isLoading={showSkeleton} />
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
             <div className="p-4 bg-muted rounded-full">
               <ShieldCheck className="w-12 h-12 text-muted-foreground" />
             </div>
             <div>
               <h3 className="text-lg font-medium text-muted-foreground">Ready to analyze</h3>
               <p className="text-sm text-muted-foreground max-w-sm mx-auto">Paste your script, title, or tags above to check for policy violations and algorithm risks.</p>
             </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
