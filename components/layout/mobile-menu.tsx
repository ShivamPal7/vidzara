"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface Props {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    navItems: Array<{ name: string; href: string }>;
}

const MobileMenu = ({ isOpen, setIsOpen, navItems }: Props) => {
    if (!isOpen) return null;

    return (
        <div className="lg:hidden flex flex-col flex-1 px-4 pb-6 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="flex flex-col items-start flex-1 w-full space-y-2 py-4">
                {navItems.map((item, index) => (
                    <li
                        key={index}
                        onClick={() => setIsOpen(false)}
                        className="w-full"
                        style={{
                            animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                        }}
                    >
                        <Link
                            href={item.href}
                            className="flex items-center w-full text-start px-4 py-3 text-base hover:text-primary font-medium transition transform rounded-lg text-foreground active:scale-95 hover:bg-foreground/5 active:opacity-80"
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>

            <div
                className="flex flex-col gap-3 pt-4"
                style={{
                    animation: `slideIn 0.3s ease-out ${navItems.length * 0.1}s both`
                }}
            >
                <Button
                    size="lg"
                    variant="cta"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                    asChild
                >
                    <Link href="/login" className="flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4" />
                        Try Vidzara Now
                    </Link>
                </Button>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default MobileMenu;
