import { Badge } from "@/components/ui/badge";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconInbox,
} from "@tabler/icons-react";

export function AffiliateTransactionsTable({
  referrals,
  withdrawals,
}: {
  referrals: any[];
  withdrawals: any[];
}) {
  const combined = [
    ...referrals.map((r) => ({
      ...r,
      type: "REFERRAL",
      date: new Date(r.createdAt),
      credits: 5,
    })),
    ...withdrawals.map((w) => ({
      ...w,
      type: "WITHDRAWAL",
      date: new Date(w.createdAt),
      credits: -w.creditsAmount,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (combined.length === 0) {
    return (
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-10 sm:p-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <IconInbox className="w-7 h-7 sm:w-8 sm:h-8 opacity-50" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-zinc-100">No Transactions Yet</h3>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm">
          Share your referral link to get your first signup. Your earnings and
          withdrawal history will appear here.
        </p>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] sm:text-xs">Pending</Badge>;
      case "CREDITED":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] sm:text-xs">Credited</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] sm:text-xs">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] sm:text-xs">Rejected</Badge>;
      case "PAID":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] sm:text-xs">Paid</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-zinc-800/50">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100">Transaction History</h3>
        <p className="text-xs text-zinc-500 mt-0.5">{combined.length} transactions</p>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-zinc-800/50">
        {combined.map((item) => (
          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 px-4 py-3.5">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                item.type === "REFERRAL"
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {item.type === "REFERRAL" ? (
                <IconArrowDownRight className="w-4 h-4" />
              ) : (
                <IconArrowUpRight className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-200 truncate">
                  {item.type === "REFERRAL" ? "Signup Reward" : "Payout Request"}
                </span>
                <span
                  className={`text-sm font-bold shrink-0 ${
                    item.type === "REFERRAL" ? "text-indigo-400" : "text-emerald-400"
                  }`}
                >
                  {item.type === "REFERRAL" ? `+${item.credits}` : `${item.credits}`} cr
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-zinc-500">
                  {item.date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {statusBadge(item.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-900/50">
            <tr className="border-b border-zinc-800">
              <th className="text-left px-6 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Details</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {combined.map((item) => (
              <tr
                key={`${item.type}-${item.id}`}
                className="hover:bg-zinc-900/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        item.type === "REFERRAL"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {item.type === "REFERRAL" ? (
                        <IconArrowDownRight className="w-4 h-4" />
                      ) : (
                        <IconArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">
                        {item.type === "REFERRAL" ? "Signup Reward" : "Payout Request"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.type === "REFERRAL" ? "Referred User" : item.method}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-zinc-200">
                    {item.type === "REFERRAL"
                      ? `+${item.credits} Credits`
                      : `${item.credits} Credits`}
                  </div>
                  {item.type === "WITHDRAWAL" && (
                    <div className="text-xs text-zinc-500">₹{item.monetaryAmount.toString()}</div>
                  )}
                </td>
                <td className="px-6 py-4">{statusBadge(item.status)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm text-zinc-300">
                    {item.date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {item.date.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
