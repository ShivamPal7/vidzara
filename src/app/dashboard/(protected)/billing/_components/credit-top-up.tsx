"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserCreditsAction } from "@/actions/credits";

export function CreditTopUp({ isIndia }: { isIndia: boolean }) {
  const [loading, setLoading] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("FREE");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [fetchingPlan, setFetchingPlan] = useState(true);
  const router = useRouter();

  const fetchUserPlan = async () => {
    try {
      setFetchingPlan(true);
      const result = await getUserCreditsAction();
      if (result.success) {
        setPlan(result.plan || "FREE");
        setSubscriptionStatus(result.subscriptionStatus || null);
      }
    } catch (e) {
      console.error("Failed to fetch user plan for top-up eligibility:", e);
    } finally {
      setFetchingPlan(false);
    }
  };

  useEffect(() => {
    fetchUserPlan();

    const handleCreditsUpdated = () => {
      fetchUserPlan();
    };

    window.addEventListener("credits-updated", handleCreditsUpdated);
    return () => window.removeEventListener("credits-updated", handleCreditsUpdated);
  }, []);

  const isEligible = (plan === "LIMITED_PRO" || plan === "UNLIMITED_PRO") && subscriptionStatus === "ACTIVE";

  const topUps = [
    { credits: 250, price: isIndia ? "₹299" : "$5", amount: isIndia ? 29900 : 500, currency: isIndia ? "INR" : "USD" },
    { credits: 1000, price: isIndia ? "₹999" : "$15", amount: isIndia ? 99900 : 1500, currency: isIndia ? "INR" : "USD", popular: true },
    { credits: 3000, price: isIndia ? "₹2,499" : "$35", amount: isIndia ? 249900 : 3500, currency: isIndia ? "INR" : "USD" },
  ];

  const handlePayment = async (amount: number, currency: string, index: number) => {
    if (!isEligible) {
      toast.error("Top-ups are only available for active Pro and Unlimited plans.");
      return;
    }

    try {
      setLoading(index);
      
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });
      
      const order = await response.json();
      
      if (!response.ok) throw new Error(order.error || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vidzara",
        description: "Credit Top-up",
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          
          if (verifyRes.ok) {
            toast.success("Payment Successful!");
            window.dispatchEvent(new Event("credits-updated"));
          } else {
            toast.error("Payment verification failed.");
          }
        },
        theme: {
          color: "#4f46e5" // indigo-600
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Card className="bg-muted/30 border-dashed border-2">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 sm:px-6">
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 border shadow-sm">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <CardTitle className="pb-1 text-lg sm:text-xl">Need a quick boost?</CardTitle>
            <CardDescription>Add credits bundles on demand without modifying your current tier.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {!fetchingPlan && !isEligible && (
            <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 rounded-xl flex items-center gap-2">
              <span>⚠️ Top-ups are only available for active Creator Pro and Studio Unlimited subscription plans.</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topUps.map((bundle, i) => (
              <Button
                key={bundle.credits}
                variant="secondary"
                onClick={() => handlePayment(bundle.amount, bundle.currency, i)}
                disabled={loading !== null || fetchingPlan || !isEligible}
                className={cn(
                  "font-semibold py-5 h-auto w-full transition-all flex flex-col items-center gap-1 border",
                  bundle.popular && isEligible ? "border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary" : "border-muted"
                )}
              >
                {loading === i ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="flex items-center gap-1 text-sm">
                      <Coins className="w-4 h-4" /> {bundle.credits.toLocaleString()} Credits
                    </span>
                    <span className="text-muted-foreground text-xs font-normal">
                      {bundle.price} one-time
                    </span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
