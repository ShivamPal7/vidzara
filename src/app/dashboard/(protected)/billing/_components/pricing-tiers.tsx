"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Coins, Loader2 } from "lucide-react";
import CountUp from "react-countup";
import Script from "next/script";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserCreditsAction } from "@/actions/credits";
import { useEffect } from "react";

export function PricingTiers({ isIndia }: { isIndia: boolean }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [currentCycle, setCurrentCycle] = useState<string>("MONTHLY");
  const router = useRouter();

  const fetchPlan = async () => {
    try {
      const result = await getUserCreditsAction();
      if (result.success) {
        setCurrentPlan(result.plan || "FREE");
        setCurrentCycle(result.billingCycle || "MONTHLY");
      }
    } catch (e) {
      console.error("Failed to fetch user plan", e);
    }
  };

  useEffect(() => {
    fetchPlan();
    const handleCreditsUpdated = () => fetchPlan();
    window.addEventListener("credits-updated", handleCreditsUpdated);
    return () => window.removeEventListener("credits-updated", handleCreditsUpdated);
  }, []);

  const currencySymbol = isIndia ? "₹" : "$";

  const starterPrice = isIndia ? 99 : 1;
  
  const creatorMonthly = isIndia ? 999 : 19;
  const creatorYearly = isIndia ? 7999 : 190;
  const creatorSave = isIndia ? 3990 : 38;

  const studioMonthly = isIndia ? 3499 : 59;
  const studioYearly = isIndia ? 27999 : 590;
  const studioSave = isIndia ? 13989 : 118;

  const handleSubscribe = async (planKey: string) => {
    try {
      setLoadingPlan(planKey);
      
      const response = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: planKey }),
      });
      
      const subscription = await response.json();
      
      if (!response.ok) throw new Error(subscription.error || "Failed to create subscription");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Vidzara",
        description: "Premium Subscription",
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          
          if (verifyRes.ok) {
            toast.success("Subscription successful!");
            window.dispatchEvent(new Event("credits-updated"));
          } else {
            toast.error("Subscription verification failed.");
          }
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong initializing subscription.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Billing Cycle Switcher */}
      <div className="flex justify-center pt-4 pb-2">
        <Tabs
          value={billingCycle}
          onValueChange={(val) => setBillingCycle(val as "monthly" | "yearly")}
          className="w-full max-w-[300px]"
        >
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="monthly" className="text-sm">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-sm">
              Yearly
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] px-1.5 py-0 h-5">
                Save
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Starter Trial */}
        <Card className="flex flex-col relative transition-all hover:shadow-md border-muted">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold">Starter Trial</CardTitle>
                <CardDescription>Low-friction entry gateway</CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary">Trial</Badge>
            </div>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold tracking-tight">
              {currencySymbol}
              <CountUp end={starterPrice} duration={0.8} separator="," preserveValue />
              <span className="ml-1 text-base font-normal text-muted-foreground">
                / {isIndia ? "7 days" : "3 days"}
              </span>
            </div>
            <div className="text-xs font-semibold text-primary mt-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> 150 Credits Included
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <p className="text-xs text-muted-foreground">
              {isIndia ? "Try all premium tools for a week to kickstart your content workflow." : "Perfect gateway to fully test our AI-assisted features."}
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">150 AI Credits</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Access to All AI Tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Script Writing & SEO Generation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Thumbnail Concepts & Hook Detection</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Topic & Niche Suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Creator Growth Dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Limited Trial Access</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4 px-4 sm:px-6">
            <Button className="w-full" variant="outline">
              Start {isIndia ? "7-Day" : "3-Day"} Trial
            </Button>
          </CardFooter>
        </Card>

        {/* Tier 2: Creator Pro */}
        <Card className="flex flex-col relative border-primary shadow-md hover:shadow-lg transition-all transform md:-translate-y-1">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 shadow-sm uppercase tracking-widest text-[9px]">
              ⭐️ Most Popular
            </Badge>
          </div>
          <CardHeader className="px-4 sm:px-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                  Creator Pro
                </CardTitle>
                <CardDescription>Best for serious & growing creators</CardDescription>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex items-baseline text-4xl font-extrabold tracking-tight">
                {currencySymbol}
                <CountUp 
                  end={billingCycle === "monthly" ? creatorMonthly : creatorYearly} 
                  duration={0.8} 
                  separator="," 
                  preserveValue 
                />
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  / {billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              {billingCycle === "yearly" && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Save {currencySymbol}{creatorSave} / year
                </span>
              )}
            </div>

            <div className="text-xs font-semibold text-primary mt-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> 1,200 Credits / month
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Highly affordable entry point to sustain consistent, programmatic uploads all month long.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">1200 AI Credits / Month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Access to All AI Tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Create Long-form & Shorts Scripts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>AI SEO Optimization Suite</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Thumbnail Concept Generator</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Competitor & Channel Analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Save Project History</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Faster AI Generation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Monthly Credit Renewal</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4 px-4 sm:px-6">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
              onClick={() => handleSubscribe(`creator_${billingCycle}_inr`)}
              disabled={loadingPlan === `creator_${billingCycle}_inr` || (currentPlan === "LIMITED_PRO" && currentCycle.toLowerCase() === billingCycle)}
            >
              {loadingPlan === `creator_${billingCycle}_inr` ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               (currentPlan === "LIMITED_PRO" && currentCycle.toLowerCase() === billingCycle) ? "Current Plan" : "Upgrade to Pro"}
            </Button>
          </CardFooter>
        </Card>

        {/* Tier 3: Studio Unlimited */}
        <Card className="flex flex-col relative transition-all hover:shadow-md border-muted">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold">Studio Unlimited</CardTitle>
                <CardDescription>Premium anchor for elite users & agencies</CardDescription>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex items-baseline text-4xl font-extrabold tracking-tight">
                {currencySymbol}
                <CountUp 
                  end={billingCycle === "monthly" ? studioMonthly : studioYearly} 
                  duration={0.8} 
                  separator="," 
                  preserveValue 
                />
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  / {billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              {billingCycle === "yearly" && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Save {currencySymbol}{studioSave} / year
                </span>
              )}
            </div>

            <div className="text-xs font-semibold text-primary mt-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> 6,000 Credits / month
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Designed to support deep-pocketed agency settings, production teams, and elite creators.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">6000 AI Credits / Month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Access to All AI Tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>High-Volume AI Generations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Faster Priority Processing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Bulk Content Creation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Advanced Usage Capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Early Access Features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Premium Priority Support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Highest Monthly Credit Limits</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="pt-4 px-4 sm:px-6">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleSubscribe(`studio_${billingCycle}_inr`)}
              disabled={loadingPlan === `studio_${billingCycle}_inr` || (currentPlan === "UNLIMITED_PRO" && currentCycle.toLowerCase() === billingCycle)}
            >
              {loadingPlan === `studio_${billingCycle}_inr` ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               (currentPlan === "UNLIMITED_PRO" && currentCycle.toLowerCase() === billingCycle) ? "Current Plan" : "Subscribe to Unlimited"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
