"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroBadgeProps {
    text?: string;
    icon?: React.ReactNode;
}

export function HeroBadge({
    text = "AI-Powered Creator Tools",
    icon
}: HeroBadgeProps) {
    return (
        <motion.div
            className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-3 backdrop-blur-xl border border-border/50 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:glass-4 transition-all duration-300 cursor-default"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                ease: [0.25, 0.4, 0.25, 1]
            }}
            whileHover={{ scale: 1.05 }}
        >
            {icon || <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary animate-pulse" />}
            <span className="text-xs md:text-sm font-medium bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
                {text}
            </span>
        </motion.div>
    );
}
