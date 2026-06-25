"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Paperclip,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToolsDropdown } from "./tools-dropdown"
import { toast } from "sonner"
import { useCredits } from "@/components/dashboard/credits-provider"

const MAX_CHARS = 4000
const MAX_ATTACHMENTS = 5
const MAX_FILE_MB = 10

export interface AttachmentData {
  name: string
  type: string
  dataUrl: string
}

interface PromptInputProps {
  className?: string
  usage: {
    used: number
    limit: number
    remaining: number
  }
  value: string
  onChange: (value: string) => void
  selectedTool: string
  onToolChange: (tool: string) => void
  onSend: (text: string, isDeepThinking: boolean, attachments: AttachmentData[]) => void
  isGenerating?: boolean
}

export function PromptInput({
  className,
  usage,
  value,
  onChange,
  selectedTool,
  onToolChange,
  onSend,
  isGenerating,
}: PromptInputProps) {
  const { credits } = useCredits()
  const [isFocused, setIsFocused] = useState(false)
  const [deepThinking, setDeepThinking] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentData[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const hasText = value.trim().length > 0
  const canSend = hasText && !isGenerating
  const isProPlan = usage.limit >= 50

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        toast.error("Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.")
        return
      }

      try {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "en-US"

        const basePrompt = value ? value + " " : ""

        recognition.onresult = (event: any) => {
          let currentTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript
          }
          onChange(basePrompt + currentTranscript)
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

  const processFile = useCallback(async (file: File): Promise<AttachmentData | null> => {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`${file.name} exceeds the ${MAX_FILE_MB}MB limit.`)
      return null
    }

    const isImage = file.type.startsWith("image/")
    const isPdf = file.type === "application/pdf"
    const isText = file.type.startsWith("text/")

    if (!isImage && !isPdf && !isText) {
      toast.error(`${file.name}: Only images, PDFs, and text files are supported.`)
      return null
    }

    return new Promise<AttachmentData>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          name: file.name,
          type: file.type,
          dataUrl: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const available = MAX_ATTACHMENTS - attachments.length
    if (available <= 0) {
      toast.error(`Max ${MAX_ATTACHMENTS} attachments allowed.`)
      return
    }
    const toProcess = fileArray.slice(0, available)
    const results = await Promise.all(toProcess.map(processFile))
    const valid = results.filter(Boolean) as AttachmentData[]
    setAttachments((prev) => [...prev, ...valid])
  }, [attachments.length, processFile])

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    if (!canSend) return
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
    onSend(value, deepThinking, attachments)
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      onChange(e.target.value)
      // Auto-resize
      e.target.style.height = "auto"
      e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px"
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "rounded-2xl border border-border/60 bg-card/75 dark:bg-zinc-900/75 backdrop-blur-md transition-all duration-300 shadow-xl",
          isFocused && "border-primary/50 shadow-[0_0_20px_-4px] shadow-primary/15",
          isDragging && "border-primary/70 bg-primary/5"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Attachment previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pt-4 flex flex-wrap gap-2 overflow-hidden"
            >
              {attachments.map((att, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="relative group"
                >
                  {att.type.startsWith("image/") ? (
                    <div className="size-14 rounded-xl overflow-hidden border border-border/60 bg-muted/50">
                      <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/50 text-xs text-muted-foreground max-w-[140px]">
                      <FileText className="size-3.5 shrink-0 text-primary/70" />
                      <span className="truncate font-medium">{att.name}</span>
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="size-2.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag overlay hint */}
        {isDragging && (
          <div className="px-5 pt-4 pb-1 text-xs text-primary/70 font-medium flex items-center gap-1.5">
            <Paperclip className="size-3.5" />
            Drop files here to attach
          </div>
        )}

        {/* Textarea */}
        <div className="px-5 pt-5 pb-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... Speak now" : isGenerating ? "Coach is responding..." : "Ask your YouTube Coach anything…"}
            rows={2}
            disabled={isGenerating}
            className={cn(
              "w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none overflow-hidden min-h-[48px]",
              isGenerating && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          {/* Left actions */}
          <div className="flex items-center gap-2">
            {/* Tools dropdown */}
            <ToolsDropdown value={selectedTool} onChange={onToolChange} />

            {/* Attach button */}
            <Button
              variant="secondary"
              size="sm"
              className="h-9 gap-1.5 rounded-lg px-3 text-xs font-medium"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= MAX_ATTACHMENTS}
            >
              <Paperclip className="size-4" />
              <span className="hidden sm:inline">Attach</span>
              {attachments.length > 0 && (
               <span className="size-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                 {attachments.length}
               </span>
              )}
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.md,.csv,.json"
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = "" }}
            />

            {/* Deep thinking toggle */}
            <Button
              variant={deepThinking ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeepThinking(!deepThinking)}
              className={cn(
                "h-9 gap-1.5 rounded-lg px-3 text-xs font-medium transition-all duration-200",
                deepThinking && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Deep thinking</span>
            </Button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
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
                title={`${credits !== null ? credits : "..."} credits remaining`}
              >
                <Sparkles className="size-3.5 text-primary shrink-0" strokeWidth={2} />
                <span>{credits !== null ? credits : "..."} left</span>
              </div>
            )}

            {/* Mic / Send button */}
            <AnimatePresence mode="wait">
              {hasText && !isListening ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className={cn(
                    "flex items-center justify-center size-9 rounded-full transition-all duration-200 shrink-0",
                    canSend
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      : "bg-muted/60 text-muted-foreground/50 cursor-not-allowed"
                  )}
                  title="Send message"
                >
                  {isGenerating ? (
                    <span className="size-3 rounded-sm bg-current animate-pulse" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </motion.button>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={toggleListening}
                  disabled={isGenerating}
                  type="button"
                  className={cn(
                    "flex items-center justify-center size-9 rounded-full transition-all duration-200 shrink-0",
                    isGenerating && "opacity-50 cursor-not-allowed",
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
