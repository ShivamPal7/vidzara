"use client"

import { cn } from "@/lib/utils"
import { ArrowDown, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

export interface FeatureCardProps {
  icon: LucideIcon
  label: string
  title: string
  description: string
  onClick?: () => void
  className?: string
}

export function FeatureCard({
  icon: Icon,
  label,
  title,
  description,
  onClick,
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:border-primary/50 hover:shadow-[0_0_20px_-4px] hover:shadow-primary/20",
        "h-full",
        className
      )}
    >
      {/* Top section */}
      <div className="space-y-3">
        {/* Icon + Label row */}
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>

        {/* Description */}
        <p className="text-sm font-medium leading-snug text-foreground">
          {description}
        </p>
      </div>

      {/* Bottom-right arrow */}
      <div className="flex justify-end mt-3">
        <ArrowDown
          className="size-4 text-muted-foreground/60 transition-colors duration-200 group-hover:text-primary/70"
          strokeWidth={1.5}
        />
      </div>
    </motion.div>
  )
}
