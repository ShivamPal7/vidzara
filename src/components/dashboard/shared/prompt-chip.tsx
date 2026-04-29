"use client"

import { cn } from "@/lib/utils"
import { ChevronDown, type LucideIcon } from "lucide-react"
import { forwardRef } from "react"

export interface PromptChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  /** Emoji string rendered before the label (e.g. flag emoji) */
  emoji?: string
  label: string
  active?: boolean
  showChevron?: boolean
}

export const PromptChip = forwardRef<HTMLButtonElement, PromptChipProps>(
  (
    {
      icon: Icon,
      emoji,
      label,
      active = false,
      showChevron = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          // Base — compact circle on mobile, pill on sm+
          "inline-flex items-center justify-center rounded-full text-[13px] font-medium transition-all duration-200 select-none",
          "border border-border/40 bg-muted/40 text-foreground/80",
          "hover:bg-muted/70 hover:border-border/60 hover:text-foreground",
          // Mobile: icon-only circle
          "size-9 p-0 gap-0",
          // sm+: pill with label
          "sm:size-auto sm:h-auto sm:px-3.5 sm:py-1.5 sm:gap-1.5",
          active &&
            "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 hover:border-primary/40",
          className
        )}
        {...props}
      >
        {emoji && (
          <span className="text-sm leading-none shrink-0">{emoji}</span>
        )}
        {Icon && !emoji && (
          <Icon className="size-4 sm:size-3.5 shrink-0" strokeWidth={2} />
        )}
        <span className="hidden sm:inline whitespace-nowrap">{label}</span>
        {showChevron && (
          <ChevronDown className="hidden sm:block size-3 shrink-0 opacity-50" />
        )}
      </button>
    )
  }
)

PromptChip.displayName = "PromptChip"
