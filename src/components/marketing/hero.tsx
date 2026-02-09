"use client";

import { Button } from "../../components/ui/button";
import { Link as LinkIcon, Zap, Users, Eye, Zap as ZapIcon, Heart } from "lucide-react";
import Link from "next/link";
import { Wrapper } from "../../components/marketing/wrapper";
import { BackgroundBeams } from "../../components/ui/background-beams";
import { HeroBadge } from "./hero-badge";
import { StatCard } from "./stat-card";
import { motion, Variants } from "framer-motion";
import VideoPlayer from "./video-player";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.4, 0.25, 1],
        },
    },
};

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-28">
            {/* Animated Background */}
            <BackgroundBeams />

            {/* Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[500px] md:h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-accent/10 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Floating Stats - Desktop Only */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-20">
                {/* Top Left */}
                <div className="absolute top-32 left-0 xl:left-36 pointer-events-auto">
                    <StatCard value="10K+" label="Creators Trust Us" icon={Users} delay={0.4} floatingDelay={0} />
                </div>

                {/* Top Right */}
                <div className="absolute top-36 right-0 xl:right-40 pointer-events-auto">
                    <StatCard value="50M+" label="Views Generated" icon={Eye} delay={0.5} floatingDelay={0.5} />
                </div>

                {/* Bottom Left */}
                <div className="absolute top-[30rem] left-0 xl:left-44 pointer-events-auto">
                    <StatCard value="8x" label="Faster Creation" icon={ZapIcon} delay={0.6} floatingDelay={1} />
                </div>

                {/* Bottom Right */}
                <div className="absolute top-[30rem] right-0 xl:right-44 pointer-events-auto">
                    <StatCard value="98%" label="Satisfaction Rate" icon={Heart} delay={0.7} floatingDelay={1.5} />
                </div>
            </div>

            {/* Content Container */}
            <Wrapper className="py-0 md:py-0 relative z-30">
                <motion.div
                    className="flex flex-col items-center text-center space-y-6 md:space-y-8 py-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >

                    {/* Badge */}
                    <motion.div variants={itemVariants}>
                        <HeroBadge />
                    </motion.div>

                    {/* Headline with Gradient */}
                    <motion.div className="space-y-4 max-w-4xl" variants={itemVariants}>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                            The {" "}
                            <span className="px-2 md:px-4 py-1 md:py-1 bg-primary text-primary-foreground rounded-[15px] text-3xl md:text-5xl lg:text-6xl font-bold mt-1.5 md:mt-0">
                                #1 Creator Tool
                            </span>
                            <span className="text-3xl md:text-5xl lg:text-6xl font-bold block mt-1.5 md:mt-4">
                                Create Viral Content <span className="hidden md:inline-block">With AI</span>
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto hidden md:block">
                            Your all-in-one AI toolkit for scripts, SEO, thumbnails, hooks, and content ideas — built to help creators grow 10x faster.
                        </p>

                        <p className="text-md sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto block md:hidden">
                            Your all-in-one AI toolkit for scripts, SEO, thumbnails, hooks, and content ideas.
                        </p>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center gap-4"
                        variants={itemVariants}
                    >
                        <Button
                            size="lg"
                            variant="cta"
                            className="group h-12 md:h-16 px-6 md:px-8 text-lg md:text-2xl font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300 [&_svg]:size-5 md:[&_svg]:size-6!"
                            asChild
                        >
                            <Link href="/login" className="flex items-center gap-3">
                                <Zap className="group-hover:rotate-12 transition-transform" fill="currentColor" />
                                Try Vidzara Now
                                {/* <ArrowRight className="group-hover:translate-x-1 transition-transform" /> */}
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Video Player Section */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(20px)", y: 30 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className={cn("mt-6 lg:mt-20 relative w-full")}
                    >
                        <div className="relative mx-auto max-w-6xl rounded-2xl md:rounded-[44px] border border-foreground/10 bg-foreground/5 backdrop-blur-lg p-2">
                            {/* Top Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/25 blur-[4rem] rounded-full -z-10" />
                            <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                            <div className="absolute top-1/4 left-1/2 -z-10 w-4/5 h-1/3 -translate-x-1/2 -translate-y-1/2 bg-primary/10 blur-[8rem] opacity-50" />

                            <div className="rounded-lg md:rounded-[34px] border border-foreground/10 bg-background overflow-hidden aspect-video">
                                <VideoPlayer videoId="aSte18D2_YE" />
                            </div>
                        </div>

                        <div className="absolute top-0 inset-x-0 w-3/5 mx-auto h-1/10 rounded-full bg-primary blur-[4rem] opacity-40 -z-10"></div>
                    </motion.div>

                    {/* Mobile/Tablet Stats - Hidden on Desktop */}
                    <div className="lg:hidden grid grid-cols-2 gap-4 md:gap-6 pt-8 md:pt-12 max-w-2xl w-full">
                        <StatCard value="10K+" label="Creators Trust Us" icon={Users} delay={0.4} floatingDelay={0} />
                        <StatCard value="50M+" label="Views Generated" icon={Eye} delay={0.5} floatingDelay={0.5} />
                        <StatCard value="8x" label="Faster Creation" icon={ZapIcon} delay={0.6} floatingDelay={1} />
                        <StatCard value="98%" label="Satisfaction Rate" icon={Heart} delay={0.7} floatingDelay={1.5} />
                    </div>
                </motion.div>
            </Wrapper>
        </section>
    );
}
