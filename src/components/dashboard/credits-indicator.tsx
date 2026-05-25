"use client";

import { useEffect, useState } from "react";
import { getUserCreditsAction } from "@/actions/credits";
import { Coins, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CreditsIndicatorProps {
  className?: string;
}

export function CreditsIndicator({ className }: CreditsIndicatorProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const result = await getUserCreditsAction();
        if (result.success) {
          setCredits(result.credits);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCredits();
    
    const handleCreditsUpdated = () => {
      setLoading(true);
      fetchCredits();
    };
    
    window.addEventListener("credits-updated", handleCreditsUpdated);
    
    // Periodically refresh credits (every minute)
    const interval = setInterval(fetchCredits, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("credits-updated", handleCreditsUpdated);
    };
  }, []);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-md", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  const isLowCredits = credits !== null && credits < 20;

  return (
    <div className={cn("flex items-center justify-between w-full p-3 rounded-lg bg-card border shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary",
          isLowCredits && "bg-destructive/10 text-destructive"
        )}>
          <Coins className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Credits</span>
          <span className={cn(
            "text-base font-bold leading-none",
            isLowCredits ? "text-destructive" : "text-foreground"
          )}>
            {credits !== null ? credits : "--"}
          </span>
        </div>
      </div>
      
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/5 hover:bg-primary/15 hover:text-primary transition-colors" asChild>
              <Link href="/dashboard/billing">
                <Plus className="w-4 h-4" />
                <span className="sr-only">Add Credits</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Buy more credits</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
