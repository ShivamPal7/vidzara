"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IconHelpCircle, IconDotsVertical, IconBrandYoutube, IconTrash, IconUsers, IconPlus } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getChannelStats } from "@/actions/competitors";
import { motion, AnimatePresence } from "framer-motion";
import { CompetitorManagerModal } from "./competitor-manager-modal";
import { Competitor } from "@/components/dashboard/topic-generator/types";

interface ChannelStatsTableProps {
  selectedIds: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRemoveCompetitor?: (id: string) => void;
  isInitialLoading?: boolean;
  competitors?: Competitor[];
  setCompetitors?: React.Dispatch<React.SetStateAction<Competitor[]>>;
}

export function ChannelStatsTable({ 
  selectedIds, 
  onSelectionChange, 
  onRemoveCompetitor, 
  isInitialLoading = false,
  competitors = [],
  setCompetitors = () => {}
}: ChannelStatsTableProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d">("30d");

  // Synchronous loading flag to prevent flash on 1st frame
  const [prevIdsStr, setPrevIdsStr] = useState(selectedIds.join(","));
  const currentIdsStr = selectedIds.join(",");
  if (currentIdsStr !== prevIdsStr) {
    setPrevIdsStr(currentIdsStr);
    setLoading(true);
  }

  useEffect(() => {
    let ignore = false;
    
    if (selectedIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      const res = await getChannelStats(selectedIds);
      if (ignore) return;
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => { fetchStats(); }, 500);
    return () => { ignore = true; clearTimeout(timer); };
  }, [selectedIds]);

  const periodLabel = period === "7d" ? "Last 7 Days" : "Last 30 Days";

  const getYouTubeUrl = (stat: any) =>
    stat.handle
      ? `https://youtube.com/${stat.handle}`
      : `https://youtube.com/channel/${stat.youtubeChannelId}`;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Channel Stats</CardTitle>
          <IconHelpCircle className="w-4 h-4 text-muted-foreground" />
        </div>
        {selectedIds.length > 0 && (
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-[120px] md:w-[140px] h-8 bg-muted/30 border-border/50 text-xs">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isInitialLoading || (loading && stats.length === 0) ? (
          <div className="p-4 md:p-6 space-y-4">
             {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[1,2,3,4].map(j => <Skeleton key={j} className="h-10 w-full rounded-lg" />)}
                  </div>
                </div>
              ))}
          </div>
        ) : selectedIds.length > 0 ? (
          <>
            {/* ── Mobile Cards ── */}
            <div className="md:hidden px-4 pb-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-2.5 w-20" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="rounded-lg bg-muted/20 p-2.5 space-y-1">
                            <Skeleton className="h-2 w-14" />
                            <Skeleton className="h-3.5 w-10" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : stats.length > 0 ? (
                  stats.map((stat) => (
                    <motion.div
                      key={stat.channelId}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-3"
                    >
                      {/* Channel header row */}
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarImage src={stat.avatar} />
                          <AvatarFallback className="text-sm">{stat.channel.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{stat.channel}</p>
                          {stat.handle && (
                            <p className="text-[11px] text-muted-foreground truncate">{stat.handle}</p>
                          )}
                        </div>
                        {/* 3-dot menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground">
                              <IconDotsVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => window.open(getYouTubeUrl(stat), "_blank")}
                            >
                              <IconBrandYoutube className="w-4 h-4" />
                              View channel on YouTube
                            </DropdownMenuItem>
                            {onRemoveCompetitor && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => onRemoveCompetitor(stat.channelId)}
                                >
                                  <IconTrash className="w-4 h-4" />
                                  Remove competitor
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Stats 2×2 grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-muted/20 px-3 py-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Subscribers</p>
                          <p className="text-sm font-bold tabular-nums">{stat.subscriberCount}</p>
                        </div>
                        <div className="rounded-lg bg-muted/20 px-3 py-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Total Views</p>
                          <p className="text-sm font-bold tabular-nums">{stat.totalViews}</p>
                        </div>
                        <div className="rounded-lg bg-muted/30 border border-border/30 px-3 py-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Views ({periodLabel})</p>
                          <p className="text-sm font-bold tabular-nums">
                            {period === "7d" ? stat.views7d : stat.views30d}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/30 border border-border/30 px-3 py-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Videos ({periodLabel})</p>
                          <p className="text-sm font-bold tabular-nums">
                            {period === "7d" ? stat.videos7d : stat.videos30d}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-24 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl">
                    Select a competitor to view their stats
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto w-full">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-muted/10">
                  <TableRow className="border-border/50">
                    <TableHead className="pl-6 w-[220px]">Channel</TableHead>
                    <TableHead className="text-right">Total Subs</TableHead>
                    <TableHead className="text-right">Total Views</TableHead>
                    <TableHead className="text-right font-semibold">
                      Views ({periodLabel})
                    </TableHead>
                    <TableHead className="text-right pr-6">
                      Videos ({periodLabel})
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i} className="border-border/30">
                          <TableCell className="pl-6 py-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                              <Skeleton className="h-3 w-28" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right"><Skeleton className="h-3 w-12 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-3 w-16 ml-auto" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-3 w-12 ml-auto" /></TableCell>
                          <TableCell className="text-right pr-6"><Skeleton className="h-3 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : stats.length > 0 ? (
                      stats.map((stat) => (
                        <motion.tr
                          key={stat.channelId}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="border-border/30 hover:bg-muted/20 border-b transition-colors"
                        >
                          <TableCell className="pl-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-6 h-6 shrink-0">
                                <AvatarImage src={stat.avatar} />
                                <AvatarFallback className="text-[10px]">{stat.channel.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{stat.channel}</p>
                                {stat.handle && (
                                  <p className="text-[11px] text-muted-foreground truncate">{stat.handle}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm tabular-nums text-muted-foreground">
                            {stat.subscriberCount}
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm tabular-nums text-muted-foreground">
                            {stat.totalViews}
                          </TableCell>
                          <TableCell className="text-right font-bold text-sm tabular-nums">
                            {period === "7d" ? stat.views7d : stat.views30d}
                          </TableCell>
                          <TableCell className="text-right pr-6 text-sm tabular-nums font-semibold">
                            {period === "7d" ? stat.videos7d : stat.videos30d}
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                          Select a competitor to view their stats
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <IconUsers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No competitors selected</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Track your competitors' subscriber growth, total views, and recent upload frequency.
            </p>
            {onSelectionChange && (
              <CompetitorManagerModal 
                selectedIds={selectedIds} 
                onChange={onSelectionChange}
                competitors={competitors}
                setCompetitors={setCompetitors}
              >
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <IconPlus className="w-4 h-4" />
                  Add Competitors
                </Button>
              </CompetitorManagerModal>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
