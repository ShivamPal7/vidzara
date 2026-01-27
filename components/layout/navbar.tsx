"use client";

import { cn } from "@/lib/utils";
import { MenuIcon, XIcon, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import MobileMenu from "./mobile-menu";

const navItems = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/#contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div className="relative w-full h-full">
            {/* Top gradient blur effect */}
            <div className="z-50 hidden lg:block fixed pointer-events-none inset-x-0 h-[88px] bg-background/80 backdrop-blur-sm [mask:linear-gradient(to_bottom,#000_20%,transparent_calc(100%-20%))]"></div>

            <header
                className={cn(
                    "fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-12 z-50 transition-all duration-300 ease-in-out",
                    isOpen ? "h-[calc(100dvh-2rem)]" : "h-16 md:h-16"
                )}
            >
                <div className="backdrop-blur-xl rounded-xl lg:rounded-full border-2 border-border/80 dark:border-border/50 h-full flex flex-col justify-center overflow-hidden relative bg-background/70 dark:bg-background/70">
                    <div className="flex items-center justify-between w-full px-6 h-16 lg:h-full shrink-0">
                        {/* Logo */}
                        <div className="flex items-center flex-1 lg:flex-none">
                            <Link href="/" className="relative z-50 flex items-center gap-2 group">
                                <div className="relative h-8 w-8 sm:h-10 sm:w-10">
                                    <Image
                                        src="/logo.png"
                                        alt="Vidzara Logo"
                                        fill
                                        className="object-contain transition-all group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                                        priority
                                    />
                                </div>
                                <span className="text-lg sm:text-xl font-bold tracking-tight flex items-center">
                                    Vidzara
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation - Centered */}
                        <div className="lg:flex items-center hidden gap-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="text-base text-foreground hover:text-primary font-medium transition-colors px-4 py-2 hover:bg-foreground/5 rounded-lg"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Right side buttons */}
                        <div className="flex items-center gap-2 lg:gap-3">
                            <Button
                                variant="cta"
                                size="lg"
                                className="hidden lg:flex h-12 px-6 text-base [&_svg]:size-5!"
                                asChild
                            >
                                <Link href="/login" className="flex items-center gap-2">
                                    <Zap className="" fill="currentColor" />
                                    Try Vidzara Now
                                </Link>
                            </Button>
                            <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setIsOpen((prev) => !prev)}
                                className="lg:hidden"
                            >
                                {isOpen ? <XIcon className="size-4 duration-300" /> : <MenuIcon className="size-4 duration-300" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} navItems={navItems} />
                </div>
            </header>
        </div>
    );
}
