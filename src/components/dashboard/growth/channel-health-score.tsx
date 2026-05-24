import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconHeartbeat, IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ChannelHealthScoreProps {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  actionItems?: string[];
}

export function ChannelHealthScore({ score, strengths, weaknesses, actionItems }: ChannelHealthScoreProps) {
  if (score === undefined) {
    return (
      <Card className="rounded-xl border border-border/50 bg-card/30 p-8 flex flex-col items-center justify-center text-center h-[400px]">
        <IconHeartbeat className="w-16 h-16 text-muted-foreground mb-4" stroke={1.5} />
        <h3 className="text-xl font-bold mb-2">Channel Health Score</h3>
        <p className="text-muted-foreground mb-6 max-w-[250px] text-sm">
          Run an AI analysis to see what's working and what needs improvement.
        </p>
        <Button>Generate Analysis</Button>
      </Card>
    );
  }

  // Calculate stroke dasharray for the ring
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-emerald-500";
  let bgClass = "bg-emerald-500/10";
  if (score < 50) {
    colorClass = "text-red-500";
    bgClass = "bg-red-500/10";
  } else if (score < 80) {
    colorClass = "text-amber-500";
    bgClass = "bg-amber-500/10";
  }

  return (
    <Card className="rounded-xl border border-border/50 bg-card/30 p-5 flex flex-col min-h-[400px] h-full">
      <div className="flex items-center gap-2 mb-4">
        <IconHeartbeat className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Channel Health</h3>
      </div>
      
      <div className="flex items-center gap-5 mb-5 bg-zinc-900/30 p-4 rounded-xl border border-border/30">
        <div className="relative shrink-0 w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle cx="40" cy="40" r={radius} className="stroke-muted fill-transparent" strokeWidth="6" stroke="#334155" opacity="0.3" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              className={cn("fill-transparent transition-all duration-1000 ease-out", colorClass)}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-xl font-bold font-mono tracking-tight", colorClass)}>{score}</span>
            <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-medium">Score</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider", bgClass, colorClass)}>
            {score >= 80 ? "Excellent" : score >= 50 ? "Healthy" : "Attention"}
          </span>
          <h4 className="text-sm font-semibold text-foreground leading-tight">Vidzara Analytics Index</h4>
          <p className="text-xs text-muted-foreground leading-tight">Channel is optimized above the average creator cohort.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {strengths && strengths.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Strengths</h4>
            <ul className="space-y-1.5">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 leading-tight">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {weaknesses && weaknesses.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Areas to Improve</h4>
            <ul className="space-y-1.5">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <IconX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/90 leading-tight">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {actionItems && actionItems.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Action Items</h4>
            <ul className="space-y-2">
              {actionItems.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2 bg-card/50 p-2 rounded-lg border border-border/50">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-foreground/90 leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto border-t border-border/50 flex justify-end">
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
          <IconRefresh className="w-3.5 h-3.5 mr-1.5" />
          Refresh Analysis
        </Button>
      </div>
    </Card>
  );
}
