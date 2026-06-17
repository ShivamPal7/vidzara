"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wrapper } from "./wrapper";
import { IconShieldCheck, IconBrandYoutube, IconInfoCircle, IconArrowRight, IconLock } from "@tabler/icons-react";
import Link from "next/link";

export function Disclosure() {
    return (
        <section className="bg-background relative overflow-hidden border-t border-border/30" id="disclosure">
            {/* Background Glows to match marketing design */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-primary/5 blur-[80px] rounded-full pointer-events-none z-0" />
            
            <Wrapper className="relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-semibold mb-3 md:mb-4">
                        Google Services & Data Transparency
                    </h2>
                    <p className="text-muted-foreground text-base md:text-xl">
                        How Vidzara securely integrates with Google and YouTube to power your experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
                    {/* Left Column: App Purpose */}
                    <motion.div 
                        initial={{ opacity: 0, x: -25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-xs"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <IconInfoCircle className="w-6 h-6" />
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold">What is Vidzara?</h3>
                            </div>
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                                Vidzara is a production-grade content creator suite designed to help video creators generate, optimize, and evaluate social media video assets. We provide AI tools that build engaging scripts (for Shorts, Reels, and YouTube), write optimized metadata (SEO titles, tags, hashtags, descriptions), generate structured thumbnail concepts, and check video scripts for policy compliance and content safety.
                            </p>
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                Our goal is to streamline the creation process, saving you time and giving you actionable insights into channel consistency and content performance.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/30 flex flex-wrap gap-4 text-sm">
                            <Link href="/privacy" className="text-primary hover:underline flex items-center gap-1.5 font-medium">
                                Privacy Policy <IconArrowRight className="w-4 h-4" />
                            </Link>
                            <span className="text-muted-foreground/30">|</span>
                            <Link href="/terms" className="text-primary hover:underline flex items-center gap-1.5 font-medium">
                                Terms of Service <IconArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Column: Google API Usage */}
                    <motion.div
                        initial={{ opacity: 0, x: 25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-card/30 border border-border/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-xs"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <IconShieldCheck className="w-6 h-6" />
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold">Google & YouTube Integration</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <span className="mt-0.5 p-1.5 rounded-lg bg-muted/50 text-muted-foreground shrink-0 h-fit">
                                        <IconLock className="w-4 h-4" />
                                    </span>
                                    <div>
                                        <h4 className="font-semibold text-sm sm:text-base mb-1">Secure Sign-In</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            We support Google OAuth for convenient, secure account creation. This only retrieves your basic profile info (email, name, and profile picture).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <span className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 h-fit">
                                        <IconBrandYoutube className="w-4 h-4" />
                                    </span>
                                    <div>
                                        <h4 className="font-semibold text-sm sm:text-base mb-1">Creator Growth Dashboard</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            To provide performance insights (posting frequency, growth trends, video benchmarks), you can link your channel. We request read-only permissions for your YouTube account details and analytics reports (<code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">youtube.readonly</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">yt-analytics.readonly</code>).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <span className="mt-0.5 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0 h-fit">
                                        <IconShieldCheck className="w-4 h-4" />
                                    </span>
                                    <div>
                                        <h4 className="font-semibold text-sm sm:text-base mb-1">Our Data Privacy Standard</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            Vidzara will never request write or modification permissions. We cannot post videos, modify playlists, or alter your account. We do not store your private analytics data, sell it, or share it with third-party advertisers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-xs text-muted-foreground/70 leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                            Our use of information received from Google APIs adheres to the <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">YouTube API Services Terms of Service</a> and the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Privacy Policy</a>.
                        </div>
                    </motion.div>
                </div>
            </Wrapper>
        </section>
    );
}
