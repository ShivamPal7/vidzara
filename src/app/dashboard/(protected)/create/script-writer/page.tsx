"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { ScriptSuggestions } from "@/components/dashboard/script-writer/script-suggestions"
import { ScriptPromptInput } from "@/components/dashboard/script-writer/script-prompt-input"
import {
  RecentScripts,
  type RecentScript,
} from "@/components/dashboard/script-writer/recent-scripts"
import { ScriptGenerationView } from "@/components/dashboard/script-writer/script-generation-view"
import { getUsageData, type UsageData } from "@/actions/usage"
import { getRecentScripts, generateScript } from "@/actions/script-writer"
import { DEFAULT_SCRIPT_WRITER_STATE, type ScriptWriterState } from "@/components/dashboard/script-writer/constants"

export default function ScriptWriterPage() {
  const router = useRouter()
  const [usage, setUsage] = useState<UsageData>({
    used: 0,
    limit: 3,
    remaining: 3,
  })

  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt") || ""
  
  const [writerState, setWriterState] = useState<ScriptWriterState>({
    ...DEFAULT_SCRIPT_WRITER_STATE,
    prompt: initialPrompt
  })
  const [view, setView] = useState<"initial" | "generating" | "result">("initial")
  const [generatedTitle, setGeneratedTitle] = useState("")
  const [generatedId, setGeneratedId] = useState<string | null>(null)
  const [hasReferenceVideo, setHasReferenceVideo] = useState(false)

  const [recentScripts, setRecentScripts] = useState<RecentScript[]>([])
  const hasRecents = recentScripts.length > 0 && view === "initial"

  useEffect(() => {
    getUsageData().then(setUsage).catch(console.error)
    getRecentScripts().then((res) => {
      if (res.success && res.data) {
        setRecentScripts(res.data)
      }
    }).catch(console.error)
  }, [])

  const handleSubmit = async (state: ScriptWriterState) => {
    setGeneratedTitle(state.prompt || "Untitled Script")
    setHasReferenceVideo(state.tone?.startsWith("Reference: ") ?? false)
    setView("generating")
    setGeneratedId(null)

    try {
      const res = await generateScript({
        prompt: state.prompt,
        format: state.format,
        duration: state.duration,
        tone: state.tone,
        language: state.language,
      })

      if (res.success && res.generationId) {
        setGeneratedId(res.generationId)
        setView("result")
      } else {
        console.error(res.error)
        setView("initial")
        toast.error(res.error || "Failed to generate your script.")
      }
    } catch (error) {
      console.error("Failed to generate script:", error)
      setView("initial")
      toast.error("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full relative">
      {/* Main content — centered when no recents/viewing initial, top-aligned otherwise */}
      <div
        className={`flex-1 flex flex-col w-full gap-6 sm:gap-10 px-2 sm:px-4 md:px-8 max-w-4xl mx-auto pb-24 ${
          hasRecents || view !== "initial"
            ? "justify-start pt-4 sm:pt-8"
            : "items-center justify-center"
        }`}
      >
        {/* Heading — only in initial view with no recents */}
        {view === "initial" && !hasRecents && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
              Script Writer
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Generate high-retention scripts for YouTube, Shorts, and Instagram
              Reels.
            </p>
          </motion.div>
        )}

        {/* Content Area */}
        {view !== "initial" ? (
          <ScriptGenerationView
            isGenerating={view === "generating"}
            title={generatedTitle}
            hasReferenceVideo={hasReferenceVideo}
            onViewScript={() => generatedId && router.push(`/dashboard/create/script-writer/${generatedId}`)}
          />
        ) : hasRecents ? (
          <RecentScripts scripts={recentScripts} />
        ) : (
          <ScriptSuggestions onSelect={(prompt) => setWriterState({ ...writerState, prompt })} />
        )}
      </div>

      {/* Bottom input — floating at the bottom */}
      <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 md:px-8 pb-1 sm:pb-4 pt-2 sticky bottom-0 z-20">
        <ScriptPromptInput 
          usage={usage} 
          state={writerState}
          onStateChange={setWriterState}
          onSubmit={handleSubmit} 
        />
      </div>
    </div>
  )
}
