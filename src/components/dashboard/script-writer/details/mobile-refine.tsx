"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowUp, Loader2 } from "lucide-react"
import { refineScript } from "@/actions/script-writer"

interface MobileRefineProps {
  generationId?: string
  currentContent?: string
}

export function MobileRefine({ generationId, currentContent }: MobileRefineProps) {
  const [prompt, setPrompt] = useState("")
  const [isRefining, setIsRefining] = useState(false)

  const suggestions = [
    "Make it sound like MrBeast",
    "Shorten this script",
    "Use more analogies"
  ]

  const handleRefine = async () => {
    if (!prompt.trim() || !generationId || !currentContent || isRefining) return
    
    setIsRefining(true)
    try {
      const res = await refineScript({
        generationId,
        content: currentContent,
        prompt: prompt.trim()
      })
      if (res.success) {
        setPrompt("")
        toast.success("Script refined successfully!")
      } else {
        toast.error(res.error || "Failed to refine your script.")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleRefine()
    }
  }

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-md mx-auto">
      {/* Suggestion chips */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide hide-scrollbar">
        {suggestions.map((suggestion, i) => (
          <button 
            key={i} 
            onClick={() => setPrompt(suggestion)}
            className="whitespace-nowrap rounded-full border border-border/40 bg-card/80 backdrop-blur-md px-3.5 py-1.5 text-[13px] font-medium text-foreground/80 hover:bg-muted/80 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      {/* Input */}
      <div className="relative rounded-full border border-border/40 bg-card/90 backdrop-blur-xl shadow-lg flex items-center pr-1.5 pl-4 py-1.5">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Refine your script..." 
          className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        <button 
          onClick={handleRefine}
          disabled={isRefining || !prompt.trim()}
          className="bg-blue-600 flex items-center justify-center size-8 rounded-full text-white shrink-0 hover:bg-blue-700 disabled:bg-blue-600/50 transition-colors shadow-sm ml-2"
        >
          {isRefining ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  )
}
