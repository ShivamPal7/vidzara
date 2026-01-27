"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Zap, Users, Eye, Zap as ZapIcon, Heart } from "lucide-react";
import Link from "next/link";
import { Wrapper } from "@/components/marketing/wrapper";
import { HeroBackground } from "./hero-background";
import { HeroBadge } from "./hero-badge";
import { StatCard } from "./stat-card";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
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
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden pt-16 md:pt-28">
            {/* Animated Background */}
            <HeroBackground />

            {/* Floating Stats - Desktop Only */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-20">
                {/* Top Left */}
                <div className="absolute top-32 left-0 xl:left-20 pointer-events-auto">
                    <StatCard value="10K+" label="Creators Trust Us" icon={Users} delay={0.4} floatingDelay={0} />
                </div>

                {/* Top Right */}
                <div className="absolute top-36 right-0 xl:right-20 pointer-events-auto">
                    <StatCard value="50M+" label="Views Generated" icon={Eye} delay={0.5} floatingDelay={0.5} />
                </div>

                {/* Bottom Left */}
                <div className="absolute bottom-20 left-0 xl:left-32 pointer-events-auto">
                    <StatCard value="8x" label="Faster Creation" icon={ZapIcon} delay={0.6} floatingDelay={1} />
                </div>

                {/* Bottom Right */}
                <div className="absolute bottom-12 right-0 xl:right-32 pointer-events-auto">
                    <StatCard value="98%" label="Satisfaction Rate" icon={Heart} delay={0.7} floatingDelay={1.5} />
                </div>
            </div>

            {/* Content Container */}
            <Wrapper className="py-0 md:py-0 relative z-10">
                <motion.div
                    className="flex flex-col items-center text-center space-y-8 py-12"
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
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                            Turn Ideas Into{" "}
                            <span className="inline-block px-4 md:px-4 py-1 md:py-2 bg-primary text-primary-foreground rounded-sm text-4xl md:text-5xl lg:text-6xl font-bold mt-1.5 md:mt-0">
                                Viral Content
                            </span>
                            <span className="text-3xl md:text-5xl lg:text-6xl font-bold block mt-1.5 md:mt-0.5">
                                Powered by Vidzara
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                            Your all-in-one AI toolkit for scripts, SEO, thumbnails, hooks, and content ideas — built to help creators grow 10x faster.
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
