"use client";

import { useState } from "react";
import { NicheGeneration, NicheFinderInput, NicheFinderOutput } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  IconBulb,
  IconCoin,
  IconSparkles,
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
    return <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{text}</div>;
  }
  
  return (
    <div className="space-y-1.5">
      <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
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

export function GenerationDetails({ generation, onBack }: GenerationDetailsProps) {
  const router = useRouter();
  const input = generation.input as NicheFinderInput;
  const output = generation.output as NicheFinderOutput;

  const interestText = input?.interest || "Micro-Niche Report";
  const skillLevel = input?.skillLevel || "Beginner";
  const contentType = input?.contentType || "Shorts & Reels";

  const getCompetitionBadge = (level: "Low" | "Medium" | "High" | string) => {
    switch (level) {
      case "Low":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0"
          >
            Low Competition
          </Badge>
        );
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0"
          >
            Medium Competition
          </Badge>
        );
      case "High":
        return (
          <Badge
            variant="outline"
            className="border-rose-500/30 text-rose-500 bg-rose-500/10 font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0"
          >
            High Competition
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-bold px-2.5 py-0.5 text-xs rounded-full shrink-0">
            {level}
          </Badge>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-6 sm:space-y-8">
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-2"
      >
        {/* Eyebrow row: label + reset link on same line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            <IconSparkles className="h-3 w-3 text-primary" />
            <span>Niche Discovery Results</span>
          </div>
          <button
            onClick={() => { if (onBack) onBack(); else router.push("/dashboard/analyze/niche-finder"); }}
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2 shrink-0"
          >
            Try again
          </button>
        </div>

        {/* Topic title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-outfit leading-tight">
          {interestText}
        </h1>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium bg-muted/70">
            {skillLevel}
          </Badge>
          <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium bg-muted/70">
            {contentType}
          </Badge>
        </div>
      </motion.div>

      {/* Intro Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-indigo-500/5 to-transparent border border-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <IconSparkles className="h-4 w-4" />
            <span>AI Discovery Complete</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground font-outfit">
            Discover Your Target Micro-Niches
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Based on your expertise and selected content formats, our engine mapped out 3 high-leverage micro-niches. Leverage low barriers to entry and direct monetization programs to accelerate your content growth.
          </p>
        </div>
      </motion.div>

      {/* Niches Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {output?.niches?.map((niche, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="flex h-full"
          >
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 flex flex-col overflow-hidden rounded-2xl w-full shadow-sm">
              <div>
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="font-outfit font-semibold px-2 py-0.5 text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                      Niche {idx + 1}
                    </Badge>
                    {getCompetitionBadge(niche.competitionLevel)}
                  </div>
                  <CardTitle className="text-lg sm:text-xl leading-snug font-outfit font-bold text-foreground group-hover:text-primary transition-colors">
                    {niche.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* AI Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-background/50 border border-border/40">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold text-center leading-tight">Virality</span>
                      <span className="text-sm font-bold text-emerald-500">{niche.viralScore || 92}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-background/50 border border-border/40">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold text-center leading-tight">Revenue</span>
                      <span className="text-sm font-bold text-amber-500">{niche.revenueScore || 88}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-background/50 border border-border/40">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold text-center leading-tight">Competition</span>
                      <span className="text-sm font-bold text-foreground">{niche.competitionScore || 64}</span>
                    </div>
                  </div>
                  {/* Monetization */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs sm:text-sm tracking-tight font-outfit">
                      <div className="p-1 rounded-md bg-amber-500/10 text-amber-500">
                        <IconCoin className="h-4 w-4" />
                      </div>
                      Monetization Channels
                    </div>
                    <div className="p-3.5 rounded-xl bg-background/40 border border-border/40">
                      <ExpandableText text={niche.monetizationPotential} maxLength={100} />
                    </div>
                  </div>

                  {/* Content Strategy */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs sm:text-sm tracking-tight font-outfit">
                      <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-500">
                        <IconBulb className="h-4 w-4" />
                      </div>
                      Content & Video Strategy
                    </div>
                    <div className="p-3.5 rounded-xl bg-background/40 border border-border/40">
                      <ExpandableText text={niche.contentStrategy} maxLength={120} />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
