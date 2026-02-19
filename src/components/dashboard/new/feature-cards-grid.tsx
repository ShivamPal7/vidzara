"use client"

import { FeatureCard } from "./feature-card"
import { Lightbulb, TrendingUp, ScanEye, MonitorPlay } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Lightbulb,
    label: "Video ideas",
    title: "Video ideas",
    description: "Based on my channel, what video ideas do you have for me?",
  },
  {
    icon: TrendingUp,
    label: "More views",
    title: "More views",
    description: "How do I get more views?",
  },
  {
    icon: ScanEye,
    label: "Channel audit",
    title: "Channel audit",
    description: "Can you audit my channel?",
  },
  {
    icon: MonitorPlay,
    label: "Video review",
    title: "Video review",
    description: "Give me feedback on my latest video",
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

export function FeatureCardsGrid() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full"
    >
      {features.map((feature) => (
        <motion.div key={feature.title} variants={itemVariants} className="h-full">
          <FeatureCard
            icon={feature.icon}
            label={feature.label}
            title={feature.title}
            description={feature.description}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
