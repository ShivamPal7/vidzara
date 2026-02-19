"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FeatureCardsGrid } from "@/components/dashboard/new/feature-cards-grid"
import { PromptInput } from "@/components/dashboard/new/prompt-input"
import { getUsageData, type UsageData } from "@/actions/usage"

export default function NewPage() {
  const [usage, setUsage] = useState<UsageData>({ used: 0, limit: 3, remaining: 3 })

  useEffect(() => {
    getUsageData().then(setUsage).catch(console.error)
  }, [])

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-4rem)] w-full">
      {/* Hero section — centered */}
      <div className="flex-1 flex flex-col items-center justify-center w-full gap-10 px-4 md:px-8 max-w-4xl mx-auto">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center text-foreground"
        >
          How can I help you today?
        </motion.h1>

        {/* Feature cards */}
        <FeatureCardsGrid />
      </div>

      {/* Bottom input — flush to bottom */}
      <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pb-6 pt-8">
        <PromptInput usage={usage} />
      </div>
    </div>
  )
}
