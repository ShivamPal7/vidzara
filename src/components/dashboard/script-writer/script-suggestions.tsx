"use client"

import { motion } from "framer-motion"
import { FileText, Sparkles, Wand2, BookOpen } from "lucide-react"
import { FeatureCard } from "@/components/dashboard/new/feature-card"

const suggestions = [
  {
    icon: FileText,
    label: "How-to",
    title: "How-to Script",
    description: "Write a step-by-step tutorial script for my topic",
  },
  {
    icon: Sparkles,
    label: "Viral hook",
    title: "Viral hook",
    description: "Create a script with a killer hook that grabs attention in 3 seconds",
  },
  {
    icon: Wand2,
    label: "Story-driven",
    title: "Story-driven",
    description: "Write a narrative-style script that keeps viewers hooked till the end",
  },
  {
    icon: BookOpen,
    label: "Listicle",
    title: "Listicle",
    description: "Create a top 5/10 list style script for maximum engagement",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
}

export function ScriptSuggestions({ onSelect }: { onSelect?: (prompt: string) => void }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full"
    >
      {suggestions.map((s) => (
        <motion.div key={s.title} variants={itemVariants} className="h-full">
          <FeatureCard
            icon={s.icon}
            label={s.label}
            title={s.title}
            description={s.description}
            onClick={() => onSelect?.(s.description)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
