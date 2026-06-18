"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { IconChevronRight, IconClock, IconArrowRight, IconActivity } from "@tabler/icons-react"
import { getGenerationDisplayData, formatFeatureName, getFeatureIcon } from "../history/history-utils"
import type { GenerationHistoryItem } from "@/actions/history"
import { EmptyState } from "./empty-state"

interface RecentGenerationsProps {
  generations: GenerationHistoryItem[]
}

export function RecentGenerations({ generations }: RecentGenerationsProps) {
  if (generations.length === 0) {
    return <EmptyState />
  }

  const FEATURES_WITH_ID_PAGES = new Set([
    "SCRIPT_WRITER",
    "VIDEO_SEO",
    "THUMBNAIL_CONCEPT",
    "TOPIC_GENERATOR",
    "NICHE_FINDER"
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <IconActivity className="size-4 text-primary" />
          <span>Recent Activity</span>
        </h2>
        <Link 
          href="/dashboard/history" 
          className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group transition-colors"
        >
          <span>View All History</span>
          <IconArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="flex flex-col gap-2.5 w-full min-w-0">
        {generations.map((gen) => {
          const { heading, description, href } = getGenerationDisplayData(
            gen.feature,
            gen.output
          )
          
          const featureName = formatFeatureName(gen.feature)
          const timeAgo = formatDistanceToNow(new Date(gen.createdAt), { addSuffix: true })
          const hasIdPage = FEATURES_WITH_ID_PAGES.has(gen.feature)
          const targetUrl = (gen.feature as string) === "CHAT"
            ? `/dashboard/new?sessionId=${gen.id}`
            : hasIdPage ? `${href}/${gen.id}` : `${href}?generationId=${gen.id}`
          const Icon = getFeatureIcon(gen.feature)

          return (
            <Link
              key={gen.id}
              href={targetUrl}
              className="group flex items-center gap-3.5 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-all duration-200 overflow-hidden shadow-sm"
            >
              {/* Icon — fixed size, never shrinks, never grows */}
              <div className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Icon className="h-4.5 w-4.5" />
              </div>

              {/* Text column — min-w-0 is critical, allows flex children to shrink below content size */}
              <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Badge
                    variant="secondary"
                    className="shrink-0 px-2 py-0 text-[10px] font-semibold bg-secondary/60 border-transparent leading-5"
                  >
                    {featureName}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5" />
                    {timeAgo}
                  </span>
                </div>

                {/* Heading: wraps cleanly on multiple lines */}
                <p className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                  {heading}
                </p>

                {description && (
                  <p className="text-xs text-muted-foreground/70 truncate">
                    {description}
                  </p>
                )}
              </div>

              {/* Chevron — fixed, never grows */}
              <div className="shrink-0 text-muted-foreground/45 transition-all group-hover:text-primary group-hover:translate-x-0.5">
                <IconChevronRight className="h-4 w-4" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
