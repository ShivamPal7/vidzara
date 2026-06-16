"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Coins, Loader2, Tag, Percent } from "lucide-react";
import CountUp from "react-countup";
import Script from "next/script";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserCreditsAction } from "@/actions/credits";
import { fetchPlanPricingAction, validateCouponAction } from "@/actions/user-coupon";

interface PlanConfigData {
  plan: string;
  monthlyPriceINR: number;
  yearlyPriceINR: number;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  monthlyCredits: number;
  yearlyCredits: number;
}

export function PricingTiers({ isIndia }: { isIndia: boolean }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [currentCycle, setCurrentCycle] = useState<string>("MONTHLY");
  
  // Dynamic Pricing Configurations
  const [configs, setConfigs] = useState<PlanConfigData[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const loadPricingConfigs = async () => {
    try {
      setLoadingPricing(true);
      const result = await fetchPlanPricingAction();
      if (result.success) {
        setConfigs(result.configs as PlanConfigData[]);
      }
    } catch (e) {
      console.error("Failed to load pricing configurations:", e);
    } finally {
      setLoadingPricing(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    loadPricingConfigs();

    const handleCreditsUpdated = () => fetchPlan();
    window.addEventListener("credits-updated", handleCreditsUpdated);
    return () => window.removeEventListener("credits-updated", handleCreditsUpdated);
  }, []);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    try {
      setIsValidating(true);
      setValidationError(null);

      // Validate against the current selected cycle and a representative plan (LIMITED_PRO)
      const res = await validateCouponAction({
        code,
        plan: "LIMITED_PRO", // representative check for validity
        billingCycle: billingCycle === "monthly" ? "MONTHLY" : "YEARLY",
        isIndia,
      });

      if (res.success) {
        setAppliedCoupon({
          code: res.code,
          discountPercent: res.discountPercent,
        });
        toast.success(`Coupon "${res.code}" applied successfully!`);
      } else {
        setValidationError(res.error);
        toast.error(res.error);
      }
    } catch (error: any) {
      setValidationError(error.message || "Failed to validate coupon.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setValidationError(null);
    toast.info("Coupon code removed.");
  };

  const currencySymbol = isIndia ? "₹" : "$";

  // Base configurations (fallback if loading)
  const starterPrice = isIndia ? 99 : 1;
  const starterCredits = 150;

  let creatorMonthly = isIndia ? 999 : 19;
  let creatorYearly = isIndia ? 7999 : 190;
  let creatorCredits = 1200;

  let studioMonthly = isIndia ? 3499 : 59;
  let studioYearly = isIndia ? 27999 : 590;
  let studioCredits = 6000;

  // Match configurations from DB
  const creatorConfig = configs.find((c) => c.plan === "LIMITED_PRO");
  const studioConfig = configs.find((c) => c.plan === "UNLIMITED_PRO");

  if (creatorConfig) {
    creatorMonthly = isIndia ? creatorConfig.monthlyPriceINR : creatorConfig.monthlyPriceUSD;
    creatorYearly = isIndia ? creatorConfig.yearlyPriceINR : creatorConfig.yearlyPriceUSD;
    creatorCredits = creatorConfig.monthlyCredits;
  }

  if (studioConfig) {
    studioMonthly = isIndia ? studioConfig.monthlyPriceINR : studioConfig.monthlyPriceUSD;
    studioYearly = isIndia ? studioConfig.yearlyPriceINR : studioConfig.yearlyPriceUSD;
    studioCredits = studioConfig.monthlyCredits;
  }

  // Savings
  const creatorSave = creatorMonthly * 12 - creatorYSaveValue();
  function creatorYSaveValue() {
    return creatorYearly;
  }
  const studioSave = studioMonthly * 12 - studioYearly;

  // Apply Coupon Discounts
  const calculateDiscount = (price: number) => {
    if (!appliedCoupon) return price;
    const discount = Math.round((price * appliedCoupon.discountPercent) / 100);
    return price - discount;
  };

  const finalCreatorMonthly = calculateDiscount(creatorMonthly);
  const finalCreatorYearly = calculateDiscount(creatorYearly);
  const finalStudioMonthly = calculateDiscount(studioMonthly);
  const finalStudioYearly = calculateDiscount(studioYearly);

  const handleSubscribe = async (planKey: string) => {
    try {
      setLoadingPlan(planKey);
      
      const response = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planType: planKey,
          isIndia: isIndia,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined
        }),
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
            body: JSON.stringify({
              ...response,
              couponCode: appliedCoupon ? appliedCoupon.code : undefined
            }),
          });
          
          if (verifyRes.ok) {
            toast.success("Subscription successful!");
            window.dispatchEvent(new Event("credits-updated"));
            router.refresh();
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
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong initializing subscription.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Billing Cycle Switcher */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 pb-2">
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
              <Coins className="w-3.5 h-3.5" /> {starterCredits} Credits Included
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <p className="text-xs text-muted-foreground">
              {isIndia ? "Try all premium tools for a week to kickstart your content workflow." : "Perfect gateway to fully test our AI-assisted features."}
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">{starterCredits} AI Credits</span>
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
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
                  end={billingCycle === "monthly" ? finalCreatorMonthly : finalCreatorYearly} 
                  duration={0.8} 
                  separator="," 
                  preserveValue 
                />
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  / {billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              
              {appliedCoupon && (
                <span className="text-xs text-zinc-500 line-through">
                  Original: {currencySymbol}{billingCycle === "monthly" ? creatorMonthly : creatorYearly}
                </span>
              )}

              {billingCycle === "yearly" && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Save {currencySymbol}{appliedCoupon ? (creatorMonthly * 12 - finalCreatorYearly) : creatorSave} / year
                </span>
              )}
            </div>

            <div className="text-xs font-semibold text-primary mt-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> {creatorCredits.toLocaleString()} Credits / month
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Highly affordable entry point to sustain consistent, programmatic uploads all month long.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">{creatorCredits.toLocaleString()} AI Credits / Month</span>
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
                  end={billingCycle === "monthly" ? finalStudioMonthly : finalStudioYearly} 
                  duration={0.8} 
                  separator="," 
                  preserveValue 
                />
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  / {billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              
              {appliedCoupon && (
                <span className="text-xs text-zinc-500 line-through">
                  Original: {currencySymbol}{billingCycle === "monthly" ? studioMonthly : studioYearly}
                </span>
              )}

              {billingCycle === "yearly" && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Save {currencySymbol}{appliedCoupon ? (studioMonthly * 12 - finalStudioYearly) : studioSave} / year
                </span>
              )}
            </div>

            <div className="text-xs font-semibold text-primary mt-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" /> {studioCredits.toLocaleString()} Credits / month
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Designed to support deep-pocketed agency settings, production teams, and elite creators.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">{studioCredits.toLocaleString()} AI Credits / Month</span>
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

      {/* Coupon Application Zone */}
      <div className="max-w-md mx-auto mt-8 bg-zinc-950/30 p-4 border border-zinc-800/80 rounded-xl backdrop-blur-sm shadow-xl animate-in fade-in duration-200">
        <div className="space-y-2">
          <Label htmlFor="promo-code" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Have a Coupon Code?
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="promo-code"
                type="text"
                placeholder="ENTER PROMO CODE"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 pl-9 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setValidationError(null);
                }}
                disabled={!!appliedCoupon}
              />
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
            
            {appliedCoupon ? (
              <Button 
                variant="destructive" 
                onClick={handleRemoveCoupon}
                className="px-4 py-2 font-medium text-sm rounded-lg"
              >
                Remove
              </Button>
            ) : (
              <Button 
                onClick={handleApplyCoupon} 
                disabled={isValidating || !couponInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg px-4 py-2"
              >
                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </Button>
            )}
          </div>
          
          {validationError && (
            <p className="text-rose-500 text-xs mt-1 font-medium">
              ⚠️ {validationError}
            </p>
          )}
          
          {appliedCoupon && (
            <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Coupon "{appliedCoupon.code}" successfully applied! ({appliedCoupon.discountPercent}% OFF)
            </p>
          )}
        </div>
      </div>
    </>
  );
}
