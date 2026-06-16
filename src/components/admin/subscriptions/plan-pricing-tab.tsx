"use client";

import { useState, useEffect } from "react";
import { getPlanConfigs, updatePlanConfig } from "@/actions/admin/plan-config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plan } from "../../../../prisma/generated/prisma/enums";
import { Loader2, Coins, CreditCard, Sparkles } from "lucide-react";

interface PlanConfigData {
  id: string;
  plan: Plan;
  monthlyPriceINR: number;
  yearlyPriceINR: number;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  monthlyCredits: number;
  yearlyCredits: number;
  razorpayPlanMonthlyINR: string | null;
  razorpayPlanYearlyINR: string | null;
  razorpayPlanMonthlyUSD: string | null;
  razorpayPlanYearlyUSD: string | null;
}

export function PlanPricingTab() {
  const [configs, setConfigs] = useState<PlanConfigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState<Plan | null>(null);

  // Local form state
  const [formData, setFormData] = useState<Record<Plan, Partial<PlanConfigData>>>({
    [Plan.FREE]: {},
    [Plan.LIMITED_PRO]: {},
    [Plan.UNLIMITED_PRO]: {},
  });

  useEffect(() => {
    async function loadConfigs() {
      try {
        setLoading(true);
        const data = await getPlanConfigs();
        setConfigs(data as PlanConfigData[]);
        
        // Initialize form state
        const initialForm: any = {};
        data.forEach((config) => {
          initialForm[config.plan] = {
            monthlyPriceINR: config.monthlyPriceINR,
            yearlyPriceINR: config.yearlyPriceINR,
            monthlyPriceUSD: config.monthlyPriceUSD,
            yearlyPriceUSD: config.yearlyPriceUSD,
            monthlyCredits: config.monthlyCredits,
            yearlyCredits: config.yearlyCredits,
          };
        });
        setFormData(initialForm);
      } catch (error: any) {
        toast.error("Failed to load plan configurations: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    loadConfigs();
  }, []);

  const handleInputChange = (plan: Plan, field: keyof PlanConfigData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: value,
      },
    }));
  };

  const handleSave = async (plan: Plan) => {
    try {
      setSavingPlan(plan);
      const planForm = formData[plan];
      
      const payload = {
        monthlyPriceINR: Number(planForm.monthlyPriceINR),
        yearlyPriceINR: Number(planForm.yearlyPriceINR),
        monthlyPriceUSD: Number(planForm.monthlyPriceUSD),
        yearlyPriceUSD: Number(planForm.yearlyPriceUSD),
        monthlyCredits: Number(planForm.monthlyCredits),
        yearlyCredits: Number(planForm.yearlyCredits),
      };

      if (Object.values(payload).some(isNaN)) {
        toast.error("Please ensure all fields are valid numbers.");
        return;
      }

      const res = await updatePlanConfig(plan, payload);
      
      if (res.success) {
        toast.success(`${plan === Plan.LIMITED_PRO ? "Creator Pro" : "Studio Unlimited"} configuration updated successfully!`);
        // Update local configs with the returned new values
        setConfigs((prev) => 
          prev.map((c) => c.plan === plan ? { ...c, ...res.config } as PlanConfigData : c)
        );
      }
    } catch (error: any) {
      toast.error("Failed to update plan config: " + error.message);
    } finally {
      setSavingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm">Retrieving plan pricing and gateway details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-200">Plan Financial Matrix</h2>
        <p className="text-zinc-500 text-sm mt-0.5">
          Configure prices, monthly allotments, and credit ratios. Price changes will dynamically register new billing plans with the payment gateway.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {configs.map((config) => {
          const planKey = config.plan;
          const planName = planKey === Plan.LIMITED_PRO ? "Creator Pro" : "Studio Unlimited";
          const form = formData[planKey];
          const isSaving = savingPlan === planKey;

          return (
            <Card key={config.id} className="bg-zinc-950/40 border-zinc-800/80 backdrop-blur-sm shadow-xl flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="border-b border-zinc-900 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {planName}
                  </CardTitle>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 uppercase font-mono tracking-wider text-[10px]">
                    {planKey}
                  </Badge>
                </div>
                <CardDescription>Adjust base parameters and currency variations.</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-6 flex-1">
                {/* Credits Segment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> Credits Allocation
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${planKey}-m-credits`} className="text-xs text-zinc-400">Monthly Credits</Label>
                      <Input
                        id={`${planKey}-m-credits`}
                        type="number"
                        className="bg-zinc-950 border-zinc-800"
                        value={form.monthlyCredits ?? ""}
                        onChange={(e) => handleInputChange(planKey, "monthlyCredits", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${planKey}-y-credits`} className="text-xs text-zinc-400">Yearly Credits</Label>
                      <Input
                        id={`${planKey}-y-credits`}
                        type="number"
                        className="bg-zinc-950 border-zinc-800"
                        value={form.yearlyCredits ?? ""}
                        onChange={(e) => handleInputChange(planKey, "yearlyCredits", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* INR Prices Segment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-sky-400" /> India Pricing (INR - ₹)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${planKey}-m-inr`} className="text-xs text-zinc-400">Monthly Price (₹)</Label>
                      <Input
                        id={`${planKey}-m-inr`}
                        type="number"
                        className="bg-zinc-950 border-zinc-800"
                        value={form.monthlyPriceINR ?? ""}
                        onChange={(e) => handleInputChange(planKey, "monthlyPriceINR", Number(e.target.value))}
                      />
                      {config.razorpayPlanMonthlyINR && (
                        <span className="text-[10px] text-zinc-500 font-mono block truncate">
                          ID: {config.razorpayPlanMonthlyINR}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${planKey}-y-inr`} className="text-xs text-zinc-400">Yearly Price (₹)</Label>
                      <Input
                        id={`${planKey}-y-inr`}
                        type="number"
                        className="bg-zinc-950 border-zinc-800"
                        value={form.yearlyPriceINR ?? ""}
                        onChange={(e) => handleInputChange(planKey, "yearlyPriceINR", Number(e.target.value))}
                      />
                      {config.razorpayPlanYearlyINR && (
                        <span className="text-[10px] text-zinc-500 font-mono block truncate">
                          ID: {config.razorpayPlanYearlyINR}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* USD Prices Segment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Global Pricing (USD - $)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`${planKey}-m-usd`} className="text-xs text-zinc-400">Monthly Price ($)</Label>
                      <Input
                        id={`${planKey}-m-usd`}
                        type="number"
                        className="bg-zinc-950 border-zinc-800"
                        value={form.monthlyPriceUSD ?? ""}
                        onChange={(e) => handleInputChange(planKey, "monthlyPriceUSD", Number(e.target.value))}
                      />
                      {config.razorpayPlanMonthlyUSD && (
                        <span className="text-[10px] text-zinc-500 font-mono block truncate">
                          ID: {config.razorpayPlanMonthlyUSD}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`${planKey}-y-usd`} className="text-xs text-zinc-400">Yearly Price ($)</Label>
                      <Input
                        id={`${planKey}-y-usd`}
                        type="number"
                        className="bg-zinc-950 border-zinc-800"
                        value={form.yearlyPriceUSD ?? ""}
                        onChange={(e) => handleInputChange(planKey, "yearlyPriceUSD", Number(e.target.value))}
                      />
                      {config.razorpayPlanYearlyUSD && (
                        <span className="text-[10px] text-zinc-500 font-mono block truncate">
                          ID: {config.razorpayPlanYearlyUSD}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-zinc-950/20 border-t border-zinc-900 px-6 py-4 flex justify-end">
                <Button 
                  onClick={() => handleSave(planKey)} 
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Matrix...
                    </>
                  ) : "Save Configuration"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
