"use client";

import React from "react";
import { Wrapper } from "./wrapper";
import { IconShieldCheck, IconBrandYoutube, IconInfoCircle, IconLock } from "@tabler/icons-react";
import Link from "next/link";

export function AboutVidzara() {
    return (
        <section className="bg-background relative overflow-hidden border-t border-border/20 py-8 md:py-12" id="about">
            <Wrapper className="py-6 md:py-8 max-w-5xl">
                <div className="bg-card/20 border border-border/40 rounded-xl p-5 md:p-8 backdrop-blur-xs relative overflow-hidden">
                    {/* Background Subtle Glow */}
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Column 1: Core Purpose */}
                        <div className="md:col-span-1 space-y-3">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                                <IconInfoCircle className="w-5 h-5 text-primary" />
                                <h4>What is Vidzara?</h4>
                            </div>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                Vidzara is an AI content creator platform. We help creators write video scripts, optimize metadata (SEO titles, tags, descriptions), brainstorm thumbnail concepts, and analyze growth.
                            </p>
                            <div className="flex gap-3 text-xs pt-1">
                                <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                                <span className="text-muted-foreground/30">|</span>
                                <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
                            </div>
                        </div>

                        {/* Column 2: Google & YouTube Usage */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                                <IconShieldCheck className="w-5 h-5 text-primary" />
                                <h4>Google OAuth & API Services</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
                                        <IconLock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>Secure Sign-In</span>
                                    </div>
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        We request basic profile info (email, name, picture) via Google Sign-In to secure your account.
                                    </p>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
                                        <IconBrandYoutube className="w-3.5 h-3.5 text-red-500" />
                                        <span>Growth Analytics</span>
                                    </div>
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        We request read-only permissions (<code className="text-[10px] bg-muted px-1 rounded font-mono">youtube.readonly</code>, <code className="text-[10px] bg-muted px-1 rounded font-mono">yt-analytics.readonly</code>) to display channel performance insights in your private dashboard.
                                    </p>
                                </div>
                            </div>

                            <p className="text-muted-foreground/80 text-[10px] leading-relaxed border-t border-border/30 pt-3">
                                Vidzara never requests write access. We cannot upload, edit, or delete your videos. Our service complies with the <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">YouTube API Terms</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </section>
    );
}
