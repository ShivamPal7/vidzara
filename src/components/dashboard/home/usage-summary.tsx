"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { IconBolt } from "@tabler/icons-react"

interface UsageSummaryProps {
  usage: {
    used: number
    limit: number
    remaining: number
  }
}

export function UsageSummary({ usage }: UsageSummaryProps) {
  const percentage = Math.min((usage.used / usage.limit) * 100, 100)
  
  return (
    <Card className="glass-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Daily Generations
        </CardTitle>
        <IconBolt className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {usage.used} <span className="text-sm font-normal text-muted-foreground">/ {usage.limit}</span>
        </div>
        <Progress value={percentage} className="mt-3 h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {usage.remaining} generations remaining today
        </p>
      </CardContent>
    </Card>
  )
}
