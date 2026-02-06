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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-3 backdrop-blur-xl border border-border/50 shadow-lg hover:glass-4 transition-all duration-300 cursor-default"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                ease: [0.25, 0.4, 0.25, 1]
            }}
            whileHover={{ scale: 1.05 }}
        >
            {icon || <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
            <span className="text-sm font-medium bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
                {text}
            </span>
        </motion.div>
    );
}
