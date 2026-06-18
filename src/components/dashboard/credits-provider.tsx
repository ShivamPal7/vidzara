"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getUserCreditsAction } from "@/actions/credits";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  IconCoins,
  IconClock,
  IconCheck,
  IconSparkles,
  IconChevronRight,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";

interface CreditsContextType {
  credits: number | null;
  plan: string | null;
  subscriptionStatus: string | null;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  deductCreditsLocal: (amount: number) => void;
  openCreditGate: (featureName: string, requiredCost?: number) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [country, setCountry] = useState<string>("US");
  const [hasBoughtSubscription, setHasBoughtSubscription] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  // Gate Modal State
  const [gateOpen, setGateOpen] = useState(false);
  const [featureName, setFeatureName] = useState("");
  const [requiredCost, setRequiredCost] = useState(5);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Time remaining for 24h offer
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [offerEligible, setOfferEligible] = useState(false);

  const router = useRouter();

  const loadLocalCache = () => {
    try {
      const cachedCredits = localStorage.getItem("vidzara_credits");
      const cachedPlan = localStorage.getItem("vidzara_plan");
      const cachedStatus = localStorage.getItem("vidzara_subscription_status");
      const cachedCreatedAt = localStorage.getItem("vidzara_signup_date");
      const cachedCountry = localStorage.getItem("vidzara_country");
      const cachedHasBought = localStorage.getItem("vidzara_has_bought_sub");

      if (cachedCredits !== null) setCredits(parseInt(cachedCredits, 10));
      if (cachedPlan) setPlan(cachedPlan);
      if (cachedStatus) setSubscriptionStatus(cachedStatus);
      if (cachedCreatedAt) setCreatedAt(cachedCreatedAt);
      if (cachedCountry) setCountry(cachedCountry);
      if (cachedHasBought !== null) setHasBoughtSubscription(cachedHasBought === "true");
    } catch (e) {
      console.error("Failed to read credits cache:", e);
    }
  };

  const saveLocalCache = (c: number, p: string, status: string | null, date: string, countr: string, hasBought: boolean) => {
    try {
      localStorage.setItem("vidzara_credits", c.toString());
      localStorage.setItem("vidzara_plan", p);
      if (status) {
        localStorage.setItem("vidzara_subscription_status", status);
      } else {
        localStorage.removeItem("vidzara_subscription_status");
      }
      localStorage.setItem("vidzara_signup_date", date);
      localStorage.setItem("vidzara_country", countr);
      localStorage.setItem("vidzara_has_bought_sub", hasBought.toString());
    } catch (e) {
      console.error("Failed to write credits cache:", e);
    }
  };

