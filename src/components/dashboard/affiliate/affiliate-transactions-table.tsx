import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconArrowDownRight, IconArrowUpRight, IconInbox } from "@tabler/icons-react";

export function AffiliateTransactionsTable({
  referrals,
  withdrawals,
}: {
  referrals: any[];
  withdrawals: any[];
}) {
  // Combine and sort both lists
  const combined = [
    ...referrals.map(r => ({
      ...r,
      type: "REFERRAL",
      date: new Date(r.createdAt),
      credits: 5,
    })),
    ...withdrawals.map(w => ({
      ...w,
      type: "WITHDRAWAL",
      date: new Date(w.createdAt),
      credits: -w.creditsAmount,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (combined.length === 0) {
    return (
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <IconInbox className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100">No Transactions Yet</h3>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm">
          Share your referral link to get your first signup. Your earnings and withdrawal history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800/50">
        <h3 className="text-lg font-bold text-zinc-100">Transaction History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Type</TableHead>
              <TableHead className="text-zinc-400 font-medium">Details</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combined.map((item) => (
              <TableRow key={`${item.type}-${item.id}`} className="border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.type === "REFERRAL" 
                        ? 'bg-indigo-500/10 text-indigo-400' 
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {item.type === "REFERRAL" ? <IconArrowDownRight className="w-4 h-4" /> : <IconArrowUpRight className="w-4 h-4" />}
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
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-zinc-200">
                    {item.type === "REFERRAL" ? `+${item.credits} Credits` : `${item.credits} Credits`}
                  </div>
                  {item.type === "WITHDRAWAL" && (
                    <div className="text-xs text-zinc-500">
                      ₹{item.monetaryAmount.toString()}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {item.status === "PENDING" && <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Pending</Badge>}
                  {(item.status === "CREDITED" || item.status === "APPROVED") && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{item.status === "APPROVED" ? "Approved" : "Credited"}</Badge>}
                  {item.status === "REJECTED" && <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Rejected</Badge>}
                  {item.status === "PAID" && <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Paid</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm text-zinc-300">
                    {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {item.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
