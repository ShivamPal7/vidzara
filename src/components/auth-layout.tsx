"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const stagger = {
    container: {
        animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    },
    item: {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    },
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh w-full">

            {/* ── LEFT PANEL ── */}
            <div
                className="relative hidden lg:flex lg:w-[50%] xl:w-[48%] flex-col overflow-hidden"
                style={{ background: "oklch(0.10 0.016 272)" }}
            >
                {/* Orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                        className="animate-orb-a absolute -top-48 -left-24 h-[600px] w-[600px] rounded-full"
                        style={{
                            background: "radial-gradient(circle, oklch(0.42 0.20 283 / 0.55) 0%, transparent 70%)",
                            filter: "blur(1px)",
                        }}
                    />
                    <div
                        className="animate-orb-b absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full"
                        style={{
                            background: "radial-gradient(circle, oklch(0.38 0.18 305 / 0.40) 0%, transparent 70%)",
                            filter: "blur(1px)",
                        }}
                    />
                </div>

                {/* Noise texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Grid */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                        backgroundSize: "56px 56px",
                    }}
                />

                {/* Edge vignette */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 80% at 40% 40%, transparent 30%, oklch(0.10 0.016 272 / 0.8) 100%)",
                    }}
                />

                {/* Content — three-zone layout */}
                <div className="relative z-10 flex h-full flex-col px-12 xl:px-16 py-12">

                    {/* Zone 1: Logo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link href="/" className="group flex w-fit items-center gap-3">
                            <div className="relative h-11 w-11 shrink-0">
                                <Image
                                    src="/logo.png"
                                    alt="Vidzara"
                                    fill
                                    className="object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_16px_oklch(0.65_0.22_285/0.9)]"
                                    priority
                                />
                            </div>
                            <span className="text-base font-semibold tracking-tight text-white/80">
                                Vidzara
                            </span>
                        </Link>
                    </motion.div>

                    {/* Zone 2: Headline — vertically centered */}
                    <motion.div
                        variants={stagger.container}
                        initial="initial"
                        animate="animate"
                        className="my-auto"
                    >
                        <motion.p
                            variants={stagger.item}
                            className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25"
                        >
                            Creator intelligence
                        </motion.p>

                        <motion.h2
                            variants={stagger.item}
                            className="text-[2.6rem] xl:text-[3rem] font-bold leading-[1.06] tracking-[-0.03em] text-white"
                        >
                            Every video,
                            <br />
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(125deg, oklch(0.72 0.14 285) 0%, oklch(0.62 0.19 305) 100%)",
                                }}
                            >
                                optimised.
                            </span>
                        </motion.h2>

                        <motion.p
                            variants={stagger.item}
                            className="mt-5 max-w-[260px] text-[0.8125rem] leading-[1.7] text-white/35"
                        >
                            Scripts, SEO, hooks, and growth insights powered by AI built for creators.
                        </motion.p>

                        {/* Stats */}
                        <motion.div
                            variants={stagger.item}
                            className="mt-10 flex items-center gap-0 divide-x divide-white/10"
                        >
                            {[
                                { num: "50K+", label: "Creators" },
                                { num: "2.4M", label: "Videos" },
                                { num: "4.9★", label: "Rating" },
                            ].map((s) => (
                                <div key={s.label} className="pr-7 pl-0 first:pl-0 [&:not(:first-child)]:pl-7">
                                    <div className="text-[1.125rem] font-bold text-white/70 tabular-nums">{s.num}</div>
                                    <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/22">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Zone 3: Copyright */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="text-[11px] text-white/18"
                    >
                        © {new Date().getFullYear()} Vidzara · All rights reserved
                    </motion.p>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 sm:px-10">

                {/* Very faint dot grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.018]"
                    style={{
                        backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                {/* Soft center glow */}
                <div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-[100px]"
                    style={{ background: "var(--primary)" }}
                />

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-[368px]"
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
