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
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const hasText = state.prompt.length > 0

  const handleSubmit = () => {
    if (!hasText) return
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
    onSubmit?.(state)
    onStateChange({ ...state, prompt: "" })
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert("Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.")
        return
      }

      try {
        const recognition = new SpeechRecognition()
        // Setting continuous to false ensures it automatically stops when the user finishes speaking
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = state.language === "hi" ? "hi-IN" : state.language === "es" ? "es-ES" : "en-US"

        // Keep track of what prompt was before starting this speech session
        const basePrompt = state.prompt ? state.prompt + " " : ""

        recognition.onresult = (event: any) => {
          let currentTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript
          }
          onStateChange({ ...state, prompt: basePrompt + currentTranscript })
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
        recognitionRef.current = recognition
        setIsListening(true)
      } catch (err) {
        console.error(err)
        setIsListening(false)
      }
    }
  }

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // When format changes, reset duration to sensible default
  useEffect(() => {
    if (state.format === "short" && !SHORT_DURATION_OPTIONS.find((o) => o.value === state.duration)) {
      onStateChange({ ...state, duration: "1" })
    }
    if (state.format === "long" && !LONG_DURATION_OPTIONS.find((o) => o.value === state.duration)) {
      onStateChange({ ...state, duration: "10" })
    }
  }, [state.format, state.duration, state, onStateChange])

  const durationOptions =
    state.format === "short" ? SHORT_DURATION_OPTIONS : LONG_DURATION_OPTIONS

  const update = <K extends keyof ScriptWriterState>(
    key: K,
    value: ScriptWriterState[K]
  ) => onStateChange({ ...state, [key]: value })

  const isProPlan = usage.limit >= 50

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
            placeholder={isListening ? "Listening... Speak now" : "What's your video about?"}
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
            {/* Generations Indicator */}
            {isProPlan ? (
              <div 
                className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 gap-1.5 text-xs font-medium select-none"
                title="Pro Plan Active"
              >
                <Sparkles className="size-3.5 shrink-0" strokeWidth={2} />
                <span className="font-semibold">PRO</span>
              </div>
            ) : (
              <div 
                className="inline-flex items-center justify-center rounded-full border border-border/40 bg-muted/40 text-foreground/80 px-3 py-1.5 gap-1.5 text-xs font-medium select-none"
                title={`${usage.remaining} generations remaining`}
              >
                <Sparkles className="size-3.5 text-primary shrink-0" strokeWidth={2} />
                <span>{usage.remaining} left</span>
              </div>
            )}

            {/* Mic / Send button */}
            <AnimatePresence mode="wait">
              {hasText && !isListening ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSubmit}
                  type="button"
                  className={cn(
                    "flex items-center justify-center size-9 rounded-full shrink-0",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors duration-200"
                  )}
                  title="Generate Script"
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
                  onClick={toggleListening}
                  type="button"
                  className={cn(
                    "flex items-center justify-center size-9 rounded-full transition-all duration-200 shrink-0",
                    isListening
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                  title={isListening ? "Listening... Click to stop" : "Start voice input"}
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
