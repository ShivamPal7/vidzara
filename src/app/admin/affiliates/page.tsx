import { getAffiliates } from "@/actions/admin/affiliates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  IconUsers, 
  IconShare, 
  IconPercentage, 
  IconTrendingUp, 
  IconAward, 
  IconCalendar 
} from "@tabler/icons-react";
import { AffiliateActions } from "./affiliate-actions";
import { CopyCodeBadge } from "./copy-code-badge";

export default async function AdminAffiliatesPage() {
  const affiliates = await getAffiliates();

  // Metrics calculations
  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter((a) => a.enabled).length;
  const inactiveAffiliates = totalAffiliates - activeAffiliates;

  const totalReferrals = affiliates.reduce((sum, a) => sum + a.referrals.length, 0);

  const totalConversions = affiliates.reduce((sum, a) => {
    return sum + a.referrals.filter((r) => r.status === "CREDITED" || r.status === "PAID").length;
  }, 0);

  const averageCommissionRate = totalAffiliates > 0
    ? (affiliates.reduce((sum, a) => sum + Number(a.commissionRate), 0) / totalAffiliates) * 100
    : 10.0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 font-outfit">Affiliate Partners</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your creators, referral codes, commission rates, and track system-wide marketing growth.
          </p>
        </div>
      </div>

      {/* Metrics widgets */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Total Partners */}
        <Card className="relative overflow-hidden bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm group hover:border-indigo-500/20 transition-all duration-300 shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <IconUsers size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Partners</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Active content creators</CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <IconUsers className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold tracking-tight text-zinc-100 font-mono">
              {totalAffiliates}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/5 px-1.5 py-0.5 rounded border border-emerald-400/10">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                {activeAffiliates} Active
              </span>
              {inactiveAffiliates > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-850 px-1.5 py-0.5 rounded border border-zinc-800">
                  <span className="h-1 w-1 rounded-full bg-zinc-400" />
                  {inactiveAffiliates} Disabled
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Referrals */}
        <Card className="relative overflow-hidden bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm group hover:border-indigo-500/20 transition-all duration-300 shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <IconShare size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Referrals</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Signups via partner links</CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <IconShare className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold tracking-tight text-zinc-100 font-mono">
              {totalReferrals}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-400/5 px-1.5 py-0.5 rounded border border-indigo-500/10">
                <IconTrendingUp className="w-3 h-3" />
                {totalConversions} Converted Paid
              </span>
              {totalReferrals > 0 && (
                <span className="text-[10px] text-zinc-500">
                  {((totalConversions / totalReferrals) * 100).toFixed(0)}% Conversion Rate
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Commission Rates */}
        <Card className="relative overflow-hidden bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm group hover:border-indigo-500/20 transition-all duration-300 shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-500 pointer-events-none group-hover:scale-110 transition-transform duration-300">
            <IconPercentage size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-6 pt-6">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Commission Rates</CardTitle>
              <CardDescription className="text-xs text-zinc-500">System-wide revenue share avg</CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <IconPercentage className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold tracking-tight text-zinc-100 font-mono">
              {averageCommissionRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">
                <IconAward className="w-3 h-3" />
                Standard commission tier
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table list */}
      <div className="bg-zinc-950/20 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
          <div>
            <h2 className="font-semibold text-zinc-200">All Registered Affiliates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">List of verified content creators promoting Vidzara.</p>
          </div>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-850 border border-zinc-800 px-2 py-1 rounded">
            {affiliates.length} {affiliates.length === 1 ? "partner" : "partners"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/40 border-b border-zinc-800">
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead className="text-zinc-400 font-medium py-3.5 pl-6">User Partner</TableHead>
                <TableHead className="text-zinc-400 font-medium py-3.5">Referral Code</TableHead>
                <TableHead className="text-zinc-400 font-medium py-3.5">Commission Rate</TableHead>
                <TableHead className="text-zinc-400 font-medium py-3.5">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium py-3.5">Referral Count</TableHead>
                <TableHead className="text-zinc-400 font-medium py-3.5">Joined Partner Program</TableHead>
                <TableHead className="text-zinc-400 font-medium py-3.5 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => {
                const converted = affiliate.referrals.filter(
                  (r) => r.status === "CREDITED" || r.status === "PAID"
                ).length;
                
                const userInitials = affiliate.user.name
                  ? affiliate.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "AP";

                return (
                  <TableRow
                    key={affiliate.id}
                    className="hover:bg-zinc-900/30 border-zinc-800/60 transition-colors duration-150"
                  >
                    {/* User profile column */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-zinc-800 shadow-sm ring-1 ring-zinc-800/30">
                          {affiliate.user.image && (
                            <AvatarImage src={affiliate.user.image} alt={affiliate.user.name} />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 font-semibold text-xs">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-200 text-sm tracking-tight">
                            {affiliate.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{affiliate.user.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Referral Code column */}
                    <TableCell className="py-4">
                      <CopyCodeBadge code={affiliate.referralCode} />
                    </TableCell>

                    {/* Commission Rate column */}
                    <TableCell className="py-4">
                      <span className="inline-flex items-center font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 shadow-sm">
                        {(Number(affiliate.commissionRate) * 100).toFixed(0)}% Rate
                      </span>
                    </TableCell>

                    {/* Status column */}
                    <TableCell className="py-4">
                      {affiliate.enabled ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-semibold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active Partner
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 hover:bg-zinc-500/20 font-semibold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                          Disabled
                        </Badge>
                      )}
                    </TableCell>

                    {/* Referral Count column */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-100 font-mono text-sm">
                            {affiliate.referrals.length}
                          </span>
                          <span className="text-xs text-muted-foreground">total referrals</span>
                        </div>
                        {converted > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10 w-fit font-mono">
                            {converted} paid conversions
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Joined Date column */}
                    <TableCell className="py-4">
                      <div className="flex flex-col text-xs gap-0.5">
                        <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                          <IconCalendar className="w-3.5 h-3.5 text-zinc-500" />
                          {new Date(affiliate.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-muted-foreground pl-5">Joined Partner Program</span>
                      </div>
                    </TableCell>

                    {/* Actions column */}
                    <TableCell className="py-4 text-right pr-6">
                      <AffiliateActions affiliateId={affiliate.id} isEnabled={affiliate.enabled} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {affiliates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-medium text-zinc-400">No affiliate partners found.</p>
                      <p className="text-xs text-zinc-500">
                        When creators register or are assigned a referral code, they will appear here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
