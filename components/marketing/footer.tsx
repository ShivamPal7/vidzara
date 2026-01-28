"use client";

import React from "react";
import Link from "next/link";
import { Wrapper } from "@/components/marketing/wrapper";
import { Zap, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/30 border-t border-border/50 ">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
                    {/* Column 1 - Brand */}
                    <div className="col-span-2 lg:col-span-1 pr-4">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image src={"/logo.png"} alt="Vidzara Logo" width={32} height={32} />
                            <span className="font-bold text-xl tracking-tight">Vidzara</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            AI tools to grow faster on YouTube & social media.
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                            Built for creators worldwide.
                        </p>
                    </div>

                    {/* Column 2 - Product */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link href="#workflows" className="hover:text-foreground transition-colors">Workflows</Link></li>
                            <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                            <li><Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link></li>
                            <li><Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 - Tools */}
                    <div>
                        <h4 className="font-semibold mb-4">Tools</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Video SEO Generator</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Script Writer</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Thumbnail Concepts</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Hook Detector</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Competitor Analysis</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Content Safety Check</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 - Resources */}
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Creator Guides</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Affiliate Program</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Updates / Changelog</Link></li>
                        </ul>
                    </div>

                    {/* Column 5 - Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
                            <li><Link href="mailto:support@vidzara.com" className="hover:text-foreground transition-colors">Support</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground order-2 md:order-1">
                        © Vidzara {currentYear}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 order-1 md:order-2">
                        <SocialLink href="#" icon={<Youtube className="w-5 h-5" />} label="YouTube" />
                        <SocialLink href="#" icon={<Twitter className="w-4 h-4" />} label="Twitter" />
                        <SocialLink href="#" icon={<Instagram className="w-4 h-4" />} label="Instagram" />
                        <SocialLink href="#" icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link
            href={href}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
            aria-label={label}
        >
            {icon}
        </Link>
    );
}
