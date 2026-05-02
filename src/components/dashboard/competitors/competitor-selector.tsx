"use client";

import { useState, useEffect } from "react";
import { getCompetitors, addCompetitorDirectly, searchYouTubeChannels, deleteCompetitor } from "@/actions/competitors";
import { Competitor } from "@/components/dashboard/topic-generator/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { IconSearch, IconPlus, IconLoader2, IconCheck, IconTrash } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface CompetitorSelectorProps {
  onChange: (competitorIds: string[]) => void;
  selectedIds: string[];
}

export function CompetitorSelector({ onChange, selectedIds }: CompetitorSelectorProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search Modal State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Initial Fetch
  const fetchCompetitors = async () => {
    setLoading(true);
    const result = await getCompetitors();
    if (result.success && result.data) {
      setCompetitors(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  // Debounce logic for live search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const result = await searchYouTubeChannels(debouncedQuery);
      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        toast.error(result.error || "Search failed");
      }
      setIsSearching(false);
    };

    performSearch();
  }, [debouncedQuery]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(v => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleAdd = async (channel: any) => {
    setAddingId(channel.channelId);
    const result = await addCompetitorDirectly(channel);
    if (result.success && result.data) {
      toast.success("Competitor added!");
      
      const existing = competitors.find(c => c.channelId === channel.channelId);
      if (!existing) {
        setCompetitors((prev) => [result.data as Competitor, ...prev]);
      }
      
      if (!selectedIds.includes(result.data.id)) {
        onChange([...selectedIds, result.data.id]);
      }
      
      setIsModalOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    } else {
      toast.error(result.error || "Failed to add competitor");
    }
    setAddingId(null);
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setCompetitors(prev => prev.filter(c => c.id !== id));
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(v => v !== id));
    }
    
    const result = await deleteCompetitor(id);
    if (!result.success) {
      toast.error("Failed to delete competitor");
      fetchCompetitors(); // Revert on fail
    } else {
      toast.success("Competitor removed");
    }
  };

  const formatSubscribers = (count: number) => {
    if (!count) return "0 subs";
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(count) + " subs";
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Select Competitors to Analyze</label>
        <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {competitors.map((comp) => {
            const isSelected = selectedIds.includes(comp.id);
            return (
              <ContextMenu key={comp.id}>
                <ContextMenuTrigger asChild>
                  <Card 
                    className={`relative p-4 cursor-pointer transition-all hover:border-primary/50 flex flex-col items-center text-center gap-3 ${
                      isSelected ? "border-primary bg-primary/5 shadow-sm" : ""
                    }`}
                    onClick={() => toggleSelection(comp.id)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                        <IconCheck className="w-3 h-3" />
                      </div>
                    )}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={comp.thumbnailUrl || undefined} />
                      <AvatarFallback>{comp.channelName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 w-full">
                      <p className="text-sm font-medium leading-none truncate w-full">{comp.channelName}</p>
                      {comp.channelHandle && (
                        <p className="text-xs text-muted-foreground truncate w-full">{comp.channelHandle}</p>
                      )}
                    </div>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem 
                    className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                    onClick={() => handleDelete(comp.id)}
                  >
                    <IconTrash className="w-4 h-4" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Card className="p-4 cursor-pointer border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center text-center gap-2 min-h-[120px]">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <IconPlus className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Add Channel</span>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a Competitor</DialogTitle>
              </DialogHeader>
              
              <div className="flex gap-2 mt-4 relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, @handle, or URL..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={addingId !== null}
                />
              </div>

              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {isSearching ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((channel, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage src={channel.thumbnailUrl} />
                          <AvatarFallback>{channel.title.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden pr-2">
                          <p className="text-sm font-medium truncate">{channel.title}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {channel.handle && <span className="truncate">{channel.handle}</span>}
                            {channel.subscriberCount > 0 && (
                              <>
                                <span className="shrink-0">•</span>
                                <span className="shrink-0">{formatSubscribers(channel.subscriberCount)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleAdd(channel)}
                        disabled={addingId === channel.channelId}
                        className="shrink-0"
                      >
                        {addingId === channel.channelId ? <IconLoader2 className="w-3 h-3 animate-spin" /> : "Add"}
                      </Button>
                    </div>
                  ))
                ) : searchQuery.trim() !== "" && !isSearching ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No channels found
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
