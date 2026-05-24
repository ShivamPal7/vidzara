import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconEye, IconClock, IconUsers, IconMouse2, IconHandClick, IconPlayerPlay, IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface KPIData {
  views: { value: number; delta: number };
  watchTime: { value: number; delta: number };
  netSubscribers: { value: number; delta: number };
  impressions: { value: number; delta: number };
  ctr: { value: number; delta: number };
  avgViewDuration: { value: string; delta: number };
}

interface KPICardsProps {
  data: KPIData | null;
  loading?: boolean;
}

export function KPICards({ data, loading }: KPICardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-3 sm:p-5 rounded-xl border border-border/50 bg-card/30 space-y-3 w-full min-w-0 overflow-hidden">
            <Skeleton className="h-4 w-12 sm:w-20" />
            <Skeleton className="h-6 sm:h-8 w-16 sm:w-24" />
            <Skeleton className="h-3 sm:h-4 w-10 sm:w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Views", value: data.views.value.toLocaleString(), delta: data.views.delta, icon: IconEye },
    { label: "Watch Time (hrs)", value: data.watchTime.value.toLocaleString(), delta: data.watchTime.delta, icon: IconClock },
    { label: "Net Subscribers", value: data.netSubscribers.value > 0 ? `+${data.netSubscribers.value.toLocaleString()}` : data.netSubscribers.value.toLocaleString(), delta: data.netSubscribers.delta, icon: IconUsers },
    { label: "Impressions", value: data.impressions.value.toLocaleString(), delta: data.impressions.delta, icon: IconMouse2 },
    { label: "Avg CTR", value: `${data.ctr.value}%`, delta: data.ctr.delta, icon: IconHandClick },
    { label: "Avg View Duration", value: data.avgViewDuration.value, delta: data.avgViewDuration.delta, icon: IconPlayerPlay },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {cards.map((card, i) => {
        const isPositive = card.delta >= 0;
        return (
          <Card key={i} className="p-3 sm:p-5 rounded-xl border border-border/50 bg-card/30 flex flex-col justify-between group hover:bg-card/50 transition-colors duration-300 w-full min-w-0 overflow-hidden">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" stroke={1.5} />
                <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate select-none" title={card.label}>{card.label}</h3>
              </div>
              <div className="text-base sm:text-2xl font-mono tracking-tight mb-1 sm:mb-2 truncate" title={card.value}>
                {card.value}
              </div>
            </div>
            <div className={cn("flex items-center text-[10px] sm:text-xs font-medium", isPositive ? "text-emerald-400" : "text-red-400")}>
              {isPositive ? <IconArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" /> : <IconArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 shrink-0" />}
              <span>{Math.abs(card.delta)}%</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
