"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScriptGenerationViewProps {
  isGenerating: boolean
  title?: string
  className?: string
  hasReferenceVideo?: boolean
  onViewScript?: () => void
  useDynamicFlow?: boolean
  currentStepOverride?: number
  completedStepsOverride?: number[]
}

interface Step {
  id: number
  loadingMessages: string[]
  completedMessage: string
}

const DEFAULT_STEPS: Step[] = [
  {
    id: 1,
    loadingMessages: ["Sourcing top ideas", "Analyzing trends", "Gathering data"],
    completedMessage: "Topic research completed",
  },
  {
    id: 2,
    loadingMessages: [
      "Unleashing creativity",
      "Cooking up banger concepts",
      "Finding the perfect hook",
    ],
    completedMessage: "Concepts generated",
  },
  {
    id: 3,
    loadingMessages: [
      "Writing the first draft",
      "Structuring engaging hooks & transitions...",
      "Optimizing phrasing and pacing...",
      "Refining tone and flow",
      "Structuring outro and call-to-actions...",
      "Injecting viral formatting rules...",
      "Polishing final script",
      "Generating refinement suggestions...",
      "Preparing final text formatting...",
      "Almost complete, finalizing script...",
      "It will take some time, please wait...",
    ],
    completedMessage: "Script generation complete",
  },
]

const REFERENCE_STEPS: Step[] = [
  {
    id: 1,
    loadingMessages: [
      "Extracting reference video transcript",
      "Parsing audio captions",
      "Processing transcript data",
    ],
    completedMessage: "Reference transcript extracted",
  },
  {
    id: 2,
    loadingMessages: [
      "Analyzing creator's tone and style",
      "Extracting pacing structures",
      "Mapping hook techniques",
    ],
    completedMessage: "Style analysis complete",
  },
  {
    id: 3,
    loadingMessages: [
      "Sourcing top ideas",
      "Writing script in reference tone",
      "Aligning with creator's sentence rhythm...",
      "Injecting signature vocabulary patterns...",
      "Structuring hook and pacing beats...",
      "Structuring outro and call-to-actions...",
      "Polishing to match creator's vibe",
      "Generating refinement suggestions...",
      "Formatting final draft structure...",
      "Almost complete, finalizing script...",
      "It will take some time, please wait...",
    ],
    completedMessage: "Script generation complete",
  },
]

const DYNAMIC_STEPS: Step[] = [
  {
    id: 1,
    loadingMessages: ["Analyzing topic...", "Generating clarifying questions...", "Creating choices..."],
    completedMessage: "Topic analyzed & questions generated",
  },
  {
    id: 2,
    loadingMessages: ["Waiting for your choices below...", "Customizing script hook & angle...", "Applying selected preferences..."],
    completedMessage: "Script customized with answers",
  },
  {
    id: 3,
    loadingMessages: [
      "Writing the first draft",
      "Applying user question preferences...",
      "Optimizing structure based on choices...",
      "Refining hook and flow",
      "Structuring outro and call-to-actions...",
      "Formatting section headers and tags...",
      "Polishing final script content",
      "Generating refinement suggestions...",
      "Preparing final text formatting...",
      "Almost complete, finalizing script...",
      "It will take some time, please wait...",
    ],
    completedMessage: "Script generation complete",
  },
]

