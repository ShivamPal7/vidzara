"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";

interface StatCardProps {
    value: string;
    label: string;
    icon?: LucideIcon;
    delay?: number;
    floatingDelay?: number;
}

// Extract number from value string for count-up
function extractNumber(value: string): number {
    const match = value.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

export function StatCard({ value, label, icon: Icon, delay = 0 }: StatCardProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const numericValue = extractNumber(value);
    const suffix = value.replace(/[\d.]+/, '');
    const decimals = value.includes('.') ? 1 : 0;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
                opacity: isInView ? 1 : 0,
                scale: isInView ? 1 : 0.9,
                y: isInView ? 0 : 20,
            }}
            transition={{
                duration: 0.5,
                delay,
                ease: "easeOut"
            }}
            className="w-full h-full"
        >
            {/* Visual card - Static, no floating or drag */}
            <div
                className="bg-card/95 dark:bg-card/80 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 w-full h-full flex flex-col items-start justify-center group"
            >
                {Icon && (
                    <div className="bg-primary/10 p-2 rounded-xl mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" strokeWidth={2.5} />
                    </div>
                )}
                <div className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2 tabular-nums text-left">
                    {isInView ? (
                        <CountUp
                            start={0}
                            end={numericValue}
                            duration={2}
                            decimals={decimals}
                            decimal="."
                            suffix={suffix}
                            useEasing={true}
                        />
                    ) : (
                        `0${suffix}`
                    )}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium leading-tight text-left">
                    {label}
                </div>
            </div>
        </motion.div>
    );
}
