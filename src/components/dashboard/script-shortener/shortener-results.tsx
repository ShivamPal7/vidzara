"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, FileText, Magnet, Eye, ArrowRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShortScript {
  title: string
  hook: string
  body: string
  cta: string
  visuals: string
}

interface ShortenerResultsProps {
  shorts: ShortScript[]
  isVisible: boolean
}

export function ShortenerResults({ shorts, isVisible }: ShortenerResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  if (!isVisible || !shorts || shorts.length === 0) return null

  const handleCopy = (short: ShortScript, index: number) => {
    const text = `Title: ${short.title}\n\nHook: ${short.hook}\n\nBody: ${short.body}\n\nCTA: ${short.cta}\n\nVisuals: ${short.visuals}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="size-5 text-primary" />
        <h3 className="text-lg font-medium text-foreground">Generated Shorts ({shorts.length})</h3>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {shorts.map((short, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="group relative rounded-2xl border border-border/50 bg-card/40 hover:bg-card/60 backdrop-blur-sm p-3 md:p-6 transition-all hover:border-primary/30"
            >
              {/* Header and Copy Button */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="space-y-1 pr-12">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1">
                    Short {idx + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground">
                    {short.title}
                  </h3>
                </div>
                
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-[84px] p-0 rounded-lg hover:bg-primary/10 hover:text-primary bg-background/50 md:bg-transparent md:opacity-0 group-hover:opacity-100 transition-all border border-border/50 md:border-transparent overflow-hidden"
                    onClick={() => handleCopy(short, idx)}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copiedIndex === idx ? (
                        <motion.div
                          key="copied"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="size-4 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2"
                        >
                          <Copy className="size-4" />
                          <span>Copy</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* Hook */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Magnet className="size-5 text-amber-500 shrink-0" />
                    <h4 className="text-sm font-semibold text-amber-500">Hook (0-3s)</h4>
                  </div>
                  <p className="text-[15px] font-medium leading-relaxed text-foreground">
                    "{short.hook}"
                  </p>
                </div>

                {/* Body */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <FileText className="size-5 text-blue-500 shrink-0" />
                    <h4 className="text-sm font-semibold text-blue-500">Body</h4>
                  </div>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {short.body}
                  </p>
                </div>

                {/* CTA and Visuals */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="size-4 text-primary shrink-0" />
                      <h4 className="text-sm font-semibold text-primary">Call to Action</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      "{short.cta}"
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="size-4 text-purple-500 shrink-0" />
                      <h4 className="text-sm font-semibold text-purple-500">Visuals</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {short.visuals}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
