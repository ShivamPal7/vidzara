"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
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

export function StatCard({ value, label, icon: Icon, delay = 0, floatingDelay = 0 }: StatCardProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const numericValue = extractNumber(value);
    const suffix = value.replace(/[\d.]+/, '');
    const decimals = value.includes('.') ? 1 : 0;

    // Motion values for drag
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring for return animation
    const springConfig = { stiffness: 100, damping: 15, mass: 0.5 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Animation configuration
    const shouldFloat = isInView && !isDragging && !isMobile;
    const floatingTransition = {
        duration: 4 + floatingDelay,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: floatingDelay * 0.3,
    };

    return (
        <motion.div
            ref={ref}
            style={{ x: springX, y: springY }}
            drag={!isMobile} // Disable drag on mobile to allow scrolling
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => {
                setIsDragging(false);
                // Smoothly return to origin
                x.set(0);
                y.set(0);
            }}
            onDrag={(_, info) => {
                x.set(info.offset.x);
                y.set(info.offset.y);
            }}
            // 'touch-none' removed/replaced on mobile to allow scrolling
            className={`cursor-grab active:cursor-grabbing select-none ${isMobile ? 'touch-auto' : 'touch-none'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: isInView ? 1 : 0,
                scale: isInView ? 1 : 0.9,
            }}
            transition={{
                opacity: { duration: 0.6, delay },
                scale: { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }
            }}
            whileHover={!isDragging && !isMobile ? {
                scale: 1.03,
                transition: { duration: 0.2, type: "spring", stiffness: 400, damping: 15 }
            } : undefined}
            whileTap={!isMobile ? { scale: 0.98, cursor: "grabbing" } : undefined}
        >
            {/* Visual card with floating animation */}
            <motion.div
                className="bg-card/90 dark:bg-card/80 backdrop-blur-lg border border-border/30 dark:border-border/20 rounded-3xl p-4 md:p-6 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300 w-full h-full flex flex-col items-start justify-center will-change-transform"
                animate={shouldFloat ? { y: [-4, 4, -4] } : { y: 0 }}
                // If not floating, we strictly disable transition to prevent drift
                transition={shouldFloat ? floatingTransition : { duration: 0 }}
            >
                {Icon && (
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary mb-3 opacity-60" strokeWidth={2.5} />
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
                            easingFn={(t, b, c, d) => {
                                // Ease out cubic
                                return c * ((t = t / d - 1) * t * t + 1) + b;
                            }}
                        />
                    ) : (
                        `0${suffix}`
                    )}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium leading-tight text-left">
                    {label}
                </div>
            </motion.div>
        </motion.div>
    );
}
