"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
    Upload,
    Link as LinkIcon,
    MessageSquare,
    Video,
    Wand2,
    AlertTriangle,
    FileText,
    Smartphone,
    Zap,
    CheckCircle2,
    TrendingUp,
    Search,
    ShieldCheck,
    Film,
    Play,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { Wrapper } from "@/components/marketing/wrapper";
import Link from "next/link";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

export function Workflows() {
    return (
        <section className="bg-background overflow-hidden relative pb-12" id="workflows">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2" />
            </div>

            <Wrapper className="relative z-30">
                <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-semibold mb-4 tracking-tight">Workflows To Go Viral</h2>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
                            See how creators turn raw ideas into viral-ready content using Vidzara.
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
                                Make an account
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" strokeWidth={4} stroke="currentColor" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Step 1: Input */}
                    <StepCard
                        step="1"
                        title="Add Your Content"
                        description="Upload a video, paste a link, or start from an idea."
                        mainContent={<InputSim />}
                    />

                    {/* Step 2: AI Intelligence */}
                    <StepCard
                        step="2"
                        title="Choose AI Tools"
                        description="Run only what you need. Stack tools or use one."
                        mainContent={<AiToolsSelect />}
                    />

                    {/* Step 3: Output */}
                    <StepCard
                        step="3"
                        title="Generate & Optimize"
                        description="Optimized content, ready to post — in seconds."
                        mainContent={<OutputResult />}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 text-center md:hidden relative z-30"
                >
                    <Button
                        size="lg"
                        variant="cta"
                        className="group h-12 md:h-16 px-6 md:px-8 text-lg md:text-2xl font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300 [&_svg]:size-5 md:[&_svg]:size-6!"
                        asChild
                    >
                        <Link href="/login" className="flex items-center gap-3">
                            <Zap className="group-hover:rotate-12 transition-transform" fill="currentColor" />
                            Make an account
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </motion.div>

            </Wrapper>

            {/* Bottom Fade & Divider connection to Features */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background via-background/80 to-transparent z-20 pointer-events-none" />
            {/* <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent z-30" /> */}
        </section >
    );
}

function StepCard({ step, title, description, mainContent }: { step: string, title: string, description: string, mainContent: React.ReactNode }) {
    return (
        <motion.div variants={itemVariants} className="h-full">
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/20 transition-colors duration-300 flex flex-col py-0">
                <div className="h-64 bg-muted/30 border-b border-border/50 relative group overflow-hidden">
                    {mainContent}
                </div>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                            {step}
                        </div>
                        <h3 className="text-xl font-semibold">{title}</h3>
                    </div>
                    <p className="text-muted-foreground pl-9">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Visual Components for inside the cards

function InputSim() {
    return (
        <div className="w-full h-full p-6 flex flex-col justify-center items-center relative">
            <div className="absolute inset-0 bg-grid-white/5 mask-[linear-gradient(0deg,white,transparent)]" />

            <motion.div
                className="w-full max-w-[240px] bg-background border border-border rounded-xl shadow-sm p-4 relative z-10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="flex items-center gap-2 mb-3 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    <Upload className="w-3 h-3" /> Input Source
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-colors cursor-pointer group/item">
                        <div className="bg-red-500/10 text-red-500 p-1.5 rounded-md">
                            <Video className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Original Video</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-colors cursor-pointer group/item">
                        <div className="bg-blue-500/10 text-blue-500 p-1.5 rounded-md">
                            <LinkIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">YouTube / TikTok Link</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-colors cursor-pointer group/item">
                        <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-md">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Topic or Idea</span>
                    </div>
                </div>

                {/* Floating preview badge */}
                <motion.div
                    className="absolute -top-3 -right-8 bg-card border shadow-lg p-1.5 rounded-lg flex items-center gap-1.5"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                    <div className="w-6 h-6 rounded bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&q=80')" }} />
                    <div className="text-xs font-semibold leading-tight">
                        New Project
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

function AiToolsSelect() {
    const [tools, setTools] = useState([
        { name: "Viral Title Gen", icon: CheckCircle2, active: true },
        { name: "Hook Failure Detector", icon: AlertTriangle, active: true },
        { name: "Script Writer", icon: FileText, active: true },
        { name: "SEO & Tags", icon: Search, active: false },
        { name: "Thumbnail Concept", icon: Film, active: false },
        { name: "Safety Check", icon: ShieldCheck, active: false },
    ]);

    const toggleTool = (index: number) => {
        setTools(prev => prev.map((t, i) => i === index ? { ...t, active: !t.active } : t));
    };

    return (
        <div className="w-full h-full p-6 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-primary/5 opacity-50" />

            <div className="grid grid-cols-2 gap-2 w-full max-w-[280px] relative z-10">
                {tools.map((tool, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => toggleTool(index)}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all duration-300",
                            tool.active
                                ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                                : "bg-background/50 border-border/50 text-muted-foreground hover:bg-muted"
                        )}
                        whileTap={{ scale: 0.98 }}
                    >
                        <tool.icon className={cn("w-3.5 h-3.5 transition-colors", tool.active ? "text-primary" : "text-muted-foreground")} />
                        <span className="truncate">{tool.name}</span>
                        {tool.active && <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function OutputResult() {
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setComplete(true), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative p-6">
            {!complete ? (
                <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-primary"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                style={{ rotate: -90, transformOrigin: "50% 50%" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Wand2 className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                    </div>
                    <p className="text-sm font-medium animate-pulse text-muted-foreground">Optimizing Content...</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[240px] bg-background border border-border rounded-xl shadow-lg p-4 relative"
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                    </div>
                    <div className="aspect-video bg-muted rounded-lg mb-3 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=1280&h=720&dpr=2&q=80')" }} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white fill-current" />
                        </div>

                        {/* Stats Overlay */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                            <Badge variant="secondary" className="h-5 text-[10px] bg-black/50 text-white backdrop-blur-md border-none">
                                <TrendingUp className="w-3 h-3 mr-1 text-green-400" /> 98% Score
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-primary/20 rounded-full" />
                        <div className="h-2 w-1/2 bg-muted rounded-full" />
                    </div>
                </motion.div>
            )}
        </div>
    )
}
