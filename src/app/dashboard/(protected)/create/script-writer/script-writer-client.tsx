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
import { getRecentScripts, generateScript, saveGeneratedScript } from "@/actions/script-writer"
import { DEFAULT_SCRIPT_WRITER_STATE, type ScriptWriterState } from "@/components/dashboard/script-writer/constants"

export default function ScriptWriterClient({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [usage, setUsage] = useState<UsageData>({
    used: 0,
    limit: 3,
    remaining: 3,
  })

  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt") || ""
  
  const [writerState, setWriterState] = useState<ScriptWriterState>(() => {
    if (initialData) {
      // Try to populate from initialData.input if it exists
      const parsedInput = typeof initialData.input === 'string' ? JSON.parse(initialData.input) : initialData.input || {};
      return {
        ...DEFAULT_SCRIPT_WRITER_STATE,
        prompt: parsedInput.prompt || initialPrompt,
        format: parsedInput.format || DEFAULT_SCRIPT_WRITER_STATE.format,
        duration: parsedInput.duration || DEFAULT_SCRIPT_WRITER_STATE.duration,
        tone: parsedInput.tone || DEFAULT_SCRIPT_WRITER_STATE.tone,
        language: parsedInput.language || DEFAULT_SCRIPT_WRITER_STATE.language,
      };
    }
    return {
      ...DEFAULT_SCRIPT_WRITER_STATE,
      prompt: initialPrompt
    };
  })

  const [view, setView] = useState<"initial" | "generating" | "result">(initialData ? "result" : "initial")
  
  // If initialData is provided, parse output for title
  const parsedOutput = initialData && (typeof initialData.output === 'string' ? JSON.parse(initialData.output) : initialData.output);
  const [generatedTitle, setGeneratedTitle] = useState(parsedOutput?.title || "")
  const [generatedId, setGeneratedId] = useState<string | null>(initialData?.id || null)
  const [hasReferenceVideo, setHasReferenceVideo] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const [streamedTitle, setStreamedTitle] = useState("")

  const [recentScripts, setRecentScripts] = useState<RecentScript[]>([])
  const hasRecents = recentScripts.length > 0 && view === "initial"

  useEffect(() => {
    if (initialData) {
      // If we loaded initial data, we don't necessarily want to fetch recents, but we can do usage
      getUsageData().then(setUsage).catch(console.error)
      return;
    }

    getUsageData().then(setUsage).catch(console.error)
    getRecentScripts().then((res) => {
      if (res.success && res.data) {
        setRecentScripts(res.data)
      }
    }).catch(console.error)
  }, [initialData])

  const handleSubmit = async (state: ScriptWriterState) => {
    setGeneratedTitle(state.prompt || "Untitled Script")
    setHasReferenceVideo(state.tone?.startsWith("Reference: ") ?? false)
    setStreamedContent("")
    setStreamedTitle("")
    setView("generating")
    setGeneratedId(null)

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: state.prompt,
          format: state.format,
          duration: state.duration,
          tone: state.tone,
          language: state.language,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported by response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      const parseStreamedText = (text: string) => {
        let title = "";
        let suggestions: string[] = [];
        let content = "";

        const titleIndex = text.indexOf("===TITLE===");
        const suggestionsIndex = text.indexOf("===SUGGESTIONS===");
        const scriptIndex = text.indexOf("===SCRIPT===");

        if (titleIndex !== -1) {
          const start = titleIndex + "===TITLE===".length;
          const end = suggestionsIndex !== -1 ? suggestionsIndex : text.length;
          title = text.slice(start, end).trim();
        }

        if (suggestionsIndex !== -1) {
          const start = suggestionsIndex + "===SUGGESTIONS===".length;
          const end = scriptIndex !== -1 ? scriptIndex : text.length;
          const suggestionsBlock = text.slice(start, end).trim();
          suggestions = suggestionsBlock
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }

        if (scriptIndex !== -1) {
          const start = scriptIndex + "===SCRIPT===".length;
          content = text.slice(start).trim();
        }

        return { title, suggestions, content };
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });
        const parsed = parseStreamedText(accumulatedText);
        
        if (parsed.title) {
          setStreamedTitle(parsed.title);
          setGeneratedTitle(parsed.title);
        }
        if (parsed.content) {
          let cleanContent = parsed.content;
          if (cleanContent.endsWith("===")) {
            cleanContent = cleanContent.slice(0, -3);
          }
          setStreamedContent(cleanContent);
        }
      }

      const finalParsed = parseStreamedText(accumulatedText);
      const scriptTitle = finalParsed.title || state.prompt || "Untitled Script";
      const scriptContent = finalParsed.content || accumulatedText;
      const suggestions = finalParsed.suggestions.length === 3 
        ? finalParsed.suggestions 
        : ["Make the hook shorter", "Add a cliffhanger ending", "Use simpler words"];

      const saveRes = await saveGeneratedScript({
        prompt: state.prompt,
        format: state.format,
        duration: state.duration,
        tone: state.tone,
        language: state.language,
        title: scriptTitle,
        content: scriptContent,
        refinementSuggestions: suggestions,
      });

      if (!saveRes.success) {
        throw new Error(saveRes.error || "Failed to save script to database.");
      }

      setGeneratedId(saveRes.generationId);
      setView("result");
      getRecentScripts().then((res) => {
        if (res.success && res.data) {
          setRecentScripts(res.data);
        }
      }).catch(console.error);
    } catch (error: any) {
      console.error("Failed to generate script:", error);
      setView("initial");
      toast.error(error.message || "An unexpected error occurred. Please try again.");
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
            streamedContent={streamedContent}
            streamedTitle={streamedTitle}
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
