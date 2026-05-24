"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { IconUsers } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DemographicsProps {
  data: Array<[string, string, number]>; // ageGroup, gender, viewerPercentage
  className?: string;
}

const GENDER_COLORS: Record<string, string> = {
  male: "#6366f1", // Indigo
  female: "#ec4899", // Pink
  userSpecified: "#94a3b8", // Slate (Muted)
};

export function Demographics({ data, className }: DemographicsProps) {
  // Aggregate by age
  const ageMap: Record<string, number> = {};
  // Aggregate by gender
  const genderMap: Record<string, number> = {};

  data.forEach(([ageGroup, gender, percentage]) => {
    // Standardize age groups if they come like "age1824"
    const displayAge = ageGroup.replace("age", "").replace(/(\d{2})(\d{2})/, "$1-$2").replace("65_", "65+");
    ageMap[displayAge] = (ageMap[displayAge] || 0) + percentage;
    genderMap[gender] = (genderMap[gender] || 0) + percentage;
  });

  const ageData = Object.entries(ageMap)
    .map(([age, percentage]) => ({ age, percentage: Number(percentage.toFixed(1)) }))
    .sort((a, b) => a.age.localeCompare(b.age));

  const genderData = Object.entries(genderMap)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Number(value.toFixed(1)), key: name }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card className={cn("rounded-xl border border-border/50 bg-card/30 p-5 flex flex-col min-h-[400px] h-auto lg:h-[450px] w-full min-w-0 overflow-hidden", className)}>
      <div className="flex items-center gap-2 mb-6">
        <IconUsers className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Demographics</h3>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0">
        <div className="w-full md:w-2/3 h-auto md:h-full flex flex-col min-h-[220px]">
          <h4 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">Age Groups</h4>
          <div className="flex-1 min-h-[180px] md:min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="age" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="percentage" name="Views %" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="w-full md:w-1/3 h-auto md:h-full flex flex-col min-h-[200px]">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider text-center">Gender</h4>
          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.key] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
            {genderData.map((g) => (
              <div key={g.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GENDER_COLORS[g.key] || "hsl(var(--muted))" }} />
                <span className="text-muted-foreground">{g.name}</span>
                <span className="font-mono font-medium">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