export function ScriptGenerationView({
  isGenerating,
  title,
  className,
  hasReferenceVideo = false,
  onViewScript,
  streamedContent = "",
  streamedTitle = "",
  useDynamicFlow = false,
  currentStepOverride,
  completedStepsOverride,
}: ScriptGenerationViewProps & { streamedContent?: string; streamedTitle?: string }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(!isGenerating)
  const wasGenerating = useRef(isGenerating)
  const scrollRef = useRef<HTMLDivElement>(null)

  const STEPS = useDynamicFlow
    ? DYNAMIC_STEPS
    : hasReferenceVideo
    ? REFERENCE_STEPS
    : DEFAULT_STEPS

  const stepIndex = currentStepOverride !== undefined ? currentStepOverride : currentStepIndex
  const compSteps = completedStepsOverride !== undefined ? completedStepsOverride : completedSteps

  // Reset message index when active step changes
  useEffect(() => {
    setCurrentMessageIndex(0)
  }, [stepIndex])

  // Auto-scroll the live preview container to the bottom as content streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedContent])

  // When the stream starts (first token received), immediately complete Step 1 and Step 2 if not overriden
  useEffect(() => {
    if ((streamedTitle || streamedContent) && currentStepOverride === undefined) {
      setCompletedSteps((prev) => {
        const next = [...prev];
        if (!next.includes(1)) next.push(1);
        if (!next.includes(2)) next.push(2);
        return next;
      });
      setCurrentStepIndex(2); // Set active step to Step 3 ("Writing script")
    }
  }, [streamedTitle, streamedContent, currentStepOverride]);

  // Detect when generation finishes: isGenerating flips false after being true
  useEffect(() => {
    if (wasGenerating.current && !isGenerating) {
      // Mark all steps as completed, then show the done UI
      setCompletedSteps(STEPS.map((s) => s.id))
      const finishTimer = setTimeout(() => {
        setIsCompleted(true)
      }, 600)
      return () => clearTimeout(finishTimer)
    }
    wasGenerating.current = isGenerating
  }, [isGenerating, STEPS])

  // Reset everything when a new generation starts
  useEffect(() => {
    if (isGenerating) {
      setCurrentStepIndex(0)
      setCurrentMessageIndex(0)
      setCompletedSteps([])
      setIsCompleted(false)
      wasGenerating.current = true
    }
  }, [isGenerating])

  useEffect(() => {
    if (!isGenerating) return

    const currentStep = STEPS[stepIndex]
    if (!currentStep) return

    // Freeze Step 2 messages while user is answering questions
    if (stepIndex === 1 && currentStepOverride !== undefined) {
      setCurrentMessageIndex(0)
      return
    }

    const timer = setTimeout(() => {
      if (currentMessageIndex < currentStep.loadingMessages.length - 1) {
        // Advance to next loading message in the same step
        setCurrentMessageIndex((prev) => prev + 1)
      } else {
        const isLastStep = stepIndex === STEPS.length - 1

        if (isLastStep) {
          // Don't cycle back to 0. Just stay on the last message
        } else if (currentStepOverride === undefined) {
          // Finished all loading messages for this step — mark it done
          setCompletedSteps((prev) => [...prev, currentStep.id])
          setCurrentStepIndex((prev) => prev + 1)
          setCurrentMessageIndex(0)
        }
      }
    }, 1200) // 1.2s per message for a more natural pace

    return () => clearTimeout(timer)
  }, [isGenerating, stepIndex, currentMessageIndex, STEPS, currentStepOverride])

  return (
    <div className={cn("w-full space-y-6", className)}>
      {isCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-left"
        >
          {/* AI Response Message */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            I've crafted a comprehensive script for your video titled{" "}
            <span className="text-foreground font-medium">"{title}"</span>. You
            can review the structure, hook, and full content below. Let me know
            if you'd like any refinements!
          </p>

          {/* Script Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={onViewScript}
            className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-5 flex items-center gap-4 cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FileText className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {title || "Untitled Script"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ready for review • Video Script
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="space-y-6 py-4 text-left">
          <div className="flex flex-col gap-3">
            {STEPS.map((step, idx) => {
              const isStepCompleted = compSteps.includes(step.id)
              const isActive = idx === stepIndex && !isStepCompleted
              const isPending = idx > stepIndex && !isStepCompleted

              if (isPending) return null

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {isStepCompleted ? (
                    <div className="flex items-center justify-center size-5 text-emerald-500">
                      <Check className="size-4" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center size-5 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  )}
                  <span
                    className={cn(
                      "text-[15px] font-medium transition-colors duration-300",
                      isStepCompleted ? "text-foreground/70" : "text-foreground"
                    )}
                  >
                    {isStepCompleted
                      ? step.completedMessage
                      : step.loadingMessages[Math.min(currentMessageIndex, step.loadingMessages.length - 1)]}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {/* Real-time streaming content preview (Thought Block / Preview) */}
          {(stepIndex === 2 || streamedTitle || streamedContent) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/40 bg-zinc-950/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner"
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  {streamedContent ? "Writing Script..." : "Planning Script..."}
                </div>
                {streamedTitle && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[350px] font-medium">
                    {streamedTitle}
                  </span>
                )}
              </div>
              <div 
                ref={scrollRef}
                className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-outfit max-h-[250px] overflow-y-auto pr-1 space-y-3 prose prose-invert select-none scroll-smooth"
              >
                {streamedContent ? (
                  <div dangerouslySetInnerHTML={{ __html: streamedContent }} />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse py-2">
                    <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                    <span>Structuring script hook, outline, and suggestions...</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
