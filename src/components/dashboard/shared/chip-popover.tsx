"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, type LucideIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PromptChip } from "./prompt-chip"

export interface ChipOption {
  value: string
  label: string
  icon?: LucideIcon
  /** Emoji string (e.g. flag emoji) shown before the label */
  emoji?: string
}

interface ChipPopoverProps {
  icon?: LucideIcon
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  align?: "start" | "center" | "end"
  /** Width class for the popover panel */
  popoverClassName?: string
  showLabelOnMobile?: boolean
}

export function ChipPopover({
  icon,
  options,
  value,
  onChange,
  className,
  align = "start",
  popoverClassName,
  showLabelOnMobile,
}: ChipPopoverProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PromptChip
          icon={icon ?? selected?.icon}
          emoji={selected?.emoji}
          label={selected?.label ?? "Select"}
          showChevron
          active={open}
          className={className}
          showLabelOnMobile={showLabelOnMobile}
        />
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        className={cn(
          "w-auto min-w-[160px] rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl p-1.5 shadow-xl",
          popoverClassName
        )}
      >
        <div className="flex flex-col gap-0.5">
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 text-left w-full",
                  "hover:bg-accent/60",
                  isSelected && "text-primary"
                )}
              >
                {option.emoji && (
                  <span className="text-base leading-none shrink-0">
                    {option.emoji}
                  </span>
                )}
                {option.icon && !option.emoji && (
                  <option.icon
                    className="size-4 shrink-0"
                    strokeWidth={1.8}
                  />
                )}
                <span className="flex-1">{option.label}</span>
                {isSelected && (
                  <Check
                    className="size-4 shrink-0 text-primary"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
