"use client";

import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

export interface BackgroundBeamsProps {
    className?: string;
}

const pathData = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-358 -213C-358 -213 -290 192 174 319C638 446 706 851 706 851",
    "M-336 -237C-336 -237 -268 168 196 295C660 422 728 827 728 827",
    "M-314 -261C-314 -261 -246 144 218 271C682 398 750 803 750 803",
    "M-292 -285C-292 -285 -224 120 240 247C704 374 772 779 772 779",
    "M-270 -309C-270 -309 -202 96 262 223C726 350 794 755 794 755",
    "M-248 -333C-248 -333 -180 72 284 199C748 326 816 731 816 731",
    "M-226 -357C-226 -357 -158 48 306 175C770 302 838 707 838 707",
    "M-204 -381C-204 -381 -136 24 328 151C792 278 860 683 860 683",
    "M-182 -405C-182 -405 -114 0 350 127C814 254 882 659 882 659",
];

// Pre-calculated animation values for each path
const animations = pathData.map((_, i) => ({
    duration: 4 + (i % 5) * 0.8,
    delay: i * 0.15,
    initialProgress: (i * 5) % 100,
}));

export const BackgroundBeams = React.memo(({ className }: BackgroundBeamsProps) => {
    return (
        <div className={cn("pointer-events-none absolute inset-0 h-full w-full mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]", className)}>
            <svg
                className="absolute h-full w-full"
                fill="none"
                viewBox="0 0 696 316"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Static faint paths for depth */}
                <g opacity="0.03">
                    {pathData.map((d, i) => (
                        <path key={`static-${i}`} d={d} stroke="white" strokeWidth="0.5" />
                    ))}
                </g>

                {/* Animated gradient beams */}
                {pathData.map((d, i) => (
                    <motion.path
                        key={`beam-${i}`}
                        d={d}
                        stroke={`url(#gradient-${i})`}
                        strokeWidth="1"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 1],
                            opacity: [0, 0.2, 0.4, 0], // Reduced opacity
                        }}
                        transition={{
                            duration: animations[i].duration,
                            delay: animations[i].delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                <defs>
                    {pathData.map((_, i) => (
                        <linearGradient
                            key={`gradient-${i}`}
                            id={`gradient-${i}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#18CCFC" stopOpacity="0" />
                            <stop offset="20%" stopColor="#18CCFC" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#6344F5" stopOpacity="0.5" />
                            <stop offset="80%" stopColor="#AE48FF" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>
            </svg>
        </div>
    );
});

BackgroundBeams.displayName = "BackgroundBeams";
