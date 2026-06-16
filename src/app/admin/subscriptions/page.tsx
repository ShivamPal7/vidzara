import { getSubscriptions } from "@/actions/admin/subscriptions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanPricingTab } from "@/components/admin/subscriptions/plan-pricing-tab";
import { CouponManagerTab } from "@/components/admin/subscriptions/coupon-manager-tab";
import { 
  IconCreditCard, 
  IconUsers, 
  IconCrown, 
  IconCalendar, 
  IconClock, 
  IconCircleCheck, 
  IconSparkles, 
  IconSearch,
  IconCircle,
  IconX,
  IconTrendingUp
} from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    plan?: string;
  }>;
}

export default async function AdminSubscriptionsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search?.toLowerCase() || "";
  const statusFilter = searchParams.status || "";
  const planFilter = searchParams.plan || "";

  const allSubscriptions = await getSubscriptions();

  // 1. Calculate general stats from all subscriptions (unfiltered)
  const totalSubs = allSubscriptions.length;
  const activeSubs = allSubscriptions.filter((s) => s.status === "ACTIVE");
  const totalActive = activeSubs.length;
  const totalTrialing = allSubscriptions.filter((s) => s.status === "TRIALING").length;
  
  const monthlyCount = allSubscriptions.filter((s) => s.billingCycle === "MONTHLY").length;
  const yearlyCount = allSubscriptions.filter((s) => s.billingCycle === "YEARLY").length;
  
  const unlimitedProCount = allSubscriptions.filter((s) => s.plan === "UNLIMITED_PRO" && s.status === "ACTIVE").length;
  const limitedProCount = allSubscriptions.filter((s) => s.plan === "LIMITED_PRO" && s.status === "ACTIVE").length;

  // 2. Filter subscriptions based on search query and active filters
  const filteredSubscriptions = allSubscriptions.filter((sub) => {
    // Search query matches name, email, or sub ID
    const matchesSearch = searchQuery
      ? sub.user.name?.toLowerCase().includes(searchQuery) ||
        sub.user.email?.toLowerCase().includes(searchQuery) ||
        sub.id.toLowerCase().includes(searchQuery)
      : true;

    // Status filter (group canceled and expired together for intuitive UX)
    const matchesStatus = statusFilter
      ? (statusFilter === "CANCELED" 
          ? (sub.status === "CANCELED" || sub.status === "EXPIRED") 
          : sub.status === statusFilter)
      : true;

    // Plan filter
    const matchesPlan = planFilter
      ? sub.plan === planFilter
      : true;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Initials generator helper
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // URL builder helper for stateful server-side filtering
  const buildUrl = (filters: { search?: string; status?: string; plan?: string }) => {
    const params = new URLSearchParams();
    
    if (filters.search !== undefined) {
      if (filters.search) params.set("search", filters.search);
    } else if (searchQuery) {
      params.set("search", searchQuery);
    }
    
    if (filters.status !== undefined) {
      if (filters.status) params.set("status", filters.status);
    } else if (statusFilter) {
      params.set("status", statusFilter);
    }
    
    if (filters.plan !== undefined) {
      if (filters.plan) params.set("plan", filters.plan);
    } else if (planFilter) {
      params.set("plan", planFilter);
    }
    
    const queryStr = params.toString();
    return `/admin/subscriptions${queryStr ? `?${queryStr}` : ""}`;
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <IconCreditCard className="h-8 w-8 text-indigo-400" />
            Subscription Finance
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            Monitor and manage active recurring plans, billing cycles, promotional coupon campaigns, and financial health.
          </p>
        </div>
      </div>

      <Tabs defaultValue="finance" className="space-y-6 w-full">
        <TabsList className="bg-zinc-950/40 border border-zinc-800 p-1 rounded-xl h-11 w-fit flex gap-1">
          <TabsTrigger value="finance" className="text-sm rounded-lg px-4 py-2 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 text-zinc-400 hover:text-zinc-200">
            Finance & Subscriptions
          </TabsTrigger>
          <TabsTrigger value="plans" className="text-sm rounded-lg px-4 py-2 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 text-zinc-400 hover:text-zinc-200">
            Plan Pricing & Credits
          </TabsTrigger>
          <TabsTrigger value="coupons" className="text-sm rounded-lg px-4 py-2 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 text-zinc-400 hover:text-zinc-200">
            Coupon Codes Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finance" className="space-y-8 outline-none mt-0 animate-in fade-in duration-200">
          {/* Stats Cards Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Active Customers */}
            <Card className="relative overflow-hidden bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Customers</CardTitle>
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                  <IconCircleCheck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-zinc-100 flex items-baseline gap-2">
                  {totalActive}
                  <span className="text-xs font-normal text-emerald-400 flex items-center gap-0.5">
                    <IconTrendingUp className="h-3 w-3" />
                    {totalSubs > 0 ? Math.round((totalActive / totalSubs) * 100) : 0}% rate
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Currently paying platform subscribers.
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Trialing */}
            <Card className="relative overflow-hidden bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Trials</CardTitle>
                <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                  <IconClock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-3xl font-bold text-zinc-100">{totalTrialing}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  Exploring pro tier capabilities.
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Premium Distribution */}
            <Card className="relative overflow-hidden bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tier Distribution</CardTitle>
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                  <IconCrown className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl font-bold text-zinc-100 flex items-baseline gap-1">
                  <span>{unlimitedProCount}</span>
                  <span className="text-xs text-zinc-400 font-normal">Unlimited</span>
                  <span className="text-zinc-600 text-xs px-1">/</span>
                  <span>{limitedProCount}</span>
                  <span className="text-xs text-zinc-400 font-normal">Limited</span>
                </div>
                {/* Simple visual bar */}
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-3 flex">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${(limitedProCount + unlimitedProCount) > 0 ? (unlimitedProCount / (limitedProCount + unlimitedProCount)) * 100 : 0}%` }} 
                  />
                  <div 
                    className="h-full bg-sky-500/80" 
                    style={{ width: `${(limitedProCount + unlimitedProCount) > 0 ? (limitedProCount / (limitedProCount + unlimitedProCount)) * 100 : 0}%` }} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Billing Cycles */}
            <Card className="relative overflow-hidden bg-zinc-950/50 border-zinc-800/80 backdrop-blur-sm shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Billing Terms</CardTitle>
                <div className="p-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                  <IconCalendar className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl font-bold text-zinc-100 flex items-baseline gap-1">
                  <span>{yearlyCount}</span>
                  <span className="text-xs text-zinc-400 font-normal">Yearly</span>
                  <span className="text-zinc-600 text-xs px-1">/</span>
                  <span>{monthlyCount}</span>
                  <span className="text-xs text-zinc-400 font-normal">Monthly</span>
                </div>
                {/* Simple billing distribution bar */}
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-3 flex">
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ width: `${totalSubs > 0 ? (yearlyCount / totalSubs) * 100 : 0}%` }} 
                  />
                  <div 
                    className="h-full bg-indigo-500/80" 
                    style={{ width: `${totalSubs > 0 ? (monthlyCount / totalSubs) * 100 : 0}%` }} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control and Filter Zone */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/30 p-4 border border-zinc-800/80 rounded-xl backdrop-blur-sm">
            {/* Search */}
            <form method="GET" action="/admin/subscriptions" className="relative flex-1 max-w-md w-full">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search username, email, or sub ID..."
                className="w-full pl-10 pr-10 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
              {searchQuery && (
                <a 
                  href={buildUrl({ search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <IconX className="h-4 w-4" />
                </a>
              )}
              {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
              {planFilter && <input type="hidden" name="plan" value={planFilter} />}
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center text-xs">
              {/* Status filters */}
              <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg shrink-0">
                <a
                  href={buildUrl({ status: "" })}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    !statusFilter
                      ? "bg-zinc-800 text-zinc-100 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All Statuses
                </a>
                <a
                  href={buildUrl({ status: "ACTIVE" })}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === "ACTIVE"
                      ? "bg-zinc-800 text-emerald-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Active
                </a>
                <a
                  href={buildUrl({ status: "TRIALING" })}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === "TRIALING"
                      ? "bg-zinc-800 text-amber-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Trialing
                </a>
                <a
                  href={buildUrl({ status: "CANCELED" })}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === "CANCELED"
                      ? "bg-zinc-800 text-rose-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Canceled
                </a>
              </div>

              {/* Plan filters */}
              <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg shrink-0">
                <a
                  href={buildUrl({ plan: "" })}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    !planFilter
                      ? "bg-zinc-800 text-zinc-100 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All Plans
                </a>
                <a
                  href={buildUrl({ plan: "LIMITED_PRO" })}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    planFilter === "LIMITED_PRO"
                      ? "bg-zinc-800 text-sky-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Limited Pro
                </a>
                <a
                  href={buildUrl({ plan: "UNLIMITED_PRO" })}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    planFilter === "UNLIMITED_PRO"
                      ? "bg-zinc-800 text-indigo-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Unlimited Pro
                </a>
              </div>

              {/* Reset Action */}
              {(statusFilter || planFilter || searchQuery) && (
                <a
                  href="/admin/subscriptions"
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1.5 transition-colors flex items-center gap-1"
                >
                  Clear filters
                </a>
              )}
            </div>
          </div>

          {/* Main Table Container */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-b border-zinc-800/80">
                <TableRow className="border-b border-zinc-800/80 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase py-4 pl-6">Subscriber</TableHead>
                  <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase py-4">Plan Type</TableHead>
                  <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase py-4">Status</TableHead>
                  <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase py-4">Billing / Gateway</TableHead>
                  <TableHead className="text-zinc-400 font-semibold tracking-wider text-xs uppercase py-4 pr-6">Renewal / End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => {
                  const initials = getInitials(sub.user.name);
                  
                  // End date calculations
                  const targetDate = sub.status === "TRIALING" ? sub.trialEndsAt : sub.currentPeriodEnd;
                  const formattedDate = targetDate ? new Date(targetDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  }) : null;
                  
                  let daysRemaining = null;
                  if (targetDate) {
                    const diffTime = new Date(targetDate).getTime() - Date.now();
                    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  }

                  return (
                    <TableRow key={sub.id} className="hover:bg-zinc-900/20 border-b border-zinc-800/50 transition-colors">
                      {/* Subscriber column */}
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-zinc-800/60 shadow-sm shrink-0">
                            {sub.user.image && (
                              <AvatarImage src={sub.user.image} alt={sub.user.name} />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-zinc-200 text-sm truncate max-w-[180px]">{sub.user.name || "Unknown User"}</span>
                            <span className="text-zinc-500 text-xs truncate max-w-[180px]">{sub.user.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Plan column */}
                      <TableCell className="py-3.5">
                        {sub.plan === "UNLIMITED_PRO" ? (
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold tracking-wide gap-1 rounded-full shadow-sm shadow-indigo-500/5">
                            <IconCrown className="h-3 w-3 shrink-0" />
                            Unlimited Pro
                          </Badge>
                        ) : sub.plan === "LIMITED_PRO" ? (
                          <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold tracking-wide gap-1 rounded-full">
                            <IconCircle className="h-2 w-2 shrink-0 fill-sky-400/20" />
                            Limited Pro
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-normal rounded-full">
                            Free tier
                          </Badge>
                        )}
                      </TableCell>

                      {/* Status column */}
                      <TableCell className="py-3.5">
                        {sub.status === "ACTIVE" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium rounded-full gap-1.5 py-0.5 shadow-sm shadow-emerald-500/5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </Badge>
                        ) : sub.status === "TRIALING" ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium rounded-full gap-1.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Trialing
                          </Badge>
                        ) : sub.status === "CANCELED" ? (
                          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium rounded-full gap-1.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            Canceled
                          </Badge>
                        ) : sub.status === "EXPIRED" ? (
                          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium rounded-full gap-1.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            Expired
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium rounded-full gap-1.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                            {sub.status.replace("_", " ")}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Billing cycle & gateway column */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col min-w-0">
                          <span className="text-zinc-200 text-sm font-medium">
                            {sub.billingCycle === "YEARLY" ? "Yearly" : "Monthly"}
                          </span>
                          {sub.gateway ? (
                            <span className="text-zinc-500 text-xs flex items-center gap-1 mt-0.5">
                              {sub.gateway === "STRIPE" ? (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                                  via Stripe
                                </>
                              ) : (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-sky-400" />
                                  via Razorpay
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-xs mt-0.5">-</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Renewal Date column */}
                      <TableCell className="py-3.5 pr-6">
                        <div className="flex flex-col">
                          {formattedDate ? (
                            <>
                              <span className="text-zinc-200 text-sm font-medium">{formattedDate}</span>
                              {daysRemaining !== null && (
                                daysRemaining > 0 ? (
                                  <span className="text-zinc-500 text-xs mt-0.5">
                                    {sub.status === "TRIALING" ? "Trial ends" : "Renews"} in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                                  </span>
                                ) : (
                                  <span className="text-rose-500/80 text-xs mt-0.5">Expired</span>
                                )
                              )}
                            </>
                          ) : (
                            <span className="text-zinc-500 text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredSubscriptions.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500 border-none">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <IconCreditCard className="h-8 w-8 text-zinc-700" />
                        <p className="text-sm">No subscriptions matched your query.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="outline-none mt-0 animate-in fade-in duration-200">
          <PlanPricingTab />
        </TabsContent>

        <TabsContent value="coupons" className="outline-none mt-0 animate-in fade-in duration-200">
          <CouponManagerTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
