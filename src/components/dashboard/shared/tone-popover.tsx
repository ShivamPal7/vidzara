"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Smile,
  ChevronRight,
  Check,
  X,
  Youtube,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PromptChip } from "./prompt-chip"

const presetTones = [
  "Professional",
  "Casual & Friendly",
  "Energetic",
  "Storytelling",
  "Educational",
  "Humorous",
  "Inspirational",
  "Dramatic",
]

interface TonePopoverProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

type View = "main" | "presets" | "custom" | "reference"

const REFERENCE_PREFIX = "Reference: "

function isReferenceValue(val: string) {
  return val.startsWith(REFERENCE_PREFIX)
}

export function TonePopover({ value, onChange, className }: TonePopoverProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>("main")
  const [customTone, setCustomTone] = useState("")
  const [referenceUrl, setReferenceUrl] = useState("")

  // Derive display label
  const displayLabel = isReferenceValue(value)
    ? "Reference Video Tone"
    : value || "Tone"

  const handleSelect = (tone: string) => {
    onChange(tone)
    setOpen(false)
    setView("main")
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setView("main")
  }

  const handleApplyReference = () => {
    const trimmed = referenceUrl.trim()
    if (!trimmed) return
    handleSelect(`${REFERENCE_PREFIX}${trimmed}`)
    setReferenceUrl("")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <PromptChip
          icon={Smile}
          label={displayLabel}
          showChevron
          active={open || !!value}
          className={className}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-auto min-w-[240px] rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl p-1.5 shadow-xl"
      >
        {/* ── Main view ───────────────────────────────────────────── */}
        {view === "main" && (
          <div className="flex flex-col gap-0.5">
            {/* Clear selection if tone is set */}
            {value && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-destructive/10 text-destructive"
              >
                <X className="size-4" strokeWidth={1.8} />
                <span>Clear tone</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setView("reference")}
              className="flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/60"
            >
              <span>Match reference video</span>
              <Youtube className="size-4 text-muted-foreground" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => setView("presets")}
              className="flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/60"
            >
              <span>Quick Preset Tones</span>
              <ChevronRight className="size-4 text-muted-foreground" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => setView("custom")}
              className="flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/60"
            >
              <span>Custom Tone</span>
              <ChevronRight className="size-4 text-muted-foreground" strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* ── Presets view ─────────────────────────────────────────── */}
        {view === "presets" && (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-3 rotate-180" />
              Back
            </button>
            {presetTones.map((tone) => {
              const isSelected = value === tone
              return (
                <button
                  key={tone}
                  type="button"
                  onClick={() => handleSelect(tone)}
                  className={cn(
                    "flex items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/60 text-left",
                    isSelected && "text-primary"
                  )}
                >
                  <span>{tone}</span>
                  {isSelected && <Check className="size-4 text-primary" strokeWidth={2.5} />}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Custom tone view ─────────────────────────────────────── */}
        {view === "custom" && (
          <div className="flex flex-col gap-2 p-1.5">
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start"
            >
              <ChevronRight className="size-3 rotate-180" />
              Back
            </button>
            <input
              type="text"
              value={customTone}
              onChange={(e) => setCustomTone(e.target.value)}
              placeholder="e.g., Sarcastic but informative"
              className="w-full rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customTone.trim()) {
                  handleSelect(customTone.trim())
                  setCustomTone("")
                }
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                if (customTone.trim()) {
                  handleSelect(customTone.trim())
                  setCustomTone("")
                }
              }}
              disabled={!customTone.trim()}
              className="self-end rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        )}

        {/* ── Reference video view ─────────────────────────────────── */}
        {view === "reference" && (
          <div className="flex flex-col gap-2 p-1.5">
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start"
            >
              <ChevronRight className="size-3 rotate-180" />
              Back
            </button>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" strokeWidth={1.8} />
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="YouTube URL"
                className="w-full rounded-lg border border-border/50 bg-muted/30 pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyReference()
                }}
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleApplyReference}
              disabled={!referenceUrl.trim()}
              className="self-end rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
