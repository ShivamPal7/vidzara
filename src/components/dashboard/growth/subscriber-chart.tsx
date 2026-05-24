"use client";

import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { IconUsersGroup } from "@tabler/icons-react";

interface SubscriberChartProps {
  data: Array<[string, number, number]>; // date, gained, lost
}

export function SubscriberChart({ data }: SubscriberChartProps) {
  const chartData = data.map(([date, gained, lost]) => ({
    date,
    gained,
    lost: -lost, // Make it negative for the stacked chart effect
    net: gained - lost,
  }));

  return (
    <Card className="rounded-xl border border-border/50 bg-card/30 p-5 flex flex-col h-[400px] w-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <IconUsersGroup className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Subscriber Growth</h3>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} stackOffset="sign" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
              cursor={{ fill: '#334155', opacity: 0.2 }}
            />
            <Bar dataKey="gained" name="Gained" fill="#10b981" stackId="stack" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lost" name="Lost" fill="#f43f5e" stackId="stack" radius={[0, 0, 4, 4]} />
            <Line type="monotone" dataKey="net" name="Net Subs" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: "#09090b", strokeWidth: 2, stroke: "#8b5cf6" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
