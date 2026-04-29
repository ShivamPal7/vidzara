"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Mic, Sparkles, Youtube, Clock, Globe } from "lucide-react"
import { ChipPopover } from "@/components/dashboard/shared/chip-popover"
import { TonePopover } from "@/components/dashboard/shared/tone-popover"
import {
  FORMAT_OPTIONS,
  LONG_DURATION_OPTIONS,
  SHORT_DURATION_OPTIONS,
  LANGUAGE_OPTIONS,
  DEFAULT_SCRIPT_WRITER_STATE,
  type ScriptWriterState,
} from "./constants"

const MAX_CHARS = 4000

interface ScriptPromptInputProps {
  className?: string
  usage: {
    used: number
    limit: number
    remaining: number
  }
  state: ScriptWriterState
  onStateChange: (state: ScriptWriterState) => void
  onSubmit?: (state: ScriptWriterState) => void
}

export function ScriptPromptInput({ className, usage, state, onStateChange, onSubmit }: ScriptPromptInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasText = state.prompt.length > 0

  const handleSubmit = () => {
    if (!hasText) return
    onSubmit?.(state)
    onStateChange({ ...state, prompt: "" })
  }

  // When format changes, reset duration to sensible default
  useEffect(() => {
    if (state.format === "short" && !SHORT_DURATION_OPTIONS.find((o) => o.value === state.duration)) {
      onStateChange({ ...state, duration: "1" })
    }
    if (state.format === "long" && !LONG_DURATION_OPTIONS.find((o) => o.value === state.duration)) {
      onStateChange({ ...state, duration: "10" })
    }
  }, [state.format, state.duration, state, onStateChange])

  // SVG circular progress for usage
  const radius = 17
  const strokeWidth = 2.5
  const circumference = 2 * Math.PI * radius
  const progress = usage.limit > 0 ? usage.remaining / usage.limit : 0
  const strokeDashoffset = circumference * (1 - progress)

  const durationOptions =
    state.format === "short" ? SHORT_DURATION_OPTIONS : LONG_DURATION_OPTIONS

  const update = <K extends keyof ScriptWriterState>(
    key: K,
    value: ScriptWriterState[K]
  ) => onStateChange({ ...state, [key]: value })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300",
          isFocused && "border-primary/50 shadow-[0_0_20px_-4px] shadow-primary/15"
        )}
      >
        {/* Textarea */}
        <div className="px-3 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3">
          <textarea
            ref={textareaRef}
            value={state.prompt}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                update("prompt", e.target.value)
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="What's your video about?"
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent text-sm sm:text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none"
            )}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-2.5 sm:px-4 pb-3 sm:pb-4 pt-0.5 sm:pt-1">
          {/* Left — option chips */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Format: Long / Short */}
            <ChipPopover
              icon={state.format === "short" ? FORMAT_OPTIONS[1].icon : Youtube}
              options={FORMAT_OPTIONS}
              value={state.format}
              onChange={(v) => update("format", v)}
            />

            {/* Duration */}
            <ChipPopover
              icon={Clock}
              options={durationOptions}
              value={state.duration}
              onChange={(v) => update("duration", v)}
            />

            {/* Tone */}
            <TonePopover
              value={state.tone}
              onChange={(v) => update("tone", v)}
            />

            {/* Language */}
            <ChipPopover
              icon={Globe}
              options={LANGUAGE_OPTIONS}
              value={state.language}
              onChange={(v) => update("language", v)}
              popoverClassName="max-h-[280px] overflow-y-auto"
            />
          </div>

          {/* Right — usage + send */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Usage ring + count */}
            <div className="relative flex items-center justify-center size-9">
              <svg
                className="-rotate-90"
                width="38"
                height="38"
                viewBox="0 0 38 38"
              >
                {/* Background track */}
                <circle
                  cx="19"
                  cy="19"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-border/50"
                />
                {/* Progress arc */}
                <circle
                  cx="19"
                  cy="19"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium tabular-nums text-muted-foreground">
                <Sparkles className="size-3.5" />
              </span>
            </div>

            {/* Usage count */}
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {usage.remaining}
            </span>

            {/* Mic / Send button */}
            <AnimatePresence mode="wait">
              {hasText ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSubmit}
                  className={cn(
                    "flex items-center justify-center size-9 rounded-full",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors duration-200"
                  )}
                >
                  <ArrowRight className="size-4" />
                </motion.button>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "flex items-center justify-center size-9 rounded-full",
                    "bg-muted/60 text-muted-foreground",
                    "hover:bg-muted transition-colors duration-200"
                  )}
                >
                  <Mic className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
