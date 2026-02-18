"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconCrown } from "@tabler/icons-react"
import Link from "next/link"

interface PlanStatusProps {
  plan: string
  daysRemaining?: number
  isTrial?: boolean
}

export function PlanStatus({ plan, daysRemaining, isTrial }: PlanStatusProps) {
  const isFree = plan === "FREE"
  const isLimited = plan === "LIMITED_PRO"
  
  return (
    <Card className="glass-2 bg-linear-to-br from-background to-primary/5 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
        <IconCrown className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold capitalize">
            {plan.replace("_", " ").toLowerCase()}
          </div>
          {isTrial && (
             <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                Trial
             </Badge>
          )}
        </div>
        
        {isTrial && daysRemaining !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {daysRemaining} days left in your free trial
          </p>
        )}
        
        {!isTrial && (
           <p className="text-xs text-muted-foreground mt-1">
             Active subscription
           </p>
        )}

        {(isFree || isLimited || isTrial) && (
          <Button size="sm" className="w-full mt-4 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20" asChild>
            <Link href="/dashboard/billing">
              Upgrade to Unlimited
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
