"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh w-full items-center justify-center px-4 py-6 md:p-10 overflow-hidden bg-background">

            {/* Glow Effects */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/15 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-accent/10 blur-[100px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-0 right-0 w-[200px] h-[200px] md:w-[300px] md:h-[300px] bg-primary/10 blur-[80px] rounded-full pointer-events-none z-0" />

            {/* Dot Grid Pattern */}
            <div
                className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                    backgroundSize: '50px 50px',
                    color: 'var(--foreground)',
                    opacity: 0.03
                }}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, var(--background) 100%)',
                    opacity: 0.5
                }}
            />

            {/* Logo */}
            <div className="hidden md:flex items-center absolute top-8 left-8 z-50 animate-fade-in">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative h-10 w-10">
                        <Image
                            src="/logo.png"
                            alt="Vidzara Logo"
                            fill
                            className="object-contain transition-all group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                            priority
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Vidzara
                    </span>
                </Link>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {children}
            </motion.div>
        </div>
    );
}
