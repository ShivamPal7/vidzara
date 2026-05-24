"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { IconDevices } from "@tabler/icons-react";

interface DeviceBreakdownProps {
  data: Array<[string, number]>; // deviceType, views
}

const deviceMapping: Record<string, string> = {
  MOBILE: "Mobile",
  DESKTOP: "Desktop",
  TABLET: "Tablet",
  TV: "Smart TV",
  GAME_CONSOLE: "Console",
};

const COLORS = [
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#94a3b8", // Slate (Muted)
];

export function DeviceBreakdown({ data }: DeviceBreakdownProps) {
  const totalViews = data.reduce((acc, curr) => acc + curr[1], 0);
  
  const chartData = data.map(([deviceType, views]) => ({
    name: deviceMapping[deviceType] || "Other",
    views,
    percentage: ((views / totalViews) * 100).toFixed(1),
  })).sort((a, b) => b.views - a.views);

  return (
    <Card className="rounded-xl border border-border/50 bg-card/30 p-5 flex flex-col min-h-[400px] h-auto lg:h-[400px] w-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <IconDevices className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Device Breakdown</h3>
      </div>
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 sm:gap-4 min-h-0 w-full">
        <div className="w-full sm:w-1/2 h-[220px] sm:h-full min-h-[200px] sm:min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="views"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full sm:w-1/2 flex flex-col gap-4 sm:pl-4 overflow-y-auto max-h-[180px] sm:max-h-[250px] w-full">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-medium text-foreground truncate">{entry.name}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground ml-5">
                <span className="font-mono text-xs">{entry.percentage}%</span>
                <span className="font-mono text-xs">{entry.views.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
