import {
  IconHandClick,
  IconUsers,
  IconShoppingCart,
  IconWallet,
  IconCircleCheck,
} from "@tabler/icons-react";

interface StatsProps {
  stats: {
    totalClicks: number;
    totalSignups: number;
    subscriptionSales: number;
    totalEarnings: number;
    paidEarnings: number;
    affiliateCredits: number;
    totalWithdrawn?: number;
  };
}

export function AffiliateStatsCards({ stats }: StatsProps) {
  const formattedTotalEarnings = (stats?.totalEarnings ?? 0).toFixed(2);
  const formattedPaidEarnings = (stats?.paidEarnings ?? 0).toFixed(2);

  const cards = [
    {
      title: "Total Clicks",
      value: (stats?.totalClicks ?? 0).toLocaleString(),
      icon: IconHandClick,
      colorClass: "text-indigo-400 group-hover:border-indigo-500/30",
      gradient: "linear-gradient(135deg, hsla(224, 76%, 48%, 0.08) 0%, hsla(224, 76%, 48%, 0.01) 100%)",
      glow: "radial-gradient(circle, hsla(224, 76%, 48%, 0.4) 0%, transparent 70%)",
      hoverBorder: "hover:border-indigo-500/30",
    },
    {
      title: "Total Signups",
      value: (stats?.totalSignups ?? 0).toLocaleString(),
      icon: IconUsers,
      colorClass: "text-violet-400 group-hover:border-violet-500/30",
      gradient: "linear-gradient(135deg, hsla(263, 70%, 50%, 0.08) 0%, hsla(263, 70%, 50%, 0.01) 100%)",
      glow: "radial-gradient(circle, hsla(263, 70%, 50%, 0.4) 0%, transparent 70%)",
      hoverBorder: "hover:border-violet-500/30",
    },
    {
      title: "Subscription Sales",
      value: (stats?.subscriptionSales ?? 0).toLocaleString(),
      icon: IconShoppingCart,
      colorClass: "text-emerald-400 group-hover:border-emerald-500/30",
      gradient: "linear-gradient(135deg, hsla(142, 72%, 29%, 0.08) 0%, hsla(142, 72%, 29%, 0.01) 100%)",
      glow: "radial-gradient(circle, hsla(142, 72%, 29%, 0.4) 0%, transparent 70%)",
      hoverBorder: "hover:border-emerald-500/30",
    },
    {
      title: "Total Earned",
      value: `₹${formattedTotalEarnings}`,
      icon: IconWallet,
      colorClass: "text-amber-400 group-hover:border-amber-500/30",
      gradient: "linear-gradient(135deg, hsla(38, 92%, 50%, 0.08) 0%, hsla(38, 92%, 50%, 0.01) 100%)",
      glow: "radial-gradient(circle, hsla(38, 92%, 50%, 0.4) 0%, transparent 70%)",
      hoverBorder: "hover:border-amber-500/30",
    },
    {
      title: "Paid Earnings",
      value: `₹${formattedPaidEarnings}`,
      icon: IconCircleCheck,
      colorClass: "text-sky-400 group-hover:border-sky-500/30",
      gradient: "linear-gradient(135deg, hsla(187, 85%, 35%, 0.08) 0%, hsla(187, 85%, 35%, 0.01) 100%)",
      glow: "radial-gradient(circle, hsla(187, 85%, 35%, 0.4) 0%, transparent 70%)",
      hoverBorder: "hover:border-sky-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl border border-zinc-800/50 p-4 md:p-6 backdrop-blur-xl transition-all duration-300 group ${card.hoverBorder}`}
            style={{
              background: card.gradient,
            }}
          >
            <div
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full transition-all duration-300 opacity-20 group-hover:scale-110 pointer-events-none"
              style={{
                background: card.glow,
              }}
            />
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-bold text-zinc-400 tracking-wider uppercase leading-tight">{card.title}</span>
              <div className={`p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 transition-colors shrink-0 ${card.colorClass}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 md:mt-4">
              <div className="text-2xl md:text-3xl font-extrabold text-zinc-100 truncate">{card.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