  const refreshCredits = useCallback(async () => {
    try {
      const result = await getUserCreditsAction();
      if (result.success) {
        setCredits(result.credits);
        setPlan(result.plan);
        setSubscriptionStatus(result.subscriptionStatus);
        setCreatedAt(result.createdAt ? result.createdAt.toISOString() : null);
        
        let detectedCountry = result.country || "US";
        // Dev mode timezone override for local testing
        if (process.env.NODE_ENV !== "production") {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") {
            detectedCountry = "IN";
          }
        }
        
        setCountry(detectedCountry);
        setHasBoughtSubscription(result.hasBoughtSubscription || false);
        
        saveLocalCache(
          result.credits,
          result.plan,
          result.subscriptionStatus,
          result.createdAt ? result.createdAt.toISOString() : "",
          detectedCountry,
          result.hasBoughtSubscription || false
        );
      }
    } catch (error) {
      console.error("Failed to refresh credits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Load from cache first for instant render
    loadLocalCache();
    // 2. Fetch fresh from server
    refreshCredits();

    // 3. Listen to the global update event
    const handleUpdate = () => {
      refreshCredits();
    };

    window.addEventListener("credits-updated", handleUpdate);
    return () => {
      window.removeEventListener("credits-updated", handleUpdate);
    };
  }, [refreshCredits]);

  // Update 24h offer countdown
  useEffect(() => {
    if (!createdAt) {
      setOfferEligible(false);
      return;
    }

    const signupTime = new Date(createdAt).getTime();
    const expireTime = signupTime + 24 * 60 * 60 * 1000; // 24 hours later

    const updateTimer = () => {
      const now = Date.now();
      const difference = expireTime - now;

      if (difference <= 0) {
        setTimeRemaining("Expired");
        setOfferEligible(false);
        return;
      }

      setOfferEligible(true);

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeRemaining(parts.join(" "));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const deductCreditsLocal = (amount: number) => {
    setCredits((prev) => {
      const next = prev !== null ? Math.max(0, prev - amount) : 0;
      try {
        localStorage.setItem("vidzara_credits", next.toString());
      } catch (e) {}
      return next;
    });
    // Dispatch event to sync other components
    window.dispatchEvent(new Event("credits-updated-local"));
  };

  const openCreditGate = (name: string, cost: number = 5) => {
    setFeatureName(name);
    setRequiredCost(cost);
    setGateOpen(true);
  };

  const handleClaimTrial = async () => {
    try {
      setCheckoutLoading(true);
      const isIndia = country === "IN";
      const planKey = isIndia ? "trial_creator_monthly_inr" : "trial_creator_monthly_usd";

      const response = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planType: planKey,
          isIndia: isIndia,
        }),
      });

      const subscription = await response.json();
      if (!response.ok) throw new Error(subscription.error || "Failed to create trial subscription");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Vidzara",
        description: "7-Day Trial Offer (100 Credits)",
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            if (verifyRes.ok) {
              toast.success("Trial activated! 100 credits granted.");
              setGateOpen(false);
              window.dispatchEvent(new Event("credits-updated"));
              router.refresh();
            } else {
              toast.error("Subscription verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Verification failed. Please contact support.");
          }
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Try again.");
      });
      rzp.open();
    } catch (err: any) {
      console.error("Trial purchase error:", err);
      toast.error(err.message || "Failed to initialize payment gateway.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleUpgradeRedirect = () => {
    setGateOpen(false);
    router.push("/dashboard/billing");
  };

  const isIndia = country === "IN";
  const trialPrice = isIndia ? "₹99" : "$1";
  const normalPriceLabel = isIndia ? "₹1,199" : "$19/mo";
  const normalPriceDisplay = isIndia ? "₹1,199/mo" : "$19/mo";

  return (
    <CreditsContext.Provider
      value={{
        credits,
        plan,
        subscriptionStatus,
        loading,
        refreshCredits,
        deductCreditsLocal,
        openCreditGate,
      }}
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {children}

      {/* Credit Gate Modal */}
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="w-[92%] sm:w-full sm:max-w-md border-primary/20 bg-card/95 backdrop-blur-md text-card-foreground shadow-2xl overflow-hidden p-0 rounded-2xl mx-auto">
          {/* Top aesthetic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <DialogHeader className="space-y-2 sm:space-y-3 items-center text-center">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-destructive/10 text-destructive animate-pulse">
                <IconAlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">
                No Credits Left
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                You need credits to run <span className="font-semibold text-foreground">{featureName || "this feature"}</span>. (Cost: {requiredCost} credits)
              </DialogDescription>
            </DialogHeader>

            {hasBoughtSubscription ? (
              /* Already had subscription in the past */
              <div className="border border-border/50 rounded-xl bg-muted/20 p-4 sm:p-5 space-y-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You have already purchased a subscription in the past. Please upgrade or renew your plan to get more credits.
                </p>

                <Button
                  onClick={handleUpgradeRedirect}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-4 sm:py-5 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15"
                >
                  <IconCoins className="w-4 h-4" />
                  <span>Go to Billing to Checkout Plans</span>
                  <IconChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ) : offerEligible ? (
              /* High-Converting 24h Trial Offer */
              <div className="relative border border-primary/30 rounded-xl bg-primary/5 p-4 sm:p-5 space-y-4 overflow-hidden shadow-inner">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Exclusive Welcome Offer</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-[11px] sm:text-xs font-semibold shrink-0">
                      <IconClock className="w-3.5 h-3.5" />
                      <span>{timeRemaining} left</span>
                    </div>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold leading-snug">
                    Claim 7-Day Trial for <span className="text-indigo-400 text-lg sm:text-xl font-extrabold">{trialPrice}</span>
                  </h4>
                </div>

                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Get <strong className="text-foreground">100 usage credits</strong> instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Access all Creator Pro features for 7 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Auto-renews at {normalPriceLabel} (cancel anytime within 7 days)</span>
                  </li>
                </ul>

                <Button
                  onClick={handleClaimTrial}
                  disabled={checkoutLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-4 sm:py-5 shadow-lg shadow-indigo-600/20 transition-all font-semibold flex items-center justify-center gap-2 group"
                >
                  {checkoutLoading ? (
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <IconSparkles className="w-4 h-4 text-amber-300" />
                      <span>Activate Trial for {trialPrice}</span>
                      <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* Normal Upgrade Modal (Offer Expired) */
              <div className="border rounded-xl bg-muted/40 p-4 sm:p-5 space-y-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your signup trial discount window has expired. Choose a Pro plan to continue generating high-quality creators content.
                </p>

                <div className="flex justify-around items-center py-2 border-y border-border/50">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Creator Pro</span>
                    <span className="text-sm font-bold text-foreground">{normalPriceDisplay}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-border/50" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Credits Grant</span>
                    <span className="text-sm font-bold text-foreground">1,200 / mo</span>
                  </div>
                </div>

                <Button
                  onClick={handleUpgradeRedirect}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-4 sm:py-5 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <IconCoins className="w-4 h-4" />
                  <span>Choose Plan & Upgrade</span>
                  <IconChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setGateOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
}
