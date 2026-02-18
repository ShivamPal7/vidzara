"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "./empty-state"
import { formatDistanceToNow } from "date-fns"
import { 
  IconPencil, 
  IconSearch, 
  IconMagnet, 
  IconDeviceDesktopAnalytics,
  IconChartBar,
  IconFileText
} from "@tabler/icons-react"

import { Feature } from "@prisma/client"

interface Generation {
  id: string
  feature: Feature | string
  input: any
  createdAt: Date
}

interface RecentGenerationsProps {
  generations: Generation[]
}

const FEATURE_ICONS: Record<string, any> = {
  SCRIPT_WRITER: IconPencil,
  VIDEO_SEO: IconSearch,
  HOOK_DETECTOR: IconMagnet,
  TOPIC_GENERATOR: IconDeviceDesktopAnalytics,
  OUTLIER_DETECTOR: IconChartBar,
  DEFAULT: IconFileText
}

export function RecentGenerations({ generations }: RecentGenerationsProps) {
  if (generations.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
      </div>
      <div className="rounded-xl border glass-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Input Preview</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {generations.map((gen) => {
              const Icon = FEATURE_ICONS[gen.feature] || FEATURE_ICONS.DEFAULT
              
              return (
                <TableRow key={gen.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Icon size={16} />
                      </div>
                      <span className="capitalize">
                        {gen.feature.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {/* Assuming input is an object, try to find a relevant text field */}
                    {typeof gen.input === 'string' 
                      ? gen.input 
                      : (gen.input?.topic || gen.input?.title || gen.input?.query || "No preview")}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(gen.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
