import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { WelcomeHeader } from "@/components/dashboard/home/welcome-header"
import { UsageSummary } from "@/components/dashboard/home/usage-summary"
import { QuickActions } from "@/components/dashboard/home/quick-actions"
import { RecentGenerations } from "@/components/dashboard/home/recent-generations"
import { PlanStatus } from "@/components/dashboard/home/plan-status"
import { getPlanLimit } from "@/constants/limits"
import { redirect } from "next/navigation"
import { startOfDay } from "date-fns"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  const user = session.user

  // Fetch subscription, usage, and recent generations in parallel
  const [subscription, usageRecords, recentGenerations] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: user.id },
    }),
    prisma.usageRecord.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay(new Date()),
        },
      },
    }),
    prisma.generation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  // Calculate usage stats
  const plan = subscription?.plan || "FREE"
  const totalUsage = usageRecords.reduce((acc, record) => acc + record.count, 0)
  // Use DEFAULT limit for summary, as specific feature limits vary. 
  // For a general "daily generations" card, we might need a general limit or just show "Used X"
  // If plan is UNLIMITED, limit is high.
  const limit = getPlanLimit(plan) 
  
  // Trial calculations
  const isTrial = subscription?.status === "TRIALING"
  let daysRemaining = 0
  if (isTrial && subscription?.trialEndsAt) {
    const now = new Date()
    if (subscription.trialEndsAt > now) {
      const diffTime = subscription.trialEndsAt.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } else {
      daysRemaining = 0
    }
  }

  return (
    <div className="flex flex-1 flex-col space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <WelcomeHeader user={user} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid gap-4">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Recent Generations */}
             <RecentGenerations generations={recentGenerations} />
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
          {/* Usage Summary */}
          <UsageSummary 
            usage={{
              used: totalUsage,
              limit: limit,
              remaining: Math.max(0, limit - totalUsage)
            }} 
          />
          
          {/* Plan Status */}
          <PlanStatus 
            plan={plan}
            isTrial={isTrial}
            daysRemaining={daysRemaining}
          />
        </div>
      </div>
    </div>
  )
}
