"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wrapper } from "@/components/marketing/wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Zap,
    ChevronRight,
    Type,
    FileText,
    Palette,
    Search,
    ShieldCheck,
    TrendingUp,
    Users,
    BarChart3,
    Check
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

export function Features() {
    return (
        <section className="bg-background relative overflow-hidden" id="features">
            {/* Top Fade from Workflows */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background via-background/80 to-transparent z-20 pointer-events-none" />

            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2" />
            </div>

            <Wrapper className="relative z-30">
                {/* Header */}
                <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-semibold mb-4 tracking-tight">Vidzara has everything you need go viral</h2>
                        <p className="text-muted-foreground text-lg md:text-xl">
                            All the AI tools creators need to create, optimize, and grow — in one platform
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="hidden md:block"
                    >
                        <Button
                            size="lg"
                            variant="cta"
                            className="group h-12 px-6 md:px-4 text-lg md:text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                            asChild
                        >
                            <Link href="/login" className="flex items-center gap-2">
                                <Zap className="group-hover:rotate-12 transition-transform" fill="currentColor" />
                                Try Vidzara Now
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" strokeWidth={4} stroke="currentColor" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* 3x2 Grid (First 6 Features) */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <FeatureCard
                        title="Viral Titles & Hooks"
                        description="Generate scroll-stopping titles and fix weak hooks before you publish."
                        preview={<ViralTitlesPreview />}
                    />
                    <FeatureCard
                        title="AI Script Writer"
                        description="Write high-retention scripts for long videos, Shorts, and Reels."
                        preview={<ScriptWriterPreview />}
                    />
                    <FeatureCard
                        title="Thumbnail Concepts"
                        description="Get click-optimized thumbnail text, emotions, layouts, and color ideas."
                        preview={<ThumbnailPreview />}
                    />
                    <FeatureCard
                        title="SEO & Metadata Optimizer"
                        description="Rank higher with platform-optimized titles, descriptions, and tags."
                        preview={<SeoPreview />}
                    />
                    <FeatureCard
                        title="Content Safety & Clickbait"
                        description="Detect policy risks, clickbait issues, and get safe rewrites."
                        preview={<SafetyPreview />}
                    />
                    <FeatureCard
                        title="Topic & Outlier Finder"
                        description="Discover viral topics and unexpected high-performing content in your niche."
                        preview={<TopicPreview />}
                    />
                </motion.div>

                {/* 2x1 Grid (Wide Features) */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <FeatureCard
                        title="Competitor Analysis"
                        description="Break down top creators in your niche to see what’s working and why."
                        preview={<CompetitorPreview />}
                        className="md:col-span-1"
                    />
                    <FeatureCard
                        title="Creator Growth Dashboard"
                        description="Track your growth direction, consistency score, content mix, and next steps."
                        preview={<GrowthPreview />}
                        className="md:col-span-1"
                    />
                </motion.div>

                {/* Mobile CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center md:hidden"
                >
                    <Button
                        size="lg"
                        variant="cta"
                        className="w-full group h-12 px-6 text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                        asChild
                    >
                        <Link href="/login" className="flex items-center justify-center gap-2">
                            <Zap className="group-hover:rotate-12 transition-transform" fill="currentColor" />
                            Try Vidzara Now
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" strokeWidth={4} stroke="currentColor" />
                        </Link>
                    </Button>
                </motion.div>
            </Wrapper>
        </section>
    );
}

function FeatureCard({ title, description, preview, className }: { title: string, description: string, preview: React.ReactNode, className?: string }) {
    return (
        <motion.div variants={itemVariants} className={cn("h-full", className)}>
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-lg flex flex-col group py-0">
                <div className="p-6 pb-2">
                    <h3 className="text-xl font-semibold mb-1">{title}</h3>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <div className="flex-1 min-h-[200px] bg-muted/30 relative overflow-hidden mt-4 mx-4 mb-4 rounded-lg border border-border/50 group-hover:border-primary/10 transition-colors">
                    <div className="absolute inset-0 p-4">
                        {preview}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// --- UI Previews ---

function ViralTitlesPreview() {
    return (
        <div className="flex flex-col gap-3">
            <div className="bg-background rounded-md p-3 shadow-sm border border-border/50 flex items-start gap-3">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded shrink-0">
                    <Type className="w-4 h-4" />
                </div>
                <div>
                    <div className="h-2 w-20 bg-muted rounded-full mb-2" />
                    <p className="text-xs font-medium">"I Survived 100 Days..."</p>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] h-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">98/100 Viral</Badge>
                    </div>
                </div>
            </div>
            <div className="bg-background rounded-md p-3 shadow-sm border border-border/50 flex items-start gap-3 opacity-60">
                <div className="p-1.5 bg-muted text-muted-foreground rounded shrink-0">
                    <Type className="w-4 h-4" />
                </div>
                <div>
                    <div className="h-2 w-16 bg-muted rounded-full mb-2" />
                    <div className="h-2 w-32 bg-muted/50 rounded-full" />
                </div>
            </div>
        </div>
    );
}

function ScriptWriterPreview() {
    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-6 px-2 bg-primary/10 rounded-full text-[10px] flex items-center text-primary font-medium">Script Gen</div>
                <div className="h-6 w-6 rounded-full bg-muted ml-auto" />
            </div>
            <div className="bg-background rounded-lg p-3 border border-border/50 shadow-sm flex-1 text-[10px] leading-relaxed relative overflow-hidden">
                <p className="font-semibold text-foreground mb-1">Intro (0:00 - 0:15)</p>
                <p className="text-muted-foreground">"Stop using generic hooks. Instead, try the 'Pattern Interrupt' method used by the top 1% of creators..."</p>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent" />
            </div>
            <div className="h-8 bg-muted/50 rounded-md border border-border/50 flex items-center px-3 gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <div className="h-2 w-24 bg-muted-foreground/20 rounded-full" />
            </div>
        </div>
    );
}

function ThumbnailPreview() {
    return (
        <div className="grid grid-cols-2 gap-2 h-full">
            <div className="bg-background border border-border/50 rounded-lg p-2 flex flex-col justify-between">
                <div className="aspect-video bg-muted rounded-md mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-yellow-400/20" />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-lg rotate-[-5deg] tracking-tighter uppercase text-yellow-600">Shocking!</div>
                </div>
                <div className="space-y-1">
                    <div className="h-1.5 w-full bg-muted rounded-full" />
                    <div className="h-1.5 w-2/3 bg-muted rounded-full" />
                </div>
            </div>
            <div className="bg-background border border-border/50 rounded-lg p-2 flex flex-col justify-between">
                <div className="aspect-video bg-muted rounded-md mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-400/20" />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-lg rotate-[5deg] tracking-tighter uppercase text-red-600">Don't Do This</div>
                </div>
                <div className="space-y-1">
                    <div className="h-1.5 w-full bg-muted rounded-full" />
                    <div className="h-1.5 w-2/3 bg-muted rounded-full" />
                </div>
            </div>
        </div>
    )
}

function SeoPreview() {
    return (
        <div className="flex flex-col gap-3 h-full justify-center">
            <div className="flex flex-wrap gap-1.5">
                {["#viral", "#growth", "#strategy", "#2025"].map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-md font-medium">
                        {tag}
                    </span>
                ))}
            </div>
            <div className="flex items-center gap-3 bg-background border border-border/50 p-2 rounded-lg">
                <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="text-green-500" strokeDasharray="95, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    <span className="text-[10px] font-bold absolute">95</span>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-medium">SEO Score</p>
                    <p className="text-[10px] text-muted-foreground">Excellent rankability</p>
                </div>
            </div>
        </div>
    )
}

function SafetyPreview() {
    return (
        <div className="h-full flex flex-col items-center justify-center py-2">
            <div className="relative mb-3">
                <ShieldCheck className="w-12 h-12 text-primary" strokeWidth={1.5} />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <div className="bg-green-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                </div>
            </div>
            <div className="w-full space-y-2 max-w-[180px]">
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Policy Check</span>
                    <span className="text-green-500 font-medium">Passed</span>
                </div>
                <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-500 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Clickbait Risk</span>
                    <span className="text-amber-500 font-medium">Low</span>
                </div>
                <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full w-[20%] bg-amber-500 rounded-full" />
                </div>
            </div>
        </div>
    )
}

function TopicPreview() {
    return (
        <div className="h-full relative overflow-hidden flex items-center justify-center">
            {/* Simple bubble chart representation */}
            <div className="absolute top-4 left-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-[8px] font-medium text-primary animate-pulse">
                Trending
            </div>
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-primary shadow-sm border border-primary/20 z-10">
                Topic A
            </div>
            <div className="absolute bottom-4 right-8 w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-[9px] font-medium text-blue-500 border border-blue-500/10">
                Topic B
            </div>
            <div className="absolute top-8 right-4 w-8 h-8 bg-amber-500/10 rounded-full" />
        </div>
    )
}

function CompetitorPreview() {
    return (
        <div className="w-full h-full flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground font-medium pb-1 border-b border-border/50">
                <span>Creator</span>
                <span>Views/Vid</span>
                <span>Strategy</span>
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-muted" />
                        <span className="text-xs font-medium">Creator {i}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{100 - i * 15}K</span>
                    <div className="flex">
                        <Badge variant="outline" className="text-[8px] h-4 px-1">{i === 1 ? "Storytelling" : i === 2 ? "Fast Cuts" : "Shorts"}</Badge>
                    </div>
                </div>
            ))}
        </div>
    )
}

function GrowthPreview() {
    return (
        <div className="w-full h-full flex flex-row gap-4">
            <div className="flex-1 flex flex-col justify-end gap-1">
                <div className="flex items-end justify-between gap-1 h-32">
                    <div className="w-full bg-primary/20 rounded-t-sm h-[40%]" />
                    <div className="w-full bg-primary/40 rounded-t-sm h-[60%]" />
                    <div className="w-full bg-primary/60 rounded-t-sm h-[50%]" />
                    <div className="w-full bg-primary/80 rounded-t-sm h-[85%]" />
                    <div className="w-full bg-primary rounded-t-sm h-[100%] relative group">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            +124%
                        </div>
                    </div>
                </div>
                <div className="h-px bg-border w-full" />
            </div>
            <div className="w-1/3 flex flex-col gap-2 justify-center">
                <div className="bg-background border border-border/50 p-2 rounded-md">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Consistency</p>
                    <p className="text-sm font-bold text-green-500">A+</p>
                </div>
                <div className="bg-background border border-border/50 p-2 rounded-md">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Next Goal</p>
                    <p className="text-xs font-semibold">10K Subs</p>
                </div>
            </div>
        </div>
    )
}
