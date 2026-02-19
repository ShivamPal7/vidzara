"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings2,
  Paperclip,
  Sparkles,
  Mic,
  ArrowRight,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Scissors,
  FileText,
  Clapperboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MAX_CHARS = 4000

const tools = [
  {
    icon: ImageIcon,
    label: "Thumbnail Generator",
    description: "Create eye-catching thumbnails",
  },
  {
    icon: Scissors,
    label: "Clipping",
    description: "Create engaging shorts",
  },
  {
    icon: FileText,
    label: "Script Writer",
    description: "Write compelling scripts",
  },
  {
    icon: Clapperboard,
    label: "Shorts Generator",
    description: "Create viral shorts",
  },
]

interface PromptInputProps {
  className?: string
  usage: {
    used: number
    limit: number
    remaining: number
  }
}

export function PromptInput({ className, usage }: PromptInputProps) {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [deepThinking, setDeepThinking] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasText = value.length > 0

  // SVG circular progress
  const radius = 17
  const strokeWidth = 2.5
  const circumference = 2 * Math.PI * radius
  const progress = usage.limit > 0 ? usage.remaining / usage.limit : 0
  const strokeDashoffset = circumference * (1 - progress)

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
        <div className="px-5 pt-5 pb-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setValue(e.target.value)
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="How can I help you grow?"
            rows={2}
            className={cn(
              "w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none"
            )}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          {/* Left actions */}
          <div className="flex items-center gap-2">
            {/* Tools dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg px-3 text-xs font-medium"
                >
                  <Settings2 className="size-4" />
                  Tools
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-72 rounded-xl p-2"
              >
                {tools.map((tool) => (
                  <DropdownMenuItem
                    key={tool.label}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-center size-10 rounded-lg bg-muted/80">
                      <tool.icon className="size-5 text-foreground" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {tool.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tool.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Attach */}
            <Button
              variant="secondary"
              size="sm"
              className="h-9 gap-1.5 rounded-lg px-3 sm:px-3 text-xs font-medium"
            >
              <Plus className="size-4 sm:hidden" />
              <Paperclip className="size-4 hidden sm:block" />
              <span className="hidden sm:inline">Attach</span>
            </Button>

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
            {/* Usage ring */}
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
                {usage.remaining}
              </span>
            </div>

            {/* Mic / Send button */}
            <AnimatePresence mode="wait">
              {hasText ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
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
