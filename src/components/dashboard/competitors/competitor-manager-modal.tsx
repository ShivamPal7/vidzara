"use client";

import { useState, useEffect } from "react";
import { getCompetitors, addCompetitorDirectly, searchYouTubeChannels, deleteCompetitor } from "@/actions/competitors";
import { Competitor } from "@/components/dashboard/topic-generator/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { IconSearch, IconLoader2, IconDots, IconPlus, IconSettings, IconBrandYoutube, IconTrash } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCredits } from "@/components/dashboard/credits-provider";
import { getCreditCost } from "@/lib/credits";
import { Feature } from "../../../../prisma/generated/prisma/enums";

interface CompetitorManagerModalProps {
  onChange: (competitorIds: string[]) => void;
  selectedIds: string[];
  competitors: Competitor[];
  setCompetitors: React.Dispatch<React.SetStateAction<Competitor[]>>;
  children?: React.ReactNode;
}

export function CompetitorManagerModal({ 
  onChange, 
  selectedIds, 
  competitors, 
  setCompetitors,
  children 
}: CompetitorManagerModalProps) {
  const { credits, openCreditGate, deductCreditsLocal } = useCredits();
  const [open, setOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce logic
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

  const toggleAll = () => {
    if (selectedIds.length === competitors.length) {
      onChange([]);
    } else {
      onChange(competitors.map(c => c.id));
    }
  };

  const handleAdd = async (channel: any) => {
    const cost = getCreditCost(Feature.COMPETITORS);

    if (credits !== null && credits < cost) {
      openCreditGate("Competitor Analysis", cost);
      return;
    }

    setAddingId(channel.channelId);
    deductCreditsLocal(cost);
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
      
      setSearchQuery("");
      setSearchResults([]);
    } else {
      deductCreditsLocal(-cost);
      toast.error(result.error || "Failed to add competitor.");
    }
    setAddingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteCompetitor(id);
    if (result.success) {
      toast.success("Competitor removed");
      setCompetitors(prev => prev.filter(c => c.id !== id));
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter(selectedId => selectedId !== id));
      }
    } else {
      toast.error(result.error || "Failed to remove competitor");
    }
    setDeletingId(null);
  };

  const formatSubscribers = (count: number) => {
    if (!count) return "0 subs";
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(count);
  };

  const isAllSelected = competitors.length > 0 && selectedIds.length === competitors.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2 px-3 md:px-4">
            <IconSettings className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Manage Competitors</span>
            <span className="inline sm:hidden">Manage</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Manage Competitors</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Search */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels to add..."
              className="pl-9 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Results Dropdown-like area if searching */}
          {searchQuery.trim() !== "" && (
            <div className="bg-muted/30 border border-border/50 rounded-md p-2 space-y-2 max-h-[200px] overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center p-4">
                  <IconLoader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((channel, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={channel.thumbnailUrl} />
                        <AvatarFallback>{channel.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium truncate">{channel.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{formatSubscribers(channel.subscriberCount)} subs</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 px-3 gap-1.5 shrink-0 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      onClick={() => handleAdd(channel)}
                      disabled={addingId === channel.channelId}
                    >
                      {addingId === channel.channelId ? (
                        <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <IconPlus className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold uppercase tracking-wider">Add</span>
                        </>
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No results found</p>
              )}
            </div>
          )}

          {/* Competitor List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 px-1">
              <Checkbox 
                id="select-all" 
                checked={isAllSelected}
                onCheckedChange={toggleAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select all
              </label>
            </div>

            {competitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <IconBrandYoutube className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Search and add channels above to track them.</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                {competitors.map(comp => {
                  const isSelected = selectedIds.includes(comp.id);
                  return (
                    <div 
                      key={comp.id} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => toggleSelection(comp.id)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Checkbox 
                          checked={isSelected}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          onCheckedChange={() => toggleSelection(comp.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comp.thumbnailUrl || undefined} />
                          <AvatarFallback>{comp.channelName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{comp.channelName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {comp.channelHandle || "Competitor"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={deletingId === comp.id}
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(comp.id);
                        }}
                      >
                        {deletingId === comp.id ? (
                          <IconLoader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <IconTrash className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
