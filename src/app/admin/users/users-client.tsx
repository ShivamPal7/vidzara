"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconUsers,
  IconCrown,
  IconBolt,
  IconChartBar,
  IconSearch,
  IconDots,
  IconTrash,
  IconCopy,
  IconInfoCircle,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconCalendar,
  IconCoin,
  IconMapPin,
  IconBrandYoutube,
  IconTag,
  IconMail,
  IconId,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteUser } from "@/actions/admin/users";

interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  avatar: string | null;
  niche: string | null;
  youtubeChannelId: string | null;
  onboardingComplete: boolean;
  country: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface Subscription {
  id: string;
  userId: string;
  plan: "FREE" | "LIMITED_PRO" | "UNLIMITED_PRO";
  billingCycle: "MONTHLY" | "YEARLY";
  status: "ACTIVE" | "CANCELED" | "EXPIRED" | "TRIALING" | "PAST_DUE";
  gateway: "STRIPE" | "RAZORPAY" | null;
  gatewaySubscriptionId: string | null;
  trialEndsAt: Date | string | null;
  currentPeriodEnd: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  credits: number;
  subscription: Subscription | null;
  userProfile: UserProfile | null;
}

interface UsersManagementClientProps {
  users: User[];
}

const GRADIENTS = [
  "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white",
  "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white",
  "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 text-white",
  "bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 text-white",
  "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white",
  "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white",
];

