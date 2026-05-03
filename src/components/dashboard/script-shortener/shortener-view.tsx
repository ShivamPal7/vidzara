"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ShortenerPromptInput } from "./shortener-prompt-input"
import { ShortenerResults } from "./shortener-results"
import { generateShorts } from "./actions"
import { motion } from "framer-motion"
import { IconScissors } from "@tabler/icons-react"

export function ShortenerView() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [shorts, setShorts] = useState<any[]>([])

  const handleAnalyze = async (script: string, count: number) => {
    setIsGenerating(true)
    setShorts([])
    
    try {
      const result = await generateShorts(script, count)
      
      if (!result.success) {
        toast.error(result.error || "Failed to generate shorts")
        return
      }

      if (result.data && Array.isArray(result.data)) {
        setShorts(result.data)
        toast.success("Shorts generated successfully!")
      } else {
        toast.error("Received invalid data from AI")
      }
    } catch (error) {
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
        />
      </div>

      {/* Results Section */}
      <div className="px-2 md:px-0">
        <ShortenerResults 
          shorts={shorts} 
          isVisible={shorts.length > 0} 
        />
      </div>
    </div>
  )
}
