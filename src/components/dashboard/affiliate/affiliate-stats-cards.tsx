import { IconUsers, IconCoins, IconCurrencyRupee, IconTrendingDown } from "@tabler/icons-react";

export function AffiliateStatsCards({
  affiliate,
}: {
  affiliate: {
    affiliateCredits: number;
    totalEarningsDecimal: string;
    withdrawnCredits: number;
    referrals: any[];
  };
}) {
  const estimatedValue = (affiliate.affiliateCredits * 0.05).toFixed(2);
  const totalEarnings = parseFloat(affiliate.totalEarningsDecimal).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Signups */}
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Signups</span>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
            <IconUsers className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-zinc-100">{affiliate.referrals.length}</div>
        </div>
      </div>

      {/* Card 2: Affiliate Credits */}
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Available Credits</span>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
            <IconCoins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <div className="text-3xl font-extrabold text-zinc-100">{affiliate.affiliateCredits.toLocaleString()}</div>
          <span className="text-sm font-medium text-emerald-400">≈ ₹{estimatedValue}</span>
        </div>
      </div>

      {/* Card 3: Commission Earned */}
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Earned</span>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 group-hover:border-amber-500/30 transition-colors">
            <IconCurrencyRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-zinc-100">₹{totalEarnings}</div>
        </div>
      </div>

      {/* Card 4: Withdrawn */}
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full group-hover:bg-violet-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Withdrawn</span>
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-violet-400 group-hover:border-violet-500/30 transition-colors">
            <IconTrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-zinc-100">{affiliate.withdrawnCredits.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
