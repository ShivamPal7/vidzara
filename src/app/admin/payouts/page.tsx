import { getWithdrawalRequests } from "@/actions/admin/affiliates";
import { PayoutsTable } from "@/components/admin/payouts/payouts-table";
import {
  IconCash,
  IconClock,
  IconCheckbox,
  IconCurrencyRupee,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPayoutsPage() {
  const requests = await getWithdrawalRequests();

  // Metrics
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");

  const totalPendingAmount = pendingRequests.reduce(
    (sum, r) => sum + Number(r.monetaryAmount),
    0
  );
  const totalApprovedAmount = approvedRequests.reduce(
    (sum, r) => sum + Number(r.monetaryAmount),
    0
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 font-outfit">
            Affiliate Payouts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and process withdrawal requests from affiliate partners.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pending Payouts */}
        <Card className="relative overflow-hidden bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm group hover:border-indigo-500/20 transition-all duration-300 shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-amber-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <IconClock size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Pending Payouts
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Awaiting admin review
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <IconClock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold tracking-tight text-zinc-100 font-mono">
              {pendingRequests.length}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">
                <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                Needs action
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Requested (INR) */}
        <Card className="relative overflow-hidden bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm group hover:border-indigo-500/20 transition-all duration-300 shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <IconCurrencyRupee size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Pending Amount
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Total value of pending requests
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <IconCash className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold tracking-tight text-zinc-100 font-mono">
              ₹{totalPendingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-400/5 px-1.5 py-0.5 rounded border border-indigo-500/10">
                <IconCurrencyRupee className="w-3 h-3" />
                INR equivalent
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Approved */}
        <Card className="relative overflow-hidden bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm group hover:border-indigo-500/20 transition-all duration-300 shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <IconCheckbox size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Total Approved
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Successfully processed payouts
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <IconCheckbox className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold tracking-tight text-zinc-100 font-mono">
              {approvedRequests.length}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/5 px-1.5 py-0.5 rounded border border-emerald-400/10">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                ₹{totalApprovedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} paid out
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
          <div>
            <h2 className="font-semibold text-zinc-200">All Withdrawal Requests</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage payout requests from affiliate partners.
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-850 border border-zinc-800 px-2 py-1 rounded">
            {requests.length} {requests.length === 1 ? "request" : "requests"}
          </span>
        </div>
        <PayoutsTable requests={requests} />
      </div>
    </div>
  );
}
