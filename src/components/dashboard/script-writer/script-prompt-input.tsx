"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Mic, Sparkles, Youtube, Clock, Globe, Plus, ChevronRight, ChevronLeft, Check, Smile, Video, FileText, Instagram, Music } from "lucide-react"
import { ChipPopover } from "@/components/dashboard/shared/chip-popover"
import { PromptChip } from "@/components/dashboard/shared/prompt-chip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const PRESET_TONES = [
  "Professional",
  "Casual & Friendly",
  "Energetic",
  "Storytelling",
  "Educational",
  "Humorous",
  "Inspirational",
  "Dramatic",
]

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
  disabled?: boolean
}

export function ScriptPromptInput({ className, usage, state, onStateChange, onSubmit, disabled = false }: ScriptPromptInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverView, setPopoverView] = useState<"main" | "country" | "tone" | "manual">("main")
  const [customToneInputVal, setCustomToneInputVal] = useState("")
  const [manualTranscript, setManualTranscript] = useState("")

  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open)
    if (!open) {
      setPopoverView("main")
    }
  }

  // Pre-fill transcript from state if it is a transcript tone
  useEffect(() => {
    if (state.tone && state.tone.startsWith("Transcript: ")) {
      setManualTranscript(state.tone.replace("Transcript: ", ""))
    } else {
      setManualTranscript("")
    }
  }, [state.tone])

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
              if (!disabled && e.target.value.length <= MAX_CHARS) {
                update("prompt", e.target.value)
              }
            }}
            disabled={disabled}
            onFocus={() => !disabled && setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={disabled ? "Select option above or reply..." : isListening ? "Listening... Speak now" : "What's your video about?"}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent text-sm sm:text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none",
              disabled && "opacity-45 cursor-not-allowed"
            )}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-2.5 sm:px-4 pb-3 sm:pb-4 pt-0.5 sm:pt-1">
          {/* Left — option chips */}
          <div className={cn("flex items-center gap-1.5 sm:gap-2", disabled && "pointer-events-none opacity-30")}>
            {/* Options Button Popover */}
            <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger asChild>
                <PromptChip
                  icon={Plus}
                  label="Options"
                  showChevron={false}
                  active={popoverOpen || !!state.tone || state.language !== "english"}
                />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                sideOffset={8}
                className="w-[280px] sm:w-[320px] rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl p-3 shadow-xl z-50"
              >
                <AnimatePresence mode="wait">
                  {popoverView === "main" && (
                    <motion.div
                      key="main"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-1">
                        Options
                      </div>

                      {/* Format Selection (Long / Short Boxes) */}
                      <div className="grid grid-cols-2 gap-2 px-1 py-1">
                        <button
                          type="button"
                          onClick={() => update("format", "long")}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-xl p-3 border transition-all duration-200 text-center gap-1.5 w-full cursor-pointer relative overflow-hidden",
                            state.format === "long"
                              ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                              : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center size-8 rounded-full transition-colors",
                            state.format === "long" ? "bg-primary/15" : "bg-muted-foreground/10"
                          )}>
                            <Youtube className="size-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">Long Video</span>
                            <span className="text-[10px] text-muted-foreground">YouTube</span>
                          </div>
                          {state.format === "long" && (
                            <div className="absolute top-1.5 right-1.5 size-3.5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="size-2 text-primary-foreground stroke-[3]" />
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => update("format", "short")}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-xl p-3 border transition-all duration-200 text-center gap-1.5 w-full cursor-pointer relative overflow-hidden",
                            state.format === "short"
                              ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                              : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center size-8 rounded-full transition-colors",
                            state.format === "short" ? "bg-primary/15" : "bg-muted-foreground/10"
                          )}>
                            <Video className="size-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">Short Video</span>
                            <span className="text-[10px] text-muted-foreground">Shorts/Reels</span>
                          </div>
                          {state.format === "short" && (
                            <div className="absolute top-1.5 right-1.5 size-3.5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="size-2 text-primary-foreground stroke-[3]" />
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Country Option */}
                      <button
                        type="button"
                        onClick={() => setPopoverView("country")}
                        className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-accent/60 transition-colors text-left w-full"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center size-7 rounded-md bg-emerald-500/10 text-emerald-400">
                            <Globe className="size-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Country / Language</span>
                            <span className="text-xs text-muted-foreground">
                              {(() => {
                                const selectedLang = LANGUAGE_OPTIONS.find((o) => o.value === state.language)
                                return selectedLang ? `${selectedLang.emoji} ${selectedLang.label}` : "Select language..."
                              })()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </button>

                      {/* Tone Option */}
                      <button
                        type="button"
                        onClick={() => setPopoverView("tone")}
                        className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-accent/60 transition-colors text-left w-full"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center size-7 rounded-md bg-indigo-500/10 text-indigo-400">
                            <Smile className="size-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Tone</span>
                            <span className="text-xs text-muted-foreground">
                              {state.tone || "Select tone..."}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </button>
                    </motion.div>
                  )}

                  {popoverView === "country" && (
                    <motion.div
                      key="country"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => setPopoverView("main")}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 self-start"
                      >
                        <ChevronLeft className="size-3.5" />
                        Back to Options
                      </button>

                      <div className="text-xs font-semibold px-1 pb-1">Select Country / Language</div>

                      <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
                        {LANGUAGE_OPTIONS.map((lang) => {
                          const isSelected = state.language === lang.value
                          return (
                            <button
                              key={lang.value}
                              type="button"
                              onClick={() => {
                                update("language", lang.value)
                                setPopoverView("main")
                              }}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 hover:bg-accent/60 transition-colors text-left text-[13px] font-medium w-full",
                                isSelected && "text-primary bg-primary/5"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base shrink-0 leading-none">{lang.emoji}</span>
                                <span>{lang.label}</span>
                              </div>
                              {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {popoverView === "tone" && (
                    <motion.div
                      key="tone"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => setPopoverView("main")}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 self-start"
                      >
                        <ChevronLeft className="size-3.5" />
                        Back to Options
                      </button>

                      <div className="flex items-center justify-between px-1">
                        <div className="text-xs font-semibold">Select Tone</div>
                        {state.tone && (
                          <button
                            type="button"
                            onClick={() => update("tone", "")}
                            className="text-[10px] font-semibold text-destructive hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Preset Tones Grid */}
                      <div className="grid grid-cols-2 gap-1 max-h-[140px] overflow-y-auto pr-1">
                        {PRESET_TONES.map((tone) => {
                          const isSelected = state.tone === tone
                          return (
                            <button
                              key={tone}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  update("tone", "")
                                } else {
                                  update("tone", tone)
                                }
                                setPopoverView("main")
                              }}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1 hover:bg-accent/60 transition-colors text-left text-[11px] font-medium w-full border border-transparent",
                                isSelected
                                  ? "border-primary/25 bg-primary/10 text-primary"
                                  : "bg-muted/15 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              )}
                            >
                              <span className="truncate">{tone}</span>
                              {isSelected && <Check className="size-3 text-primary shrink-0" />}
                            </button>
                          )
                        })}
                      </div>

                      {/* Paste Transcript Button */}
                      <button
                        type="button"
                        onClick={() => setPopoverView("manual")}
                        className={cn(
                          "flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-all duration-200 w-full text-left",
                          state.tone?.startsWith("Transcript: ")
                            ? "border-primary/25 bg-primary/10 text-primary"
                            : "border-border/40 bg-muted/15 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {state.tone?.startsWith("Transcript: ") ? "Edit transcript tone" : "Paste transcript tone"}
                          </span>
                        </span>
                        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                      </button>

                      {/* Custom Tone Input */}
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          placeholder="Custom tone (e.g. Sarcastic)"
                          value={customToneInputVal}
                          onChange={(e) => setCustomToneInputVal(e.target.value)}
                          className="flex-1 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-1.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customToneInputVal.trim()) {
                              update("tone", customToneInputVal.trim())
                              setCustomToneInputVal("")
                              setPopoverView("main")
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customToneInputVal.trim()) {
                              update("tone", customToneInputVal.trim())
                              setCustomToneInputVal("")
                              setPopoverView("main")
                            }
                          }}
                          disabled={!customToneInputVal.trim()}
                          className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {popoverView === "manual" && (
                    <motion.div
                      key="manual"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => setPopoverView("tone")}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 self-start"
                      >
                        <ChevronLeft className="size-3.5" />
                        Back to Tone
                      </button>

                      <div className="text-xs font-semibold px-1">Paste Video Transcript</div>

                      <textarea
                        value={manualTranscript}
                        onChange={(e) => setManualTranscript(e.target.value)}
                        placeholder="Paste the video transcript here to analyze and copy its tone style..."
                        className="w-full h-24 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = manualTranscript.trim()
                          if (trimmed) {
                            update("tone", `Transcript: ${trimmed}`)
                            setPopoverView("main")
                          }
                        }}
                        disabled={!manualTranscript.trim()}
                        className="self-end rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Apply Transcript
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </PopoverContent>
            </Popover>

            {/* Duration */}
            <ChipPopover
              icon={Clock}
              options={durationOptions}
              value={state.duration}
              onChange={(v) => update("duration", v)}
              showLabelOnMobile={true}
            />
          </div>

          {/* Right — usage + send */}
          <div className={cn("flex items-center gap-1.5 sm:gap-2.5", disabled && "pointer-events-none opacity-30")}>
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
