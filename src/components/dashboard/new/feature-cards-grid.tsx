"use client"

import { FeatureCard } from "./feature-card"
import { FileText, Search, Lightbulb, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    id: "script-writer",
    icon: FileText,
    label: "Script Writer",
    title: "Script Writer",
    description: "Write a viral YouTube script about a mystery",
  },
  {
    id: "video-seo",
    icon: Search,
    label: "Video SEO",
    title: "Video SEO",
    description: "Optimize my video for search and discovery",
  },
  {
    id: "topic-generator",
    icon: Lightbulb,
    label: "Video ideas",
    title: "Video ideas",
    description: "What trending video ideas do you have for my channel?",
  },
  {
    id: "hook-generator",
    icon: Sparkles,
    label: "Viral Hook",
    title: "Viral Hook",
    description: "Create a 3-second hook that keeps people watching",
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

export function FeatureCardsGrid({ onSelect }: { onSelect?: (toolId: string, prompt?: string) => void }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 w-full"
    >
      {features.map((feature) => (
        <motion.div key={feature.id} variants={itemVariants} className="h-full">
          <FeatureCard
            icon={feature.icon}
            label={feature.label}
            title={feature.title}
            description={feature.description}
            onClick={() => onSelect?.(feature.id, feature.description)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
