"use client"

import Link from "next/link"
import { IconPencil, IconSearch, IconMagnet } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function QuickActions() {
  const actions = [
    {
      title: "Write a Script",
      icon: IconPencil,
      href: "/dashboard/create/script-writer",
      description: "Generate a script for your next video",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Generate SEO",
      icon: IconSearch,
      href: "/dashboard/create/video-seo",
      description: "Optimize your video titles and tags",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Check Hook",
      icon: IconMagnet,
      href: "/dashboard/optimize/hook-detector",
      description: "Analyze your video hook strength",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <Button
          key={action.title}
          variant="outline"
          className="glass-1 h-auto flex-col items-start gap-4 p-4 hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
          asChild
        >
          <Link href={action.href}>
            <div className={`rounded-xl p-2.5 ${action.bgColor}`}>
              <action.icon className={`h-6 w-6 ${action.color}`} stroke={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-base">{action.title}</span>
              <span className="text-muted-foreground text-xs font-normal text-wrap line-clamp-2">
                {action.description}
              </span>
            </div>
          </Link>
        </Button>
      ))}
    </div>
  )
}
