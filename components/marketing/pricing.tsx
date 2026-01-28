"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wrapper } from "@/components/marketing/wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type BillingCycle = "monthly" | "yearly";

interface PricingPlan {
    title: string;
    price: {
        monthly: string;
        yearly: string;
    };
    description: string;
    features: string[];
    notIncluded?: string[];
    cta: string;
    highlight?: boolean;
    badge?: string;
}

const plans: PricingPlan[] = [
    {
        title: "Free Trial",
        price: {
            monthly: "₹0",
            yearly: "₹0",
        },
        description: "Perfect for exploring Vidzara.",
        badge: "Free for 1 Month",
        features: [
            "Video SEO Generator (limited)",
            "Topic Generator (limited)",
            "Content Safety Check (basic)",
            "Creator Growth Dashboard",
        ],
        notIncluded: [
            "Script Writing",
            "Thumbnail Concepts",
            "Competitor Analysis",
        ],
        cta: "Start Free Trial",
    },
    {
        title: "Limited Pro",
        price: {
            monthly: "₹599",
            yearly: "₹5,999",
        },
        description: "For growing creators.",
        features: [
            "Video SEO Generator",
            "Shorts Script Writing",
            "Topic Generator",
            "Hook Detector (Shorts)",
            "Thumbnail Concepts",
            "Consistency Checker",
            "Niche Finder",
        ],
        badge: "Most Popular",
        highlight: true,
        cta: "Upgrade to Pro",
    },
    {
        title: "Unlimited Pro",
        price: {
            monthly: "₹899",
            yearly: "₹8,999",
        },
        description: "For serious creators who want it all.",
        badge: "Values",
        highlight: false,
        features: [
            "All features unlocked",
            "Long + Shorts Script Writing",
            "Script Shortener",
            "SEO, Topics, Hooks (Unlimited)",
            "Thumbnails & Safety Check (Unlimited)",
            "No daily limits",
        ],
        cta: "Go Unlimited",
    },
];

export function Pricing() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

    return (
        <section className="bg-background relative overflow-hidden" id="pricing">
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
            </div>

            <Wrapper className="relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-semibold mb-4 tracking-tight">
                        Simple pricing for every creator
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl mb-8">
                        Start free. Upgrade when you’re ready to grow faster with Vidzara.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span
                            onClick={() => setBillingCycle("monthly")}
                            className={cn("text-sm font-medium transition-colors cursor-pointer", billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground")}
                        >
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                            className={cn(
                                "relative w-14 h-7 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                                billingCycle === "yearly" ? "bg-primary" : "bg-muted"
                            )}
                        >
                            <motion.div
                                className="absolute top-1 left-1 w-5 h-5 bg-background rounded-full shadow-sm"
                                animate={{ x: billingCycle === "monthly" ? 0 : 28 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span
                            onClick={() => setBillingCycle("yearly")}
                            className={cn("text-sm font-medium transition-colors cursor-pointer", billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground")}
                        >
                            Yearly <span className="text-green-500 text-xs ml-1 font-bold">(-20%)</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, index) => (
                        <PricingCard key={index} plan={plan} billingCycle={billingCycle} />
                    ))}
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
                    <p>Fair usage policy applies • Secure payments via UPI, Cards & Net Banking • Cancel anytime</p>
                </div>
            </Wrapper>
        </section>
    );
}

function PricingCard({ plan, billingCycle }: { plan: PricingPlan, billingCycle: BillingCycle }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: plan.highlight ? 0.2 : 0 }}
            className={cn(
                "h-full relative",
                plan.highlight && "md:-mt-4 md:mb-4"
            )}
        >
            {plan.highlight && (
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-xl blur-xl -z-10" />
            )}

            <Card className={cn(
                "h-full flex flex-col border-muted transition-all duration-300",
                plan.highlight ? "border-primary shadow-2xl scale-105 z-10 bg-card" : "bg-card/50 hover:border-primary/50 hover:shadow-lg"
            )}>
                <CardHeader className="pb-4">
                    {plan.badge && (
                        <Badge variant={plan.highlight ? "default" : "secondary"} className="w-fit mb-4">
                            {plan.badge}
                        </Badge>
                    )}
                    <h3 className="text-2xl font-bold">{plan.title}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">
                            {billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                        </span>
                        <span className="text-muted-foreground text-sm font-medium">
                            / {billingCycle === "monthly" ? "month" : "year"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-3">
                        {plan.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className={cn("p-0.5 rounded-full shrink-0 mt-0.5", plan.highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                        {plan.notIncluded?.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2 text-muted-foreground/50">
                                <div className="p-0.5 rounded-full shrink-0 mt-0.5 bg-muted/50">
                                    <X className="w-3 h-3" strokeWidth={3} />
                                </div>
                                <span className="text-sm line-through">{feature}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="pt-4">
                    <Button
                        variant={plan.highlight ? "default" : "outline"}
                        className={cn("w-full", plan.highlight && "shadow-lg shadow-primary/25")}
                        size="lg"
                    >
                        {plan.highlight && <Zap className="w-4 h-4 mr-2" fill="currentColor" />}
                        {plan.cta}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