function getAvatarGradient(name?: string) {
  if (!name) return GRADIENTS[0];
  const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return GRADIENTS[charCodeSum % GRADIENTS.length];
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UsersManagementClient({ users }: UsersManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("joined_desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  // Delete handler
  const handleDeleteUser = () => {
    if (!userToDelete) return;
    startTransition(async () => {
      try {
        const res = await deleteUser(userToDelete.id);
        if (res.success) {
          toast.success(`Successfully deleted user ${userToDelete.name}`);
          setUserToDelete(null);
          router.refresh();
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete user");
      }
    });
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalUsers = users.length;
    
    const activePremiumCreators = users.filter((u) => {
      if (!u.subscription) return false;
      return (
        u.subscription.plan !== "FREE" &&
        (u.subscription.status === "ACTIVE" || u.subscription.status === "TRIALING")
      );
    }).length;

    const totalCredits = users.reduce((sum, u) => sum + (u.credits || 0), 0);
    const avgCredits = totalUsers > 0 ? Math.round(totalCredits / totalUsers) : 0;
    
    const premiumAdoptionRate =
      totalUsers > 0 ? ((activePremiumCreators / totalUsers) * 100).toFixed(1) : "0.0";

    return {
      totalUsers,
      activePremiumCreators,
      avgCredits,
      premiumAdoptionRate,
      totalCredits,
    };
  }, [users]);

  // Filter & Sort Logic
  const filteredSortedUsers = useMemo(() => {
    let result = [...users];

    // Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    // Plan Filter
    if (planFilter !== "ALL") {
      result = result.filter((u) => {
        const plan = u.subscription?.plan || "FREE";
        return plan === planFilter;
      });
    }

    // Status Filter
    if (statusFilter !== "ALL") {
      result = result.filter((u) => {
        const status = u.subscription?.status || "INACTIVE";
        if (statusFilter === "ACTIVE_OR_TRIAL") {
          return status === "ACTIVE" || status === "TRIALING";
        }
        return status === statusFilter;
      });
    }

    // Sort Logic
    result.sort((a, b) => {
      switch (sortBy) {
        case "joined_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "joined_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "credits_desc":
          return b.credits - a.credits;
        case "credits_asc":
          return a.credits - b.credits;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [users, search, planFilter, statusFilter, sortBy]);

  // Pagination Logic
  const totalItems = filteredSortedUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  
  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, planFilter, statusFilter, sortBy, pageSize]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSortedUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredSortedUsers, currentPage, pageSize]);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Premium Visual Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/40 px-6 py-8 md:px-8 md:py-10 backdrop-blur-xl">
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              User Management
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-zinc-100 to-indigo-300 bg-clip-text text-transparent mt-2">
              Platform Creators
            </h1>
            <p className="text-zinc-400 max-w-xl text-sm md:text-base">
              Monitor customer accounts, inspect credit allocations, view YouTube profile connections, and oversee subscriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/30 backdrop-blur-xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:translate-y-[-2px] group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/15 transition-all duration-300" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Registered Users</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300">
              <IconUsers className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <div className="text-4xl font-extrabold tracking-tight text-zinc-100 bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Registered creator profiles
            </p>
          </div>
        </div>

        {/* Active Pro Creators */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/30 backdrop-blur-xl p-6 transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] hover:translate-y-[-2px] group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/15 transition-all duration-300" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Active Creators</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300">
              <IconCrown className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <div className="text-4xl font-extrabold tracking-tight text-zinc-100 bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text">
              {stats.activePremiumCreators.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Active Pro subscriptions
            </p>
          </div>
        </div>

        {/* Avg Credits */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/30 backdrop-blur-xl p-6 transition-all duration-300 hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.05)] hover:translate-y-[-2px] group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-500/5 blur-2xl group-hover:bg-teal-500/15 transition-all duration-300" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Average Credits</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300">
              <IconBolt className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <div className="text-4xl font-extrabold tracking-tight text-zinc-100 bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text">
              {stats.avgCredits.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
              Total in circulation: {stats.totalCredits.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Premium Adoption Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/30 backdrop-blur-xl p-6 transition-all duration-300 hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.05)] hover:translate-y-[-2px] group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl group-hover:bg-rose-500/15 transition-all duration-300" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Pro Adoption</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300">
              <IconChartBar className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <div className="text-4xl font-extrabold tracking-tight text-zinc-100 bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text">
              {stats.premiumAdoptionRate}%
            </div>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400" />
              SaaS conversion metrics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-zinc-950/20 backdrop-blur-xl border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl">
        {/* Controls / Filter Header */}
        <div className="p-6 border-b border-zinc-800/60 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-zinc-950/40">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/10 text-sm rounded-xl transition-all duration-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Plan */}
            <div className="space-y-1">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="h-10 w-[160px] bg-zinc-950/50 border-zinc-800 text-xs rounded-xl focus:ring-indigo-500/10">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                  <SelectItem value="ALL">All Plans</SelectItem>
                  <SelectItem value="UNLIMITED_PRO">Unlimited Pro</SelectItem>
                  <SelectItem value="LIMITED_PRO">Limited Pro</SelectItem>
                  <SelectItem value="FREE">Free Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Subscription Status */}
            <div className="space-y-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-[170px] bg-zinc-950/50 border-zinc-800 text-xs rounded-xl focus:ring-indigo-500/10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE_OR_TRIAL">Active or Trialing</SelectItem>
                  <SelectItem value="ACTIVE">Active Only</SelectItem>
                  <SelectItem value="TRIALING">Trialing Only</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="PAST_DUE">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sorting Option */}
            <div className="space-y-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 w-[180px] bg-zinc-950/50 border-zinc-800 text-xs rounded-xl focus:ring-indigo-500/10">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                  <SelectItem value="joined_desc">Joined (Newest)</SelectItem>
                  <SelectItem value="joined_asc">Joined (Oldest)</SelectItem>
                  <SelectItem value="credits_desc">Credits (High-Low)</SelectItem>
                  <SelectItem value="credits_asc">Credits (Low-High)</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/50 border-b border-zinc-800/80">
              <TableRow className="hover:bg-transparent border-zinc-800/60">
                <TableHead className="w-[300px] text-zinc-400 font-bold py-4 pl-6 text-[10px] uppercase tracking-widest">Creator</TableHead>
                <TableHead className="text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest">Email</TableHead>
                <TableHead className="text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest">Credits</TableHead>
                <TableHead className="text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest">Plan</TableHead>
                <TableHead className="text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest">Joined Date</TableHead>
                <TableHead className="w-[80px] text-zinc-400 font-bold py-4 pr-6 text-right text-[10px] uppercase tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const initials = getInitials(user.name);
                  const gradient = getAvatarGradient(user.name);
                  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });

                  const plan = user.subscription?.plan || "FREE";
                  const status = user.subscription?.status;

                  return (
                    <TableRow
                      key={user.id}
                      className="border-zinc-850 hover:bg-zinc-900/20 dark:hover:bg-zinc-900/30 transition-all duration-300"
                    >
                      <TableCell className="py-4.5 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-zinc-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-105">
                            {user.image ? (
                              <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className={`text-xs font-bold tracking-wider ${gradient} shadow-inner`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span 
                              className="font-bold text-zinc-100 text-sm truncate max-w-[200px] hover:text-indigo-400 transition-colors duration-150 cursor-pointer" 
                              onClick={() => setSelectedUser(user)}
                            >
                              {user.name}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                              ID: {user.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4.5 text-zinc-300 text-sm max-w-[180px] truncate">
                        {user.email}
                      </TableCell>
                      <TableCell className="py-4.5">
                        <div className="flex items-center gap-1.5">
                          <IconBolt className="h-4 w-4 text-teal-400" />
                          <span className="font-extrabold text-zinc-100 text-sm">
                            {user.credits.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4.5">
                        {plan === "UNLIMITED_PRO" ? (
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.08)] transition-all duration-200">
                            UNLIMITED PRO
                          </Badge>
                        ) : plan === "LIMITED_PRO" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.08)] transition-all duration-200">
                            LIMITED PRO
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-800/40 text-zinc-400 border border-zinc-700/30 hover:bg-zinc-800/60 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200">
                            FREE
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4.5">
                        {status ? (
                          status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          ) : status === "TRIALING" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                              Trialing
                            </span>
                          ) : status === "PAST_DUE" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                              Past Due
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                              {status.toLowerCase()}
                            </span>
                          )
                        ) : (
                          <span className="text-zinc-500 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4.5 text-zinc-300 text-sm">
                        <div className="flex items-center gap-1.5">
                          <IconCalendar className="h-4 w-4 text-zinc-500" />
                          <span>{joinedDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4.5 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors"
                            >
                              <IconDots className="h-4.5 w-4.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl shadow-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => setSelectedUser(user)}
                              className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer flex items-center gap-2 py-2"
                            >
                              <IconInfoCircle className="h-4 w-4 text-zinc-400" />
                              View Profile Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopy(user.id, "User ID")}
                              className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer flex items-center gap-2 py-2"
                            >
                              <IconId className="h-4 w-4 text-zinc-400" />
                              Copy User ID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopy(user.email, "Email")}
                              className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer flex items-center gap-2 py-2"
                            >
                              <IconMail className="h-4 w-4 text-zinc-400" />
                              Copy Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                              onClick={() => setUserToDelete(user)}
                              className="focus:bg-red-950 focus:text-red-300 text-red-400 cursor-pointer flex items-center gap-2 py-2"
                            >
                              <IconTrash className="h-4 w-4" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-40 text-center text-zinc-500 py-12"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconUsers className="h-10 w-10 text-zinc-700 animate-pulse" />
                      <p className="font-semibold text-sm">No creators found</p>
                      <p className="text-xs text-zinc-600">Try adjusting your filters or search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>
                Showing <strong className="text-zinc-200">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</strong> to{" "}
                <strong className="text-zinc-200">{Math.min(totalItems, currentPage * pageSize)}</strong> of{" "}
                <strong className="text-zinc-200">{totalItems}</strong> creators
              </span>
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(val) => setPageSize(Number(val))}
                >
                  <SelectTrigger className="h-8 w-[70px] bg-zinc-950/50 border-zinc-800 text-xs rounded-xl focus:ring-indigo-500/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0 bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl"
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium text-zinc-400 px-2">
                Page <strong className="text-zinc-200">{currentPage}</strong> of{" "}
                <strong className="text-zinc-200">{totalPages}</strong>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0 bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl"
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-200 max-w-lg p-6 rounded-2xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-zinc-100 to-indigo-300 bg-clip-text text-transparent">
              Creator Profile Details
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Full overview of registered information, stats, and active subscription configurations.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mt-4 space-y-6">
              {/* Header profile info */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                <Avatar className="h-14 w-14 border border-zinc-800 shadow-md">
                  {selectedUser.image ? (
                    <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                  ) : null}
                  <AvatarFallback className={`text-base font-extrabold tracking-wider ${getAvatarGradient(selectedUser.name)}`}>
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-bold text-zinc-100 text-lg leading-tight truncate">
                    {selectedUser.name}
                  </h4>
                  <span className="text-xs text-zinc-400 truncate">{selectedUser.email}</span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700/50">
                      ID: {selectedUser.id}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedUser.id, "ID")}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded hover:bg-zinc-800"
                    >
                      <IconCopy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 p-3 rounded-xl border border-zinc-800/40 bg-zinc-950/20">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <IconCalendar className="h-3.5 w-3.5 text-indigo-400" />
                    Member Since
                  </span>
                  <p className="text-sm font-semibold text-zinc-200">
                    {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl border border-zinc-800/40 bg-zinc-950/20">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <IconBolt className="h-3.5 w-3.5 text-teal-400" />
                    Credit Allowance
                  </span>
                  <p className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="text-teal-400 font-extrabold">{selectedUser.credits}</span> credits
                  </p>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl border border-zinc-800/40 bg-zinc-950/20">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <IconTag className="h-3.5 w-3.5 text-amber-400" />
                    Creator Niche
                  </span>
                  <p className="text-sm font-semibold text-zinc-200 truncate">
                    {selectedUser.userProfile?.niche || "Not specified"}
                  </p>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl border border-zinc-800/40 bg-zinc-950/20">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <IconMapPin className="h-3.5 w-3.5 text-pink-400" />
                    Country / Locale
                  </span>
                  <p className="text-sm font-semibold text-zinc-200">
                    {selectedUser.userProfile?.country || "Not set / Global"}
                  </p>
                </div>
              </div>

              {/* YouTube Channel connection */}
              <div className="p-4 rounded-xl border border-zinc-800/40 bg-zinc-950/20 space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <IconBrandYoutube className="h-4 w-4 text-red-500" />
                  YouTube Channel Connection
                </span>
                {selectedUser.userProfile?.youtubeChannelId ? (
                  <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-zinc-300 truncate">
                        ID: {selectedUser.userProfile.youtubeChannelId}
                      </span>
                    </div>
                    <a
                      href={`https://youtube.com/channel/${selectedUser.userProfile.youtubeChannelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      Visit Channel
                      <IconChevronRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No YouTube channel linked yet.</p>
                )}
              </div>

              {/* Subscription details */}
              <div className="p-4 rounded-xl border border-zinc-800/40 bg-zinc-950/20 space-y-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <IconCoin className="h-4 w-4 text-indigo-400" />
                  Subscription Contract
                </span>

                {selectedUser.subscription ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Plan Tier:</span>
                      <strong className="text-zinc-200">
                        {selectedUser.subscription.plan.replace("_", " ")}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Billing Cycle:</span>
                      <strong className="text-zinc-200">
                        {selectedUser.subscription.billingCycle}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Status:</span>
                      <span className="font-semibold text-emerald-400">
                        {selectedUser.subscription.status}
                      </span>
                    </div>
                    {selectedUser.subscription.currentPeriodEnd && (
                      <div className="flex items-center justify-between text-xs border-t border-zinc-800/50 pt-2 mt-2">
                        <span className="text-zinc-500">Renewal Date:</span>
                        <span className="text-zinc-300">
                          {new Date(selectedUser.subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Active Tier:</span>
                    <strong className="text-zinc-400">FREE PLAN (Trial / Regular)</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setSelectedUser(null)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 text-xs font-semibold"
            >
              Close Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-200 max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
              <IconTrash className="h-5.5 w-5.5" />
              Destructive Action
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Are you absolutely sure you want to delete this user? This will instantly remove their account, active subscriptions, usage statistics, generated history, and linked social media accounts. This action is irreversible.
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="mt-4 p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-xs space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-red-500/20">
                  <AvatarFallback className="text-[10px] font-bold bg-red-950 text-red-300">
                    {getInitials(userToDelete.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-zinc-100">{userToDelete.name}</h4>
                  <p className="text-zinc-400">{userToDelete.email}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 gap-3">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setUserToDelete(null)}
              className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5"
            >
              {isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
