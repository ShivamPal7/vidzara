"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Loader2, Check, HelpCircle, Sparkles, ArrowRight, Pencil, ChevronLeft, ChevronRight, X } from "lucide-react"
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
import { useCredits } from "@/components/dashboard/credits-provider"
import { Feature } from "../../../../../../prisma/generated/prisma/enums"
import { getCreditCost } from "@/lib/credits"

export default function ScriptWriterClient({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const { credits, openCreditGate, deductCreditsLocal } = useCredits()
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

  // Core view state
  const [view, setView] = useState<"initial" | "generating" | "result">(initialData ? "result" : "initial")
  
  // Q&A dynamic states
  const [questionFlowState, setQuestionFlowState] = useState<"idle" | "generating-questions" | "asking" | "loading-steps" | "completed">("idle")
  const [clarifyingQuestions, setClarifyingQuestions] = useState<Array<{ id: string; question: string; options: string[] }>>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [submittedState, setSubmittedState] = useState<ScriptWriterState | null>(null)
  
  // Custom text answer fields
  const [isCustomEditing, setIsCustomEditing] = useState(false)
  const [customAnswerText, setCustomAnswerText] = useState("")

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

  // Triggers when user presses enter or clicks send
  const handleSubmit = async (state: ScriptWriterState) => {
    const cost = getCreditCost(Feature.SCRIPT_WRITER, {
      format: state.format,
      duration: state.duration,
    })

    if (credits !== null && credits < cost) {
      openCreditGate("Script Writer", cost);
      return;
    }

    // Preserve the original prompt and configuration parameters
    setSubmittedState(state)
    setGeneratedTitle(state.prompt || "Untitled Script")
    setHasReferenceVideo(state.tone?.startsWith("Reference: ") ?? false)
    setStreamedContent("")
    setStreamedTitle("")
    setGeneratedId(null)
    setSelectedAnswers({})
    setCurrentQuestionIdx(0)
    setIsCustomEditing(false)
    setCustomAnswerText("")

    // Transition main view to generating (loading steps)
    setView("generating")
    setQuestionFlowState("generating-questions")

    try {
      const res = await fetch("/api/generate-script/questions", {
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

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate clarifying questions.");
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setClarifyingQuestions(data.questions);
        setQuestionFlowState("asking");
      } else {
        // Fallback to direct script generation
        handleGenerateScript(state, []);
      }
    } catch (error: any) {
      console.error("Failed to generate questions:", error);
      toast.error(error.message || "Could not customize questions. Generating default script...");
      // Fallback to direct script generation
      handleGenerateScript(state, []);
    }
  }

  const handleSelectAnswer = (qId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: answer }))
    
    // Auto advance after small visual selection confirmation delay
    setTimeout(() => {
      if (currentQuestionIdx < clarifyingQuestions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1)
        setIsCustomEditing(false)
        setCustomAnswerText("")
      } else {
        // Last question completed, submit answers
        const answersArray = clarifyingQuestions.map((q) => ({
          question: q.question,
          answer: q.id === qId ? answer : (selectedAnswers[q.id] || "Skipped"),
        }))
        handleGenerateScript(submittedState || writerState, answersArray)
      }
    }, 200)
  }

  const handleSkipQuestion = () => {
    const qId = clarifyingQuestions[currentQuestionIdx]?.id
    if (qId) {
      setSelectedAnswers((prev) => ({ ...prev, [qId]: "Skipped" }))
    }
    
    if (currentQuestionIdx < clarifyingQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1)
      setIsCustomEditing(false)
      setCustomAnswerText("")
    } else {
      // Last question skipped, submit answers
      const answersArray = clarifyingQuestions.map((q) => ({
        question: q.question,
        answer: q.id === qId ? "Skipped" : (selectedAnswers[q.id] || "Skipped"),
      }))
      handleGenerateScript(submittedState || writerState, answersArray)
    }
  }

  const handleGenerateScript = async (state: ScriptWriterState, answers: Array<{ question: string; answer: string }>) => {
    setQuestionFlowState("loading-steps")
    const activeState = state || submittedState || writerState

    const cost = getCreditCost(Feature.SCRIPT_WRITER, {
      format: activeState.format,
      duration: activeState.duration,
    })

    deductCreditsLocal(cost)

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: activeState.prompt,
          format: activeState.format,
          duration: activeState.duration,
          tone: activeState.tone,
          language: activeState.language,
          answers,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

      let chunkTimeoutId: NodeJS.Timeout | null = null;
      const resetChunkTimeout = () => {
        if (chunkTimeoutId) clearTimeout(chunkTimeoutId);
        chunkTimeoutId = setTimeout(() => {
          controller.abort();
        }, 45000); // 45s mid-stream idle watchdog timeout
      };

      resetChunkTimeout();

      let isStreamingStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resetChunkTimeout();
        accumulatedText += decoder.decode(value, { stream: true });
        const parsed = parseStreamedText(accumulatedText);
        
        if (parsed.content) {
          if (!isStreamingStarted) {
            setQuestionFlowState("completed")
            isStreamingStarted = true
          }
          let cleanContent = parsed.content;
          if (cleanContent.endsWith("===")) {
            cleanContent = cleanContent.slice(0, -3);
          }
          setStreamedContent(cleanContent);
        }

        if (parsed.title) {
          setStreamedTitle(parsed.title);
          setGeneratedTitle(parsed.title);
        }
      }

      if (chunkTimeoutId) clearTimeout(chunkTimeoutId);
      setQuestionFlowState("completed")

      const finalParsed = parseStreamedText(accumulatedText);
      const scriptTitle = finalParsed.title || activeState.prompt || "Untitled Script";
      const scriptContent = finalParsed.content || accumulatedText;
      const suggestions = finalParsed.suggestions.length === 3 
        ? finalParsed.suggestions 
        : ["Make the hook shorter", "Add a cliffhanger ending", "Use simpler words"];

      const saveRes = await saveGeneratedScript({
        prompt: activeState.prompt,
        format: activeState.format,
        duration: activeState.duration,
        tone: activeState.tone,
        language: activeState.language,
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
      deductCreditsLocal(-cost) // Refund by adding them back
      console.error("Failed to generate script:", error);
      setQuestionFlowState("idle")
      setView("initial")
      const isAbort = error.name === "AbortError" || error.message?.includes("aborted");
      toast.error(isAbort
        ? "Script generation timed out (AI model took too long to respond). Please try again."
        : error.message || "An unexpected error occurred. Please try again."
      );
    }
  }

  // Map state logic to ScriptGenerationView progressive checklists
  const currentStepOverride = 
    questionFlowState === "generating-questions" ? 0 :
    questionFlowState === "asking" ? 1 :
    questionFlowState === "loading-steps" ? 2 : undefined;

  const completedStepsOverride = 
    questionFlowState === "generating-questions" ? [] :
    questionFlowState === "asking" ? [1] :
    questionFlowState === "loading-steps" ? [1, 2] : undefined;

  const activeQuestion = clarifyingQuestions[currentQuestionIdx]

  return (
    <div className="flex-1 flex flex-col justify-between w-full relative">
      {/* Main content area */}
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
              Generate high-retention scripts for YouTube, Shorts, and Instagram Reels.
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
            useDynamicFlow={true}
            currentStepOverride={currentStepOverride}
            completedStepsOverride={completedStepsOverride}
            onViewScript={() => generatedId && router.push(`/dashboard/create/script-writer/${generatedId}`)}
          />
        ) : hasRecents ? (
          <RecentScripts scripts={recentScripts} />
        ) : (
          <ScriptSuggestions onSelect={(prompt) => setWriterState({ ...writerState, prompt })} />
        )}
      </div>

      {/* Floating Bottom Q&A Card & Input Bar */}
      <div className="w-full max-w-4xl mx-auto px-1 sm:px-4 md:px-8 pb-1 sm:pb-4 pt-2 sticky bottom-0 z-20">
        <AnimatePresence>
          {/* Question Flow UI Card — exact UI/UX from the reference image */}
          {view === "generating" && questionFlowState === "asking" && activeQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="w-full bg-[#1b1b1f]/95 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl mb-3 flex flex-col gap-3 font-outfit"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-zinc-800/40 pb-2.5">
                <span className="text-[13.5px] sm:text-[14.5px] font-semibold text-zinc-100 text-left leading-snug flex-1 pr-2">
                  {activeQuestion.question}
                </span>
                <div className="flex items-center gap-3 text-[11px] sm:text-[11.5px] text-zinc-400 font-medium select-none shrink-0 pt-0.5 justify-end">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentQuestionIdx === 0}
                      onClick={() => {
                        setCurrentQuestionIdx((prev) => prev - 1)
                        setIsCustomEditing(false)
                        setCustomAnswerText("")
                      }}
                      className="hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors p-0.5"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <span>
                      {currentQuestionIdx + 1} of {clarifyingQuestions.length}
                    </span>
                    <button
                      type="button"
                      disabled={currentQuestionIdx === clarifyingQuestions.length - 1 || !selectedAnswers[activeQuestion.id]}
                      onClick={() => {
                        setCurrentQuestionIdx((prev) => prev + 1)
                        setIsCustomEditing(false)
                        setCustomAnswerText("")
                      }}
                      className="hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors p-0.5"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionFlowState("idle")
                      setView("initial")
                    }}
                    className="text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors p-0.5"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Options List */}
              <div className="flex flex-col gap-1.5 mt-0.5">
                {activeQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[activeQuestion.id] === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectAnswer(activeQuestion.id, opt)}
                      className={cn(
                        "w-full rounded-xl px-3.5 py-2.5 text-[12.5px] sm:text-[13px] font-medium border text-left transition-all duration-200 cursor-pointer flex items-center gap-3",
                        isSelected
                          ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                          : "border-transparent bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700/50 text-zinc-300 hover:text-zinc-100"
                      )}
                    >
                      <span className={cn(
                        "flex items-center justify-center size-5.5 rounded-md text-[10.5px] font-bold transition-colors shrink-0",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-zinc-400 border border-zinc-700/40"
                      )}>
                        {optIdx + 1}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {isSelected && <ArrowRight className="size-3.5 text-primary shrink-0 animate-pulse" />}
                    </button>
                  )
                })}

                {/* Custom "Something else" Option */}
                {isCustomEditing ? (
                  <div className="flex gap-2.5 items-center w-full rounded-xl px-3.5 py-2.5 border border-zinc-700/50 bg-zinc-900/50">
                    <div className="flex items-center justify-center size-5.5 rounded-md bg-primary/15 text-primary text-[10.5px] font-bold shrink-0">
                      <Pencil className="size-3" />
                    </div>
                    <input
                      type="text"
                      placeholder="Type your custom answer..."
                      value={customAnswerText}
                      onChange={(e) => setCustomAnswerText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customAnswerText.trim()) {
                          handleSelectAnswer(activeQuestion.id, customAnswerText.trim())
                          setIsCustomEditing(false)
                          setCustomAnswerText("")
                        }
                      }}
                      className="flex-1 bg-transparent text-[12.5px] sm:text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAnswerText.trim()) {
                          handleSelectAnswer(activeQuestion.id, customAnswerText.trim())
                          setIsCustomEditing(false)
                          setCustomAnswerText("")
                        }
                      }}
                      className="text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCustomEditing(true)}
                    className={cn(
                      "w-full rounded-xl px-3.5 py-2.5 text-[12.5px] sm:text-[13px] font-medium border text-left transition-all duration-200 cursor-pointer flex items-center gap-3",
                      selectedAnswers[activeQuestion.id] && !activeQuestion.options.includes(selectedAnswers[activeQuestion.id])
                        ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                        : "border-transparent bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700/50 text-zinc-300 hover:text-zinc-100"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center size-5.5 rounded-md text-[10.5px] font-bold transition-colors shrink-0",
                      selectedAnswers[activeQuestion.id] && !activeQuestion.options.includes(selectedAnswers[activeQuestion.id])
                        ? "bg-primary text-primary-foreground"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700/40"
                    )}>
                      <Pencil className="size-3" />
                    </span>
                    <span className="flex-1 leading-snug truncate text-left">
                      {selectedAnswers[activeQuestion.id] && !activeQuestion.options.includes(selectedAnswers[activeQuestion.id])
                        ? selectedAnswers[activeQuestion.id]
                        : "Something else"}
                    </span>
                    {selectedAnswers[activeQuestion.id] && !activeQuestion.options.includes(selectedAnswers[activeQuestion.id]) && (
                      <ArrowRight className="size-3.5 text-primary shrink-0" />
                    )}
                  </button>
                )}
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-800/50 select-none">
                <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
                  &uarr;&darr; to navigate &middot; Enter to select &middot; or click above
                </span>
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Input Prompt Bar (disabled during question asking) */}
        <ScriptPromptInput 
          usage={usage} 
          state={writerState}
          onStateChange={setWriterState}
          onSubmit={handleSubmit} 
          disabled={questionFlowState !== "idle" && questionFlowState !== "completed"}
        />
      </div>
    </div>
  )
}
