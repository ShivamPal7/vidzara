"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { getUserCreditsAction } from "@/actions/credits";

export function CreditBalance() {
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("FREE");
  const [billingCycle, setBillingCycle] = useState<string>("MONTHLY");
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const result = await getUserCreditsAction();
      if (result.success) {
        setCredits(result.credits);
        setPlan(result.plan || "FREE");
        setBillingCycle(result.billingCycle || "MONTHLY");
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();

    const handleCreditsUpdated = () => {
      fetchCredits();
    };

    window.addEventListener("credits-updated", handleCreditsUpdated);
    return () => window.removeEventListener("credits-updated", handleCreditsUpdated);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-background border-primary/20 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Current Balance
          </div>
          {!loading && (
            <div className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 w-fit">
              {plan === "LIMITED_PRO" ? "Creator Pro" : plan === "UNLIMITED_PRO" ? "Studio Unlimited" : "Starter Trial"} 
              {plan !== "FREE" && ` (${billingCycle})`}
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Your available credits and active subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="flex items-baseline gap-2">
          {loading ? (
            <span className="text-5xl font-black tabular-nums tracking-tighter opacity-50 animate-pulse">---</span>
          ) : (
            <span className="text-5xl font-black tabular-nums tracking-tighter text-foreground">
              {credits !== null ? credits : 0}
            </span>
          )}
          <span className="text-xl font-medium text-muted-foreground uppercase tracking-wider">Credits</span>
        </div>
      </CardContent>
    </Card>
  );
}
