"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ArrowUp, Loader2 } from "lucide-react"
import { refineScript } from "@/actions/script-writer"

interface ScriptRefineSidebarProps {
  generationId?: string
  currentContent?: string
  suggestions?: string[]
}

export function ScriptRefineSidebar({ generationId, currentContent, suggestions = [] }: ScriptRefineSidebarProps) {
  const [prompt, setPrompt] = useState("")
  const [isRefining, setIsRefining] = useState(false)

  const defaultSuggestions = [
    "Make hook punchier",
    "Add more drama",
    "Summarize outro"
  ]
  const displaySuggestions = suggestions?.length === 3 ? suggestions : defaultSuggestions;

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

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Suggestions */}
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 sm:p-5 flex flex-col gap-3">
        <h3 className="font-semibold text-foreground text-sm">Suggestions</h3>
        <ul className="flex flex-col gap-2">
          {displaySuggestions.map((suggestion, i) => (
            <li key={i}>
              <button 
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-[14px] text-muted-foreground hover:text-primary text-left w-full transition-colors leading-snug"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Refine Input */}
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 flex flex-col min-h-[160px] h-[200px] relative">
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Refine your script..."
          className="w-full h-full resize-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
        <div className="absolute bottom-4 left-4">
          <button 
            onClick={handleRefine}
            disabled={isRefining || !prompt.trim()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors"
          >
            {isRefining ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowUp className="size-3.5" strokeWidth={2.5} />}
            {isRefining ? "Refining..." : "Refine"}
          </button>
        </div>
      </div>
    </div>
  )
}
