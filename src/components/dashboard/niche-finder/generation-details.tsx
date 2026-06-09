"use client";

import { useState } from "react";
import { NicheGeneration, NicheFinderInput, NicheFinderOutput } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  IconBulb,
  IconCoin,
  IconSparkles,
  IconAward,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconTarget,
  IconUsers,
  IconSearch,
  IconFlame,
  IconArrowLeft,
  IconCoins,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface GenerationDetailsProps {
  generation: NicheGeneration;
  onBack?: () => void;
}

function ExpandableText({ text, maxLength = 120 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!text || text.length <= maxLength) {
    return <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-outfit">{text}</div>;
  }
  
  return (
    <div className="space-y-1.5">
      <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-outfit">
        {expanded ? text : `${text.slice(0, maxLength)}...`}
      </div>
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="text-primary text-xs font-semibold hover:underline block"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

function ScoreProgress({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1 text-xs font-outfit">
      <div className="flex justify-between font-medium">
        <span className="text-muted-foreground/80">{label}</span>
        <span className="text-foreground font-semibold">{score}/100</span>
      </div>
      <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden border border-border/10">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-indigo-500" : "bg-amber-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function GenerationDetails({ generation, onBack }: GenerationDetailsProps) {
  const router = useRouter();
  const input = generation.input as any;
  const output = generation.output as NicheFinderOutput;

  const getInterestText = (input: any) => {
    if (!input) return "Micro-Niche Report";
    if (input.interest) return input.interest;
    if (input.category === "Other") {
      return input.customInterest || "Custom Interest";
    }
    let text = input.category || "Micro-Niche Report";
    if (input.subCategory) text += ` - ${input.subCategory}`;
    if (input.subSubCategory) text += ` - ${input.subSubCategory}`;
    return text;
  };

  const interestText = getInterestText(input);
  const country = input?.country || "Global";
  const skillLevel = input?.skillLevel || "Beginner";
  const contentType = input?.contentType || "Shorts & Reels";

  const getCompetitionBadge = (level: "Low" | "Medium" | "High" | string) => {
    switch (level) {
      case "Low":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0 font-outfit"
          >
            Low Competition
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0 font-outfit"
          >
            Medium Competition
          </Badge>
        );
      case "High":
        return (
          <Badge
            variant="outline"
            className="border-rose-500/30 text-rose-500 bg-rose-500/10 font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0 font-outfit"
          >
            High Competition
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0 font-outfit">
            {level}
          </Badge>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-6 sm:space-y-8 font-outfit">
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-2"
      >
        {/* Eyebrow row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            <IconSparkles className="h-3 w-3 text-primary animate-pulse" />
            <span>Niche Discovery Results</span>
          </div>
          <button
            onClick={() => { if (onBack) onBack(); else router.push("/dashboard/analyze/niche-finder"); }}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2 shrink-0 font-medium"
          >
            Try another niche
          </button>
        </div>

        {/* Topic title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-outfit leading-tight">
          {interestText}
        </h1>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            📍 {country} Market
          </Badge>
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-semibold bg-muted/70">
            {skillLevel} level
          </Badge>
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-semibold bg-muted/70">
            {contentType}
          </Badge>
        </div>
      </motion.div>

      {/* FINAL RECOMMENDATION BANNER (Point 7) */}
      {output?.finalRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent border border-primary/25 shadow-md flex flex-col md:flex-row items-start gap-5"
        >
          <div className="flex items-center justify-center p-3.5 rounded-2xl bg-primary/15 text-primary border border-primary/30 shrink-0">
            <IconAward className="h-7 w-7" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-0.5">Primary Recommendation</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground leading-tight">
                Based on your answers, your best niche is <span className="text-primary">"{output.finalRecommendation.bestNiche}"</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
              {output.finalRecommendation.whyRightForYou}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-background/30 border border-border/40 text-xs flex flex-col justify-center gap-0.5">
                <span className="text-muted-foreground font-medium">Competition Saturation</span>
                <span className="text-sm font-bold text-foreground">{output.finalRecommendation.competition}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-background/30 border border-border/40 text-xs flex flex-col justify-center gap-0.5">
                <span className="text-muted-foreground font-medium">Growth Outlook</span>
                <span className="text-sm font-bold text-foreground">{output.finalRecommendation.growthPotential}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-background/30 border border-border/40 text-xs flex flex-col justify-center gap-0.5">
                <span className="text-muted-foreground font-medium">Monetization Fit</span>
                <span className="text-sm font-bold text-foreground">{output.finalRecommendation.monetizationPotential}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Niches Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-stretch">
        {output?.niches?.map((niche, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="flex h-full"
          >
            <Card className="py-0 gap-0 bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/40 hover:bg-primary/[0.01] transition-all duration-300 flex flex-col overflow-hidden rounded-2xl w-full shadow-sm">
              <CardHeader className="space-y-3 p-4 pb-3 sm:px-6 sm:pt-6 sm:pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="font-outfit font-bold px-2.5 py-0.5 text-[9px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                    Niche Option {idx + 1}
                  </Badge>
                  {getCompetitionBadge(niche.competitionLevel)}
                </div>
                <CardTitle className="text-base sm:text-lg leading-snug font-outfit font-extrabold text-foreground group-hover:text-primary transition-colors">
                  {niche.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* AI Metrics */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-background/40 border border-border/40 text-center">
                      <span className="text-[9px] uppercase text-muted-foreground font-semibold leading-none mb-1">Virality</span>
                      <span className="text-sm font-bold text-emerald-500">{niche.viralScore}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-background/40 border border-border/40 text-center">
                      <span className="text-[9px] uppercase text-muted-foreground font-semibold leading-none mb-1">Revenue</span>
                      <span className="text-sm font-bold text-amber-500">{niche.revenueScore}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-background/40 border border-border/40 text-center">
                      <span className="text-[9px] uppercase text-muted-foreground font-semibold leading-none mb-1">Saturation</span>
                      <span className="text-sm font-bold text-rose-500">{niche.competitionScore}</span>
                    </div>
                  </div>

                  {/* AUDIENCE METRICS (Point 5) */}
                  {niche.audienceMetrics && (
                    <div className="p-3 rounded-xl bg-background/30 border border-border/30 space-y-2">
                      <p className="text-[10px] font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1">
                        <IconUsers className="h-3.5 w-3.5 text-primary" />
                        Audience Dynamics
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
                        <div className="flex justify-between border-b border-border/20 pb-0.5">
                          <span className="text-muted-foreground">Audience Size</span>
                          <span className="font-semibold text-foreground text-right">{niche.audienceMetrics.audienceSize}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/20 pb-0.5">
                          <span className="text-muted-foreground">Search Demand</span>
                          <span className="font-semibold text-foreground text-right">{niche.audienceMetrics.searchDemand}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/20 pb-0.5">
                          <span className="text-muted-foreground">Growth Trend</span>
                          <span className="font-semibold text-foreground text-right">{niche.audienceMetrics.growthTrend}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/20 pb-0.5">
                          <span className="text-muted-foreground">Viral Potential</span>
                          <span className="font-semibold text-foreground text-right">{niche.audienceMetrics.viralPotential}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MONETIZATION SCORES (Point 6) */}
                  {niche.monetizationScores && (
                    <div className="p-3 rounded-xl bg-background/30 border border-border/30 space-y-2">
                      <p className="text-[10px] font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1">
                        <IconCoins className="h-3.5 w-3.5 text-amber-500" />
                        Monetization Breakdown
                      </p>
                      <div className="space-y-1.5 pt-0.5">
                        <ScoreProgress label="AdSense CPM" score={niche.monetizationScores.adsense} />
                        <ScoreProgress label="Affiliate Programs" score={niche.monetizationScores.affiliate} />
                        <ScoreProgress label="Brand Sponsors" score={niche.monetizationScores.sponsorship} />
                        <ScoreProgress label="Digital Products" score={niche.monetizationScores.digitalProduct} />
                        <ScoreProgress label="Coaching / Courses" score={niche.monetizationScores.courseSelling} />
                      </div>
                    </div>
                  )}

                  {/* Content Strategy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs tracking-tight">
                      <div className="p-0.5 rounded bg-indigo-500/15 text-indigo-500">
                        <IconBulb className="h-4.5 w-4.5" />
                      </div>
                      Content & Video Strategy
                    </div>
                    <div className="p-3 rounded-xl bg-background/25 border border-border/30">
                      <ExpandableText text={niche.contentStrategy} maxLength={110} />
                    </div>
                  </div>
                </div>

                {/* Monetization Channels Description */}
                <div className="space-y-1.5 pt-2 border-t border-border/20">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs tracking-tight">
                    <div className="p-0.5 rounded bg-amber-500/15 text-amber-500">
                      <IconCoin className="h-4.5 w-4.5" />
                    </div>
                    Revenue Channels Summary
                  </div>
                  <div className="p-3 rounded-xl bg-background/25 border border-border/30">
                    <ExpandableText text={niche.monetizationPotential} maxLength={100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* MARKET TRENDS ANALYSIS (Point 3) */}
      {output?.marketTrends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-4 pt-4"
        >
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <IconTrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground font-outfit">
              Latest Market Trend Analysis (2026)
            </h2>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <Card className="py-0 gap-0 bg-emerald-500/[0.02] border-emerald-500/20 hover:border-emerald-500/35 transition-colors rounded-2xl shadow-sm">
              <CardHeader className="p-3 pb-2 sm:px-4 sm:pt-4 sm:pb-2 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
                  <IconTrendingUp className="h-4 w-4" />
                  <span>Growing Niches</span>
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-outfit">Grow Speed</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:px-4 sm:pb-4 sm:pt-0">
                <ul className="space-y-1.5 text-xs text-foreground/80 list-disc list-inside">
                  {output.marketTrends.growingNiches2026?.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="py-0 gap-0 bg-indigo-500/[0.02] border-indigo-500/20 hover:border-indigo-500/35 transition-colors rounded-2xl shadow-sm">
              <CardHeader className="p-3 pb-2 sm:px-4 sm:pt-4 sm:pb-2 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-500 font-bold text-xs">
                  <IconSparkles className="h-4 w-4" />
                  <span>Emerging Trends</span>
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-outfit">New format/style</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:px-4 sm:pb-4 sm:pt-0">
                <ul className="space-y-1.5 text-xs text-foreground/80 list-disc list-inside">
                  {output.marketTrends.newTrends?.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="py-0 gap-0 bg-rose-500/[0.02] border-rose-500/20 hover:border-rose-500/35 transition-colors rounded-2xl shadow-sm">
              <CardHeader className="p-3 pb-2 sm:px-4 sm:pt-4 sm:pb-2 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs">
                  <IconAlertTriangle className="h-4 w-4" />
                  <span>Saturated Areas</span>
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-outfit">Avoid/Over-Saturated</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:px-4 sm:pb-4 sm:pt-0">
                <ul className="space-y-1.5 text-xs text-foreground/80 list-disc list-inside">
                  {output.marketTrends.saturatedNiches?.map((item, idx) => (
                    <li key={idx} className="leading-relaxed text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="py-0 gap-0 bg-amber-500/[0.02] border-amber-500/20 hover:border-amber-500/35 transition-colors rounded-2xl shadow-sm">
              <CardHeader className="p-3 pb-2 sm:px-4 sm:pt-4 sm:pb-2 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                  <IconTarget className="h-4 w-4" />
                  <span>Opportunity Zone</span>
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-outfit">Underserved Sweet Spot</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:px-4 sm:pb-4 sm:pt-0">
                <ul className="space-y-1.5 text-xs text-foreground/80 list-disc list-inside">
                  {output.marketTrends.opportunityZone?.map((item, idx) => (
                    <li key={idx} className="leading-relaxed font-semibold">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
