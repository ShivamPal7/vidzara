"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { IconChartLine } from "@tabler/icons-react";

interface ViewsChartProps {
  data: Array<[string, number, number]>; // date, views, minutesWatched
}

export function ViewsChart({ data }: ViewsChartProps) {
  const chartData = data.map(([date, views, minutesWatched]) => ({
    date,
    views,
    watchHours: Number((minutesWatched / 60).toFixed(1)),
  }));

  return (
    <Card className="rounded-xl border border-border/50 bg-card/30 p-5 flex flex-col h-[400px] w-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <IconChartLine className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Views & Watch Time</h3>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWatchHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
            <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10} />
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
            <Area yAxisId="right" type="monotone" dataKey="watchHours" name="Watch Hours" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorWatchHours)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
