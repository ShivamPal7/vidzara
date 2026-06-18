import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { startOfDay } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { 
  IconCoins, 
  IconBolt, 
  IconCrown, 
  IconBrandYoutube, 
  IconArrowRight, 
  IconSearch, 
  IconFileText, 
  IconPhoto, 
  IconScissors, 
  IconTarget, 
  IconShieldCheck, 
  IconBulb, 
  IconEye, 
  IconCompass, 
  IconChecklist, 
  IconSparkles,
  IconMessageChatbot,
  IconHistory
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getPlanLimit } from "@/constants/limits"
import { getConnectedChannel } from "@/actions/growth-analytics"
import { RecentGenerations } from "@/components/dashboard/home/recent-generations"
import { getGenerationHistory } from "@/actions/history"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  const user = session.user

  // Fetch subscription, usage, recent history, user credits, and connected channel in parallel
  const [subscription, usageRecords, historyResult, userRecord, channelResult] = await Promise.all([
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
    getGenerationHistory({ page: 1, limit: 5 }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    }),
    getConnectedChannel(),
  ])

  // Credit balance
  const credits = userRecord?.credits ?? 0
  const recentGenerations = historyResult.success && historyResult.data ? historyResult.data.items : []

  // Calculate usage stats
  const plan = subscription?.plan || "FREE"
  const totalUsage = usageRecords.reduce((acc, record) => acc + record.count, 0)
  const limit = getPlanLimit(plan)
  const usagePercentage = Math.min((totalUsage / limit) * 100, 100)
  
  // Trial calculations
  const isTrial = subscription?.status === "TRIALING"
  let daysRemaining = 0
  if (isTrial) {
    let trialEndsAt = subscription?.trialEndsAt
    
    // Check if missing or holds a Unix epoch placeholder (e.g. year < 2000)
    const isEpoch = trialEndsAt && trialEndsAt.getFullYear() < 2000
    if (!trialEndsAt || isEpoch) {
      const baseDate = subscription?.createdAt || new Date()
      // Fallback to createdAt + 7 days
      trialEndsAt = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    }

    const now = new Date()
    if (trialEndsAt > now) {
      const diffTime = trialEndsAt.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
  }

  const hours = new Date().getHours()
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening"

  const quickTools = [
    {
      title: "Script Writer",
      description: "Draft viral scripts for YouTube, Shorts & Reels",
      url: "/dashboard/create/script-writer",
      icon: IconFileText,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    },
    {
      title: "Video SEO",
      description: "Optimized click-driving titles, tags and descriptions",
      url: "/dashboard/create/video-seo",
      icon: IconSearch,
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    },
    {
      title: "Hook Detector",
      description: "Analyze the first 3-5 seconds to maximize retention",
      url: "/dashboard/optimize/hook-detector",
      icon: IconTarget,
      color: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    },
    {
      title: "Thumbnail Concepts",
      description: "Get visual ideas and color layouts to boost CTR",
      url: "/dashboard/create/thumbnail",
      icon: IconPhoto,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    },
    {
      title: "Script Shortener",
      description: "Condense long scripts into short-form content",
      url: "/dashboard/optimize/script-shortener",
      icon: IconScissors,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      title: "Topic Generator",
      description: "Extract high-performing competitor video patterns",
      url: "/dashboard/analyze/topic-generator",
      icon: IconBulb,
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    },
    {
      title: "Niche Finder",
      description: "Discover low-competition profitable content spaces",
      url: "/dashboard/analyze/niche-finder",
      icon: IconCompass,
      color: "text-teal-400 border-teal-500/20 bg-teal-500/5",
    },
    {
      title: "Content Safety",
      description: "Scan for policy risks, clickbait, and safety issues",
      url: "/dashboard/optimize/content-safety",
      icon: IconShieldCheck,
      color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    },
  ]

  return (
    <div className="relative flex-1 space-y-8 pb-12 overflow-hidden">
      {/* Visual background ambient glow orbs */}
      <div className="absolute top-10 left-10 size-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-orb-a" />
      <div className="absolute bottom-20 right-10 size-80 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-orb-b" />

      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 md:p-8 shadow-sm animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              {greeting}, {user.name}!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Unlock your channel's potential with AI-driven scripts, optimization tools, and strategic YouTube coaching. What are we creating today?
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-6 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all"
          >
            <Link href="/dashboard/new">
              <IconMessageChatbot className="size-5" />
              <span>Ask AI Growth Coach</span>
              <IconArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-slide-up-delayed">
        {/* Credits Balance Card */}
        <Card className="py-0 bg-card border border-border/50 hover:border-primary/30 transition-all shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 min-w-0">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Credits Remaining</span>
                <div className="text-2xl sm:text-3xl font-bold flex items-baseline gap-1 mt-1">
                  <span>{credits}</span>
                  <span className="text-xs font-normal text-muted-foreground">left</span>
                </div>
              </div>
              <div className="rounded-xl p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <IconCoins className="size-4 sm:size-5 animate-pulse" />
              </div>
            </div>
            {plan !== "UNLIMITED_PRO" && (
              <Link href="/dashboard/billing" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 mt-4 group">
                <span>Top up or Upgrade</span>
                <IconArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Daily Generations Card */}
        <Card className="py-0 bg-card border border-border/50 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 min-w-0 w-full">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Daily Generations</span>
                <div className="text-2xl sm:text-3xl font-bold flex items-baseline gap-1 mt-1">
                  <span>{totalUsage}</span>
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">/ {limit}</span>
                </div>
              </div>
              <div className="rounded-xl p-2 bg-primary/10 text-primary border border-primary/20 shrink-0">
                <IconBolt className="size-4 sm:size-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Progress value={usagePercentage} className="h-1.5 bg-muted/40" />
              <p className="text-[10px] text-muted-foreground font-normal">
                {Math.max(0, limit - totalUsage)} remaining today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Tier Status Card */}
        <Card className="py-0 bg-card border border-border/50 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 min-w-0">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Subscription Tier</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-bold capitalize truncate">
                    {plan.replace("_", " ").toLowerCase()}
                  </span>
                  {isTrial && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded-full shrink-0">
                      Trial
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-xl p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <IconCrown className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-normal">
              {isTrial ? `${daysRemaining} days left in trial` : "Active Subscription"}
            </p>
          </CardContent>
        </Card>

        {/* Connected YouTube Channel Card */}
        <Card className="py-0 bg-card border border-border/50 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full min-h-[120px]">
            {channelResult.success && channelResult.data ? (
              // Connected Channel View
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative size-10 rounded-full overflow-hidden border border-border/60 shrink-0">
                      <Image 
                        src={channelResult.data.thumbnailUrl || "/logo.png"} 
                        alt="Channel Avatar" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate leading-tight">{channelResult.data.channelTitle}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{channelResult.data.channelHandle || `@${channelResult.data.channelTitle.toLowerCase().replace(/\s+/g, '')}`}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    <IconBrandYoutube className="size-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Subscribers</span>
                  <span className="text-base font-extrabold text-foreground">{Number(channelResult.data.subscriberCount).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              // Disconnected Channel View
              <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Connected Channel</span>
                    <p className="text-sm font-semibold mt-1 truncate">None Connected</p>
                  </div>
                  <div className="rounded-xl p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    <IconBrandYoutube className="size-4 sm:size-5" />
                  </div>
                </div>
                <Link 
                  href="/dashboard/growth" 
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 mt-4 group"
                >
                  <span>Link YouTube Channel</span>
                  <IconArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Redesigned Quick Tools Section (Clean grid list, no tabs or categorizations) */}
      <div className="space-y-4 animate-slide-up-delayed-2">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <IconSparkles className="size-4 text-primary" />
            <span>Quick Launch Creator Tools</span>
          </h2>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {quickTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card 
                key={tool.title} 
                className="py-0 group relative overflow-hidden border border-border/40 hover:border-primary/30 bg-card/40 hover:bg-card/75 transition-all duration-200 shadow-sm rounded-xl cursor-pointer"
              >
                <Link href={tool.url} className="block p-4 sm:p-5 h-full">
                  <div className="flex flex-col justify-between h-full gap-4">
                    <div className="space-y-2">
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${tool.color} transition-all duration-200 group-hover:scale-105`}>
                        <Icon className="size-5" />
                      </div>
                      <h3 className="text-sm font-bold group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-normal font-normal">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                      <span>Launch Tool</span>
                      <IconArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="grid gap-6 animate-slide-up-delayed-2 pt-2">
        <RecentGenerations generations={recentGenerations} />
      </div>
    </div>
  )
}
