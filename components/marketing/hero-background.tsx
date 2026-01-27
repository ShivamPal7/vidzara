"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
    return (
        <div className="absolute inset-0 -z-10 bg-background">
            {/* Base gradient - different for light and dark */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />

            {/* Subtle radial light - top */}
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl opacity-40 dark:opacity-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Subtle radial light - center */}
            <motion.div
                className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/8 dark:bg-accent/3 rounded-full blur-3xl opacity-30 dark:opacity-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
            />

            {/* Faint dot grid pattern - very subtle */}
            <div
                className="absolute inset-0 opacity-40 dark:opacity-30"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '50px 50px',
                    color: 'var(--foreground)',
                    opacity: 0.04
                }}
            />

            {/* Vignette overlay - subtle in light, darker in dark */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, var(--background) 100%)',
                    opacity: 0.4
                }}
            />
        </div>
    );
}
