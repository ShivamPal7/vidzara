"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getGenerationById } from "@/actions/get-generation"
import { toast } from "sonner"
import { ShortenerPromptInput } from "./shortener-prompt-input"
import { ShortenerResults } from "./shortener-results"
import { generateShorts } from "./actions"
import { motion } from "framer-motion"
import { IconScissors } from "@tabler/icons-react"

import { useCredits } from "@/components/dashboard/credits-provider"
import { getCreditCost } from "@/lib/credits"
import { Feature } from "../../../../prisma/generated/prisma/enums"

export function ShortenerView() {
  const { credits, openCreditGate, deductCreditsLocal } = useCredits()
  const searchParams = useSearchParams()
  const generationId = searchParams.get("generationId")

  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState("")
  const [shorts, setShorts] = useState<any[]>([])

  useEffect(() => {
    async function loadHistoryData() {
      if (!generationId) return;
      setIsLoadingHistory(true);
      try {
        const res = await getGenerationById(generationId);
        if (res.success && res.data) {
          let parsedInput = res.data.input;
          if (typeof parsedInput === 'string') {
            try {
              parsedInput = JSON.parse(parsedInput);
            } catch (e) {
              // Plain text input
            }
          }

          let parsedOutput = res.data.output;
          if (typeof parsedOutput === 'string') {
            try {
              parsedOutput = JSON.parse(parsedOutput);
            } catch (e) {
              // Plain text or unparsable output
            }
          }
          
          const promptText = typeof parsedInput === 'string' 
            ? parsedInput 
            : (parsedInput && typeof parsedInput === 'object' && 'script' in parsedInput) 
              ? (parsedInput as any).script 
              : "";
            
          setInitialPrompt(promptText);
          const shortsArray = Array.isArray(parsedOutput) 
            ? parsedOutput 
            : (parsedOutput && typeof parsedOutput === 'object' && 'shorts' in parsedOutput)
              ? (parsedOutput as any).shorts
              : [];
          setShorts(shortsArray);
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

  const handleAnalyze = async (script: string, count: number) => {
    const cost = getCreditCost(Feature.SCRIPT_SHORTENER, { count });

    if (credits !== null && credits < cost) {
      openCreditGate("Script Shortener", cost);
      return;
    }

    setIsGenerating(true)
    setShorts([])
    deductCreditsLocal(cost)
    
    try {
      const result = await generateShorts(script, count)
      
      if (!result.success) {
        deductCreditsLocal(-cost)
        toast.error(result.error || "Failed to generate shorts")
        return
      }

      const shortsArray = result.data && typeof result.data === 'object' && 'shorts' in result.data
        ? (result.data as any).shorts
        : Array.isArray(result.data) ? result.data : null;

      if (shortsArray && Array.isArray(shortsArray)) {
        setShorts(shortsArray)
        toast.success("Shorts generated successfully!")
      } else {
        deductCreditsLocal(-cost)
        toast.error("Received invalid data from AI")
      }
    } catch (error) {
      deductCreditsLocal(-cost)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

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
          <IconScissors className="size-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Script Shortener
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Extract engaging shorts from your long-form video scripts. Select how many shorts you want and we'll do the rest.
          </p>
        </div>
      </motion.div>

      {/* Input Section */}
      <div className="px-2 md:px-0">
        <ShortenerPromptInput 
          onAnalyze={handleAnalyze} 
          isAnalyzing={isGenerating} 
          initialPrompt={initialPrompt}
        />
      </div>

      {/* Results Section */}
      <div className="px-2 md:px-0">
        <ShortenerResults 
          shorts={shorts} 
          isVisible={shorts.length > 0 || isLoadingHistory} 
          isLoading={isLoadingHistory}
        />
      </div>
    </div>
  )
}
