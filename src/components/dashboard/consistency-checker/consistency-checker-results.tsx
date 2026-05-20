"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ConsistencyData } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconFlame,
  IconClockHour3,
  IconCalendarStats,
  IconTargetArrow,
  IconChartBar,
} from "@tabler/icons-react";

interface Props {
  data: ConsistencyData;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function regularityColor(label: ConsistencyData["regularityLabel"]): string {
  if (label === "Highly Consistent")
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  if (label === "Moderate")
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  return "bg-rose-500/10 text-rose-400 border-rose-500/30";
}

function velocityIcon(v: ConsistencyData["velocityTrend"]) {
  if (v === "up") return <IconTrendingUp className="h-4 w-4 text-emerald-400" />;
  if (v === "down") return <IconTrendingDown className="h-4 w-4 text-rose-400" />;
  return <IconMinus className="h-4 w-4 text-amber-400" />;
}

function velocityLabel(v: ConsistencyData["velocityTrend"]): string {
  if (v === "up") return "Accelerating";
  if (v === "down") return "Slowing";
  return "Steady";
}

function velocityColor(v: ConsistencyData["velocityTrend"]): string {
  if (v === "up") return "text-emerald-400";
  if (v === "down") return "text-rose-400";
  return "text-amber-400";
}

// Filter options — uploads (for interval mode) or days (for daily-count mode)
const UPLOAD_RANGE_OPTIONS = [
  { label: "Last 5 uploads", value: 5 },
  { label: "Last 10 uploads", value: 10 },
  { label: "Last 15 uploads", value: 15 },
  { label: "Last 20 uploads", value: 20 },
  { label: "Last 30 uploads", value: 30 },
  { label: "Last 50 uploads", value: 50 },
];

const DAY_RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 60 days", value: 60 },
  { label: "Last 90 days", value: 90 },
];

