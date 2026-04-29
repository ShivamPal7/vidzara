"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

export interface RecentScript {
  id: string
  title: string
  createdAt: Date
}

interface RecentScriptsProps {
  scripts: RecentScript[]
  className?: string
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
}

export function RecentScripts({ scripts, className }: RecentScriptsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      {/* Header */}
      <h2 className="text-lg sm:text-xl font-semibold text-primary mb-4">
        Recents
      </h2>

      {/* List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2"
      >
        {scripts.map((script) => (
          <motion.div key={script.id} variants={itemVariants}>
            <Link
              href={`/dashboard/create/script-writer/${script.id}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3.5",
                "border border-border/30 bg-card/40 backdrop-blur-sm",
                "transition-all duration-200 ease-out",
                "hover:bg-card/70 hover:border-border/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-center size-8 rounded-lg bg-muted/50 shrink-0">
                <FileText
                  className="size-4 text-muted-foreground group-hover:text-primary transition-colors duration-200"
                  strokeWidth={1.5}
                />
              </div>

              <span className="flex-1 text-sm font-medium text-foreground/90 truncate">
                {script.title}
              </span>

              <ChevronRight
                className="size-4 text-muted-foreground/40 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                strokeWidth={1.5}
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
