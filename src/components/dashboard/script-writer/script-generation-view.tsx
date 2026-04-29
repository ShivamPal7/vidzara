"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScriptGenerationViewProps {
  isGenerating: boolean
  title?: string
  className?: string
  onViewScript?: () => void
}

interface Step {
  id: number
  loadingMessages: string[]
  completedMessage: string
}

const STEPS: Step[] = [
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
      "Refining tone and flow",
      "Polishing final script",
    ],
    completedMessage: "Script generation complete",
  },
]

export function ScriptGenerationView({
  isGenerating,
  title,
  className,
  onViewScript,
}: ScriptGenerationViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0)
      setCurrentMessageIndex(0)
      setCompletedSteps([])
      return
    }

    const currentStep = STEPS[currentStepIndex]
    if (!currentStep) return

    const timer = setTimeout(() => {
      if (currentMessageIndex < currentStep.loadingMessages.length - 1) {
        // Advance to next loading message in the same step
        setCurrentMessageIndex((prev) => prev + 1)
      } else {
        // Finished all loading messages for this step
        setCompletedSteps((prev) => [...prev, currentStep.id])

        // Advance to the next step if there is one
        if (currentStepIndex < STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1)
          setCurrentMessageIndex(0)
        }
      }
    }, 1200) // 1.2s per message for a more natural pace

    return () => clearTimeout(timer)
  }, [isGenerating, currentStepIndex, currentMessageIndex])

  return (
    <div className={cn("w-full space-y-6", className)}>
      {isGenerating ? (
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-3">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id)
              const isActive = idx === currentStepIndex && !isCompleted
              const isPending = idx > currentStepIndex

              if (isPending) return null

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {isCompleted ? (
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
                      isCompleted ? "text-foreground/70" : "text-foreground"
                    )}
                  >
                    {isCompleted
                      ? step.completedMessage
                      : step.loadingMessages[currentMessageIndex]}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
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
      )}
    </div>
  )
}
