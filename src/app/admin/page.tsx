import { getAnalyticsOverview, getToolUsage } from "@/actions/admin/analytics";
import { 
  IconUsers, 
  IconCreditCard, 
  IconWand, 
  IconActivity,
  IconSearch,
  IconScript,
  IconPhoto,
  IconSparkles,
  IconScissors,
  IconShieldCheck,
  IconBulb,
  IconCalendarStats,
  IconTarget,
  IconChartBar,
  IconMessage2
} from "@tabler/icons-react";

interface FeatureConfig {
  name: string;
  category: "Create" | "Optimize" | "Analyze" | "Growth" | "Other";
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGlow: string;
}

const FEATURE_MAP: Record<string, FeatureConfig> = {
  SCRIPT_WRITER: {
    name: "Script Writer",
    category: "Create",
    icon: IconScript,
    gradient: "from-indigo-500 via-purple-500 to-violet-500",
    bgGlow: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  VIDEO_SEO: {
    name: "Video SEO Generator",
    category: "Create",
    icon: IconSearch,
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    bgGlow: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  THUMBNAIL_CONCEPT: {
    name: "Thumbnail Generator",
    category: "Create",
    icon: IconPhoto,
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    bgGlow: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  HOOK_DETECTOR: {
    name: "Hook Detector",
    category: "Optimize",
    icon: IconSparkles,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGlow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  SCRIPT_SHORTENER: {
    name: "Script Shortener",
    category: "Optimize",
    icon: IconScissors,
    gradient: "from-teal-500 via-emerald-500 to-green-500",
    bgGlow: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  CONTENT_SAFETY: {
    name: "Content Safety Checker",
    category: "Optimize",
    icon: IconShieldCheck,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGlow: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  TOPIC_GENERATOR: {
    name: "Competitor Topic Generator",
    category: "Analyze",
    icon: IconBulb,
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    bgGlow: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  COMPETITORS: {
    name: "Competitor Analyst",
    category: "Analyze",
    icon: IconUsers,
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    bgGlow: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  CONSISTENCY_CHECKER: {
    name: "Consistency Checker",
    category: "Analyze",
    icon: IconCalendarStats,
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    bgGlow: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  },
  NICHE_FINDER: {
    name: "Niche Finder",
    category: "Analyze",
    icon: IconTarget,
    gradient: "from-rose-500 via-orange-500 to-amber-500",
    bgGlow: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  GROWTH_DASHBOARD: {
    name: "Creator Growth Dashboard",
    category: "Growth",
    icon: IconChartBar,
    gradient: "from-indigo-500 via-violet-500 to-purple-500",
    bgGlow: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  CHAT: {
    name: "AI Coaching Chat",
    category: "Growth",
    icon: IconMessage2,
    gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
    bgGlow: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  }
};

function getFeatureConfig(featureName: string): FeatureConfig {
  const normalized = featureName.toUpperCase().trim();
  if (normalized in FEATURE_MAP) {
    return FEATURE_MAP[normalized];
  }
  
  // Dynamic fallback for custom features
  const displayName = featureName
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
    
  return {
    name: displayName,
    category: "Other",
    icon: IconSparkles,
    gradient: "from-indigo-500 via-indigo-600 to-violet-500",
    bgGlow: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
}

export default async function AdminDashboardPage() {
  const overview = await getAnalyticsOverview();
  const toolUsage = await getToolUsage();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Premium Visual Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950/20 px-6 py-8 md:px-8 md:py-10 backdrop-blur-sm">
        {/* Visual Glow Accents */}
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              System Live
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-zinc-100 to-indigo-300 bg-clip-text text-transparent mt-2">
              Dashboard Overview
            </h1>
            <p className="text-zinc-400 max-w-xl text-sm md:text-base">
              Monitor real-time key metrics, user growth, subscription analytics, and active AI feature utilization.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">System Status</span>
              <span className="text-sm font-semibold text-zinc-300">All services operational</span>
            </div>
            <div className="h-10 w-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-md">
              <IconActivity className="h-5 w-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic Metric Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Metric Card 1: Total Users */}
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 glass-2 rounded-2xl transition-all duration-300 hover:shadow-indigo-500/5 hover:border-indigo-500/30 hover:scale-[1.01] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full transition-all duration-300 group-hover:bg-indigo-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Users</span>
            <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-indigo-400 shadow-inner group-hover:border-indigo-500/30 transition-colors duration-300">
              <IconUsers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold tracking-tight text-zinc-100">
              {overview.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Registered platform creators
            </p>
          </div>
        </div>

        {/* Metric Card 2: Active Subscriptions */}
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 glass-2 rounded-2xl transition-all duration-300 hover:shadow-indigo-500/5 hover:border-indigo-500/30 hover:scale-[1.01] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all duration-300 group-hover:bg-emerald-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Active Subscriptions</span>
            <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-emerald-400 shadow-inner group-hover:border-emerald-500/30 transition-colors duration-300">
              <IconCreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold tracking-tight text-zinc-100">
              {overview.totalActiveSubs.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Currently paying customers
            </p>
          </div>
        </div>

        {/* Metric Card 3: Total Generations */}
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 glass-2 rounded-2xl transition-all duration-300 hover:shadow-indigo-500/5 hover:border-indigo-500/30 hover:scale-[1.01] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full transition-all duration-300 group-hover:bg-violet-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Generations</span>
            <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-violet-400 shadow-inner group-hover:border-violet-500/30 transition-colors duration-300">
              <IconWand className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold tracking-tight text-zinc-100">
              {overview.totalGenerations.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400" />
              AI processing requests handled
            </p>
          </div>
        </div>
      </div>

      {/* Redesigned Tool Usage Breakdown Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 glass-2 rounded-2xl transition-all duration-300 hover:shadow-indigo-500/5 hover:border-indigo-500/30 hover:scale-[1.01] p-6 relative overflow-hidden md:col-span-2">
          {/* Subtle Visual Glow Accent */}
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <IconActivity className="h-5 w-5 text-indigo-400" />
                Tool Usage Breakdown
              </h3>
              <p className="text-sm text-zinc-400">
                Detailed analysis of AI generation activity across platform features.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-1.5 text-xs text-zinc-400 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Live activity tracking
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {toolUsage.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                <p className="text-zinc-500 text-sm">No feature usage statistics recorded yet.</p>
              </div>
            ) : (
              toolUsage
                .sort((a, b) => b.usage - a.usage)
                .map((tool) => {
                  const config = getFeatureConfig(tool.name);
                  const ToolIcon = config.icon;
                  const percentage = overview.totalGenerations > 0 
                    ? (tool.usage / overview.totalGenerations) * 100 
                    : 0;

                  return (
                    <div 
                      key={tool.name} 
                      className="group/row flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800/30 bg-zinc-900/10 hover:border-zinc-800/60 hover:bg-zinc-900/20 transition-all duration-200"
                    >
                      {/* Left: Icon / Avatar + Tool Name & Category */}
                      <div className="flex items-center gap-3.5 md:w-1/3">
                        <div className={`p-2.5 rounded-xl border ${config.bgGlow} transition-all duration-300 shadow-md group-hover/row:scale-105`}>
                          <ToolIcon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-200 group-hover/row:text-zinc-100 transition-colors">
                              {config.name}
                            </span>
                          </div>
                          <span className="inline-flex text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border bg-zinc-950/50 text-zinc-400 border-zinc-800/50">
                            {config.category}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Progress Bar */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>Usage Share</span>
                          <span className="font-medium text-zinc-400">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-zinc-900 border border-zinc-800/40 rounded-full overflow-hidden relative">
                          <div 
                            className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500 ease-out shadow-sm`}
                            style={{ width: `${Math.max(3, percentage)}%` }} 
                          />
                        </div>
                      </div>

                      {/* Right: Run Count */}
                      <div className="flex shrink-0 items-center justify-between md:justify-end gap-3 md:w-32 border-t md:border-t-0 border-zinc-800/40 pt-3 md:pt-0">
                        <span className="md:hidden text-xs text-zinc-500">Total Runs</span>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-zinc-100">
                            {tool.usage.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-zinc-500">generations</div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