// Custom tooltip shared style
const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: 12,
  boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ConsistencyCheckerResults({ data }: Props) {
  // High-frequency: avg interval < 1 day means multiple uploads/day
  // For these creators, interval-between-videos is misleading (sine-wave oscillation between
  // short intra-day gaps and longer overnight gaps). Instead we show uploads-per-calendar-day.
  const isHighFrequency = data.averageIntervalDays < 1;

  const [intervalFilter, setIntervalFilter] = useState<number>(isHighFrequency ? 30 : 20);

  // ── NORMAL mode: gap between consecutive uploads ─────────────────────────
  const intervalChartData = useMemo(() => {
    if (isHighFrequency) return [];
    const sliced = data.uploads
      .slice(0, intervalFilter)
      .reverse()
      .filter((u) => u.intervalDays !== null);
    return sliced.map((u) => ({
      name: new Date(u.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      days: u.intervalDays,
      title: u.title,
    }));
  }, [data.uploads, intervalFilter, isHighFrequency]);

  // ── HIGH-FREQUENCY mode: uploads grouped by calendar date ────────────────
  // Groups uploads by YYYY-MM-DD, fills zero-upload days, clips x-axis start
  // to the channel's first upload so we don't show empty pre-history.
  const dailyChartData = useMemo(() => {
    if (!isHighFrequency) return [];
    const DAY_MS = 24 * 60 * 60 * 1000;
    const now = new Date();
    const cutoff = new Date(now.getTime() - intervalFilter * DAY_MS);

    // Build date → count map (only videos within the filter window)
    const countByDate = new Map<string, number>();
    for (const u of data.uploads) {
      const d = new Date(u.publishedAt);
      if (d < cutoff) continue;
      const key = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
      countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
    }

    // Find the earliest upload within the window
    const uploadsInWindow = data.uploads.filter((u) => new Date(u.publishedAt) >= cutoff);

    // If there are no uploads in this window, fall back to showing the full range
    // (all zeros is still meaningful — it means no uploads in the selected period)
    let effectiveStart: Date;
    if (uploadsInWindow.length > 0) {
      const oldestInWindow = uploadsInWindow.reduce(
        (min, u) => (new Date(u.publishedAt) < min ? new Date(u.publishedAt) : min),
        new Date()
      );
      // Start from the day of the earliest upload (not from 90 days ago)
      // so we don't show a long flat-zero pre-history before the channel existed.
      effectiveStart = new Date(
        Math.max(cutoff.getTime(), oldestInWindow.getTime())
      );
      // Snap to start of that calendar day
      effectiveStart.setHours(0, 0, 0, 0);
    } else {
      effectiveStart = cutoff;
    }

    // Generate one entry per calendar day from effectiveStart to today
    const days: { name: string; uploads: number; dateStr: string }[] = [];
    let cursor = new Date(effectiveStart);
    cursor.setHours(0, 0, 0, 0);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    while (cursor <= todayStart) {
      const key = cursor.toLocaleDateString("en-CA");
      const label = cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days.push({ name: label, uploads: countByDate.get(key) ?? 0, dateStr: key });
      cursor = new Date(cursor.getTime() + DAY_MS);
    }

    return days;
  }, [data.uploads, intervalFilter, isHighFrequency]);

  // Avg uploads/day — only over the active window days (excludes empty pre-history)
  const avgUploadsPerDay = useMemo(() => {
    if (!isHighFrequency || dailyChartData.length === 0) return 0;
    const total = dailyChartData.reduce((s, d) => s + d.uploads, 0);
    // Divide by total days shown (which is already clipped to active range)
    return parseFloat((total / dailyChartData.length).toFixed(1));
  }, [dailyChartData, isHighFrequency]);

  // Y-axis domain
  const yAxisMax = useMemo(() => {
    if (isHighFrequency) {
      const maxVal = Math.max(...dailyChartData.map((d) => d.uploads), 1);
      return Math.ceil(maxVal * 1.2); // 20% headroom
    }
    if (intervalChartData.length === 0) return 5;
    const maxVal = Math.max(...intervalChartData.map((d) => d.days ?? 0));
    return Math.max(maxVal, 5);
  }, [intervalChartData, dailyChartData, isHighFrequency]);

  // Average reference line for interval chart
  const avgLine = data.averageIntervalDays;

  // Active range options based on mode
  const rangeOptions = isHighFrequency ? DAY_RANGE_OPTIONS : UPLOAD_RANGE_OPTIONS;
  // Active chart data
  const activeChartData = isHighFrequency ? dailyChartData : intervalChartData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 w-full"
    >
      {/* ── Channel Card ─────────────────────────────────────────────────── */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm py-2">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarImage src={data.channel.thumbnailUrl} />
              <AvatarFallback className="text-xl">{data.channel.title.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">{data.channel.title}</h2>
              <p className="text-sm text-muted-foreground truncate">
                {data.channel.handle && `${data.channel.handle} · `}
                {formatSubs(data.channel.subscriberCount)} subscribers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            <Badge
              variant="outline"
              className={cn("border rounded-lg text-xs font-medium px-2.5 py-1", regularityColor(data.regularityLabel))}
            >
              {data.regularityLabel}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "border rounded-lg text-xs font-medium px-2.5 py-1 flex items-center gap-1",
                data.velocityTrend === "up"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : data.velocityTrend === "down"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              )}
            >
              {velocityIcon(data.velocityTrend)}
              {velocityLabel(data.velocityTrend)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <IconClockHour3 className="h-4 w-4" />,
            label: "Avg Interval",
            value: `${data.averageIntervalDays} days`,
            sub: `Median: ${data.medianIntervalDays}d`,
          },
          {
            icon: <IconChartBar className="h-4 w-4" />,
            label: "Videos Analysed",
            value: data.totalVideosAnalyzed.toString(),
            sub: data.cadenceLabel,
          },
          {
            icon: <IconTargetArrow className="h-4 w-4" />,
            label: "Best Upload Day",
            value: data.bestUploadDay,
            sub: "Most frequent day",
          },
          {
            icon: <IconFlame className="h-4 w-4" />,
            label: "Longest Streak",
            value: `${data.longestStreakWeeks}w`,
            sub: `Max gap: ${data.longestGapDays}d`,
          },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-background/40 backdrop-blur-sm py-2">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {stat.icon}
                <span className="text-[11px] font-medium uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Upload Timeline Chart (adaptive) ──────────────────────────────── */}
      <Card className="border-border/50 bg-background/40 backdrop-blur-sm overflow-hidden py-4 gap-0">
        <CardHeader className="pt-0 pb-0 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <IconCalendarStats className="h-4 w-4 text-primary" />
                {isHighFrequency ? "Daily Upload Count" : "Upload Interval Timeline"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isHighFrequency
                  ? "Videos uploaded per calendar day. Flatter = more consistent posting schedule."
                  : "Days elapsed between consecutive uploads. Flatter = more consistent schedule."}
              </CardDescription>
            </div>
            {/* Filter Dropdown */}
            <div className="shrink-0">
              <Select
                value={String(intervalFilter)}
                onValueChange={(val) => setIntervalFilter(Number(val))}
              >
                <SelectTrigger className="w-[150px] h-8 text-xs rounded-lg border-border/50 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 bg-popover">
                  {rangeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)} className="text-xs rounded-lg">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-48 sm:h-56 md:h-72 pt-4 pb-0 px-4 sm:px-6">
          {activeChartData.length < 2 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Not enough data for this range.
            </div>
          ) : isHighFrequency ? (
            /* ── HIGH-FREQUENCY: area chart of uploads per calendar day ──── */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyChartData}
                margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.floor(dailyChartData.length / 8)}
                />
                <YAxis
                  domain={[0, yAxisMax]}
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: number) => [
                    `${value} video${value !== 1 ? "s" : ""}`,
                    "Uploads",
                  ]}
                />
                <ReferenceLine
                  y={avgUploadsPerDay}
                  stroke="hsl(var(--primary) / 0.4)"
                  strokeDasharray="4 4"
                  label={{
                    value: `avg ${avgUploadsPerDay}/day`,
                    fill: "currentColor",
                    className: "text-muted-foreground font-medium",
                    fontSize: 10,
                    position: "right",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uploads"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#dailyGradient)"
                  dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "var(--primary)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            /* ── NORMAL: area chart of gap between consecutive uploads ──── */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={intervalChartData}
                margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="intervalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(intervalChartData.length / 8) - 1)}
                />
                <YAxis
                  domain={[0, yAxisMax]}
                  tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                  unit="d"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600, marginBottom: 4 }}
                  formatter={(value: number, _name: string, props: any) => [
                    `${value} days`,
                    props.payload?.title ? `"${props.payload.title}"` : "Gap",
                  ]}
                />
                <ReferenceLine
                  y={avgLine}
                  stroke="hsl(var(--primary) / 0.4)"
                  strokeDasharray="4 4"
                  label={{
                    value: `avg ${avgLine}d`,
                    fill: "currentColor",
                    className: "text-muted-foreground font-medium",
                    fontSize: 10,
                    position: "right",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="days"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#intervalGradient)"
                  dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "var(--primary)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Weekly Cadence + Day of Week ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly uploads — last 12 weeks */}
        <Card className="border-border/50 bg-background/40 backdrop-blur-sm overflow-hidden py-4 gap-0">
          <CardHeader className="pt-0 pb-0 px-4 sm:px-6">
            <CardTitle className="text-base font-semibold">Weekly Cadence</CardTitle>
            <CardDescription className="text-xs">Uploads per week over the last 12 weeks.</CardDescription>
          </CardHeader>
          <CardContent className="h-52 pt-4 pb-0 px-4 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.weeklyBuckets}
                margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(v: number) => [`${v} upload${v !== 1 ? "s" : ""}`, "Uploads"]}
                />
                <Bar
                  dataKey="uploads"
                  fill="var(--primary)"
                  opacity={0.85}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Day-of-week heatmap */}
        <Card className="border-border/50 bg-background/40 backdrop-blur-sm overflow-hidden py-4 gap-0">
          <CardHeader className="pt-0 pb-0 px-4 sm:px-6">
            <CardTitle className="text-base font-semibold">Best Upload Days</CardTitle>
            <CardDescription className="text-xs">Distribution of uploads by day of the week.</CardDescription>
          </CardHeader>
          <CardContent className="h-52 pt-4 pb-0 px-4 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.dayOfWeekBuckets}
                margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "currentColor", className: "text-muted-foreground" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(v: number) => [`${v} upload${v !== 1 ? "s" : ""}`, "Uploads"]}
                />
                <Bar
                  dataKey="uploads"
                  radius={[4, 4, 0, 0]}
                  fill="var(--primary)"
                  opacity={0.85}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Summary Footer ────────────────────────────────────────────────── */}
      <Card className="border-border/50 bg-background/40 backdrop-blur-sm py-2">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Fastest gap</p>
              <p className="text-xl font-bold text-foreground">{data.minIntervalDays}d</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Longest gap</p>
              <p className="text-xl font-bold text-foreground">{data.longestGapDays}d</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Std deviation</p>
              <p className="text-xl font-bold text-foreground">±{data.stdDevDays}d</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Upload velocity</p>
              <p className={cn("text-xl font-bold", velocityColor(data.velocityTrend))}>
                {velocityLabel(data.velocityTrend)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
