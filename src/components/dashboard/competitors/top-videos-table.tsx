"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconDots, IconBrandYoutube, IconArrowUpRight, IconUser, IconPlus, IconUsers } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTopCompetitorVideos, deleteCompetitor } from "@/actions/competitors";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitorManagerModal } from "./competitor-manager-modal";

import { Competitor } from "@/components/dashboard/topic-generator/types";

export function TopVideosTable({ 
  selectedIds, 
  onSelectionChange,
  onRemoveCompetitor,
  isInitialLoading = false,
  competitors = [],
  setCompetitors = () => {}
}: { 
  selectedIds: string[], 
  onSelectionChange?: (ids: string[]) => void,
  onRemoveCompetitor?: (id: string) => void,
  isInitialLoading?: boolean,
  competitors?: Competitor[],
  setCompetitors?: React.Dispatch<React.SetStateAction<Competitor[]>>
}) {
  const [includeMyChannel, setIncludeMyChannel] = useState(true);
  const [sortBy, setSortBy] = useState("views");
  const [timeFilter, setTimeFilter] = useState("all_time");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageTokens, setNextPageTokens] = useState<Record<string, string>>({})
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Synchronous state update to prevent "No videos found" flash on 1st frame
  const [prevIdsStr, setPrevIdsStr] = useState(selectedIds.join(","));
  const currentIdsStr = selectedIds.join(",");
  if (currentIdsStr !== prevIdsStr) {
    setPrevIdsStr(currentIdsStr);
    setLoading(true);
  }

  useEffect(() => {
    let ignore = false;
    setVideos([]);
    setNextPageTokens({});
    setVisibleCount(10); // reset visible count on competitor change
    
    if (selectedIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      const res = await getTopCompetitorVideos(selectedIds);
      if (ignore) return;
      
      if (res.success && res.data) {
        setVideos(res.data);
        setNextPageTokens(res.nextPageTokens ?? {});
      } else {
        console.error("Failed to fetch:", res.error);
      }
      setLoading(false);
    };
    
    const timer = setTimeout(() => { fetchVideos(); }, 500);
    return () => { ignore = true; clearTimeout(timer); };
  }, [selectedIds]);

  const loadMore = async () => {
    if (visibleCount < filteredAndSortedVideos.length) {
      setVisibleCount(prev => prev + 10);
      return;
    }
    const hasNextPage = Object.keys(nextPageTokens).length > 0;
    if (!hasNextPage) return;
    setLoadingMore(true);
    const res = await getTopCompetitorVideos(selectedIds, nextPageTokens);
    if (res.success && res.data) {
      setVideos(prev => [...prev, ...res.data]);
      setNextPageTokens(res.nextPageTokens ?? {});
      setVisibleCount(prev => prev + 10);
    }
    setLoadingMore(false);
  };

  const filteredAndSortedVideos = useMemo(() => {
    let result = videos.filter(v => {
      if (v.channelId === "my_channel") {
        return includeMyChannel;
      }
      return selectedIds.includes(v.channelId);
    });

    const now = new Date();
    if (timeFilter === "7_days") {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(v => new Date(v.publishedAt) >= cutoff);
    } else if (timeFilter === "30_days") {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(v => new Date(v.publishedAt) >= cutoff);
    } else if (timeFilter === "90_days") {
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      result = result.filter(v => new Date(v.publishedAt) >= cutoff);
    }

    if (sortBy === "outlier") {
      result = result.filter(v => v.outlierScore && v.outlierScore > 1.5);
    }

    result.sort((a, b) => {
      if (sortBy === "views") return b.views - a.views;
      if (sortBy === "outlier") return (b.outlierScore || 0) - (a.outlierScore || 0);
      if (sortBy === "vph") return b.viewsPerHour - a.viewsPerHour;
      return 0;
    });

    return result;
  }, [videos, selectedIds, includeMyChannel, sortBy, timeFilter]);

  const visibleVideos = filteredAndSortedVideos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedVideos.length || Object.keys(nextPageTokens).length > 0;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 md:px-6">
        <CardTitle className="text-lg">Top Videos From Your Competitors</CardTitle>
      </CardHeader>
      
      {selectedIds.length > 0 && (
        <div className="px-4 md:px-6 flex flex-wrap gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px] h-8 bg-muted/30 border-border/50 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="outlier">Outlier Score</SelectItem>
              <SelectItem value="vph">Views / Hour</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[120px] h-8 bg-muted/30 border-border/50 text-xs">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All time</SelectItem>
              <SelectItem value="7_days">Last 7 Days</SelectItem>
              <SelectItem value="30_days">Last 30 Days</SelectItem>
              <SelectItem value="90_days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <CardContent className="p-0">
        {isInitialLoading || (loading && videos.length === 0) ? (
          <div className="space-y-4 p-4 md:p-6">
            <div className="hidden md:block">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center mb-6 last:mb-0">
                  <Skeleton className="w-28 h-16 rounded-md shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-3 w-[40%]" />
                  </div>
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-5 w-12 mx-auto" />
                </div>
              ))}
            </div>
            <div className="md:hidden space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-muted/10 border border-border/50 rounded-lg overflow-hidden flex flex-col p-3 space-y-3">
                  <div className="flex gap-3 border-b border-border/50 pb-3">
                    <Skeleton className="w-24 h-16 rounded-md shrink-0" />
                    <div className="space-y-2 flex-1 pt-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-border/50 pt-1">
                    <div className="flex flex-col items-center space-y-1.5"><Skeleton className="h-2 w-8" /><Skeleton className="h-3 w-10" /></div>
                    <div className="flex flex-col items-center space-y-1.5"><Skeleton className="h-2 w-10" /><Skeleton className="h-4 w-12" /></div>
                    <div className="flex flex-col items-center space-y-1.5"><Skeleton className="h-2 w-8" /><Skeleton className="h-3 w-6" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedIds.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="border-border/50">
                    <TableHead className="w-[50%] pl-6">Videos</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-center">Outlier Score</TableHead>
                    <TableHead className="text-center">Views Per Hour</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {loading && visibleVideos.length === 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="pl-6 py-4 max-w-[200px] lg:max-w-[300px]">
                            <div className="flex gap-4 items-center">
                              <Skeleton className="w-28 h-16 rounded-md shrink-0" />
                              <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : visibleVideos.length > 0 ? (
                      visibleVideos.map((video) => (
                        <motion.tr 
                          key={video.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="border-border/30 hover:bg-muted/20 border-b transition-colors"
                        >
                          <TableCell className="pl-6 py-4 max-w-[300px] lg:max-w-[450px]">
                            <div className="flex gap-4 items-center">
                              <div className="relative w-28 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="space-y-1 overflow-hidden pr-4">
                                <p className="text-sm font-semibold truncate">
                                  {video.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground flex gap-1 items-center">
                                  {video.channel} • {video.subs} subs
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {video.timeAgo}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {video.views.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            {video.outlierScore ? (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 text-xs font-bold font-mono">
                                {video.outlierScore}x
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {video.viewsPerHour}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <IconDots className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[250px]">
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer"
                                  onClick={() => {
                                    const url = video.channelHandle
                                      ? `https://youtube.com/${video.channelHandle}`
                                      : `https://youtube.com/channel/${video.youtubeChannelId}`;
                                    window.open(url, '_blank');
                                  }}
                                >
                                  <IconBrandYoutube className="w-4 h-4" />
                                  View channel on YouTube
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer"
                                  onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                                >
                                  <IconArrowUpRight className="w-4 h-4" />
                                  View video on YouTube
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                  onClick={async () => {
                                    const result = await deleteCompetitor(video.channelId);
                                    if (result.success) {
                                      toast.success("Competitor removed");
                                      if (onRemoveCompetitor) onRemoveCompetitor(video.channelId);
                                    } else {
                                      toast.error(result.error || "Failed to remove competitor");
                                    }
                                  }}
                                >
                                  <IconUser className="w-4 h-4" />
                                  Remove competitor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No videos found for the selected filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden p-4 pt-0 space-y-4">
              <AnimatePresence mode="popLayout">
                {loading && visibleVideos.length === 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-muted/10 border border-border/50 rounded-lg overflow-hidden flex flex-col p-3 space-y-3">
                      <div className="flex gap-3 border-b border-border/50 pb-3">
                        <Skeleton className="w-24 h-16 rounded-md shrink-0" />
                        <div className="space-y-2 flex-1 pt-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-border/50 pt-1">
                        <div className="flex flex-col items-center space-y-1.5"><Skeleton className="h-2 w-8" /><Skeleton className="h-3 w-10" /></div>
                        <div className="flex flex-col items-center space-y-1.5"><Skeleton className="h-2 w-10" /><Skeleton className="h-4 w-12" /></div>
                        <div className="flex flex-col items-center space-y-1.5"><Skeleton className="h-2 w-8" /><Skeleton className="h-3 w-6" /></div>
                      </div>
                    </div>
                  ))
                ) : visibleVideos.length > 0 ? (
                  visibleVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-muted/10 border border-border/50 rounded-lg overflow-hidden flex flex-col"
                    >
                      <div className="flex gap-3 p-3 border-b border-border/50 relative">
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/80 backdrop-blur-sm rounded-full">
                                <IconDots className="w-3 h-3 text-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => {
                                  const url = video.channelHandle
                                    ? `https://youtube.com/${video.channelHandle}`
                                    : `https://youtube.com/channel/${video.youtubeChannelId}`;
                                  window.open(url, '_blank');
                                }}
                              >
                                <IconBrandYoutube className="w-4 h-4" />
                                View channel on YouTube
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                              >
                                <IconArrowUpRight className="w-4 h-4" />
                                View video on YouTube
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={async () => {
                                  const result = await deleteCompetitor(video.channelId);
                                  if (result.success) {
                                    toast.success("Competitor removed");
                                    if (onRemoveCompetitor) onRemoveCompetitor(video.channelId);
                                  } else {
                                    toast.error(result.error || "Failed to remove competitor");
                                  }
                                }}
                              >
                                <IconUser className="w-4 h-4" />
                                Remove competitor
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="space-y-1 overflow-hidden pr-6">
                          <p className="text-sm font-semibold line-clamp-2 leading-tight">
                            {video.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex gap-1 items-center">
                            {video.channel} • {video.subs} subs
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {video.timeAgo}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 divide-x divide-border/50 p-3 bg-muted/5">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Views</span>
                          <span className="text-sm font-medium">{video.views >= 1000 ? (video.views / 1000).toFixed(1) + 'K' : video.views}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Outlier</span>
                          {video.outlierScore ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-1.5 py-0 text-[10px] font-bold font-mono">
                              {video.outlierScore}x
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Views/Hr</span>
                          <span className="text-sm font-medium">{video.viewsPerHour}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-32 flex items-center justify-center text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                    No videos found for the selected filters.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <IconUsers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No competitors selected</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Add or select competitors to start tracking their top performing videos and outliers.
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

      {/* Load More */}
      {hasMore && !loading && selectedIds.length > 0 && (
        <div className="px-4 md:px-6 pb-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full max-w-xs border-border/50 text-muted-foreground hover:text-foreground gap-2"
          >
            {loadingMore ? (
              <span className="animate-pulse">Loading more videos...</span>
            ) : (
              "Load More Videos"
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
